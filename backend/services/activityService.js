const mongoose = require('mongoose');
const { calculateEmissions, validateStreamingResolution } = require('../utils/emissionFactor');

// Import your Activity and UserFootprintCache schemas
const Activity = require('../models/Activity');
const UserFootprintCache = require('../models/UserFootprintCache');

// Valid time ranges
const TIME_RANGES = ['day', 'week', 'month', 'year', 'all'];

class ActivityService {
  async createActivity(data) {
    try {
      validateStreamingResolution(data.service, data.resolution || undefined);

      const co2e = calculateEmissions({
        service: data.service,
        duration: data.duration,
        dataUsed: data.dataUsed,
        resolution: data.resolution
      });

      // Create new activity
      const activity = await Activity.create({
        ...data,
        co2e,
        resolution: data.resolution || null
      });

      // Update user footprint cache
      await this.updateUserFootprintCache(data.userId);

      return activity;
    } catch (error) {
      console.error('Activity creation failed:', error);
      throw new Error(error.message || 'Failed to create activity');
    }
  }

  async getActivityById(id) {
    return Activity.findById(id).populate('user');
  }

  async getUserCarbonFootprint(userId) {
    try {
      const cached = await UserFootprintCache.findOne({ userId });

      if (cached) {
        return {
          totalCO2e: cached.totalCO2e,
          activityCount: cached.activityCount,
          lastUpdated: cached.updatedAt,
          isCached: true
        };
      }

      return await this.calculateFreshFootprint(userId);
    } catch (error) {
      console.error('Failed to get carbon footprint:', error);
      throw new Error('Failed to calculate footprint');
    }
  }

  async getEmissionsBreakdown(userId, range = 'all') {
    try {
      const dateFilter = this.getDateFilter(range);

      const results = await Activity.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: dateFilter.gte } } },
        {
          $group: {
            _id: '$service',
            co2e: { $sum: '$co2e' },
            duration: { $sum: '$duration' },
            dataUsed: { $sum: '$dataUsed' }
          }
        }
      ]);

      const total = results.reduce((sum, item) => sum + (item.co2e || 0), 0);

      return results.map(item => ({
        service: item._id,
        co2e: item.co2e || 0,
        duration: item.duration || 0,
        dataUsed: item.dataUsed || 0,
        percentage: total > 0 ? (item.co2e || 0) / total * 100 : 0
      }));
    } catch (error) {
      console.error('Failed to get emissions breakdown:', error);
      throw new Error('Failed to get breakdown');
    }
  }

  async updateUserFootprintCache(userId) {
    const footprint = await this.calculateFreshFootprint(userId);

    await UserFootprintCache.findOneAndUpdate(
      { userId },
      {
        totalCO2e: footprint.totalCO2e,
        activityCount: footprint.activityCount,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  }

  async calculateFreshFootprint(userId) {
    const result = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalCO2e: { $sum: '$co2e' },
          activityCount: { $sum: 1 }
        }
      }
    ]);

    if (!result.length) {
      return {
        totalCO2e: 0,
        activityCount: 0,
        updatedAt: new Date(),
        isCached: false
      };
    }

    return {
      totalCO2e: result[0].totalCO2e || 0,
      activityCount: result[0].activityCount,
      updatedAt: new Date(),
      isCached: false
    };
  }

  getDateFilter(range) {
    const now = new Date();
    const date = new Date(now);

    switch (range) {
      case 'day':
        date.setDate(date.getDate() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      case 'all':
        return { gte: new Date(0) };
    }

    return { gte: date };
  }
}

module.exports = new ActivityService();
