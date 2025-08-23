const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Activity = require("../models/Activity");
const UserFootprintCache = require("../models/UserFootprintCache");

/**
 * @route GET /api/activity-stats/:userId
 * @desc Get activity statistics (CO2e, duration, data usage) for a specific user
 * @access Private
 */
const getActivityStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "userId is required",
    });
  }

  // Check if user exists
  const userExists = await User.findById(userId).select("_id");

  if (!userExists) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  // Try to get data from cache first
  const cachedData = await UserFootprintCache.findOne({ user: userId });

  if (cachedData) {
    // For cached data, we only have CO2e and count, so we need to get duration and data usage separately
    const activityAggregates = await Activity.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: "$duration" },
          totalDataUsed: { $sum: "$dataUsed" }
        }
      }
    ]);

    const aggregateResult = activityAggregates[0] || {};

    return res.json({
      success: true,
      data: {
        totalCO2e: cachedData.totalCO2e,
        totalDuration: aggregateResult.totalDuration || 0,
        totalDataUsed: aggregateResult.totalDataUsed || 0,
        activityCount: cachedData.activityCount,
        lastUpdated: cachedData.updatedAt.toISOString(),
      },
    });
  }

  // If no cache, calculate everything from activities
  const activityAggregates = await Activity.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalCO2e: { $sum: "$co2e" },
        totalDuration: { $sum: "$duration" },
        totalDataUsed: { $sum: "$dataUsed" },
        count: { $sum: 1 }
      }
    }
  ]);

  const aggregateResult = activityAggregates[0] || {};

  res.json({
    success: true,
    data: {
      totalCO2e: aggregateResult.totalCO2e || 0,
      totalDuration: aggregateResult.totalDuration || 0,
      totalDataUsed: aggregateResult.totalDataUsed || 0,
      activityCount: aggregateResult.count || 0,
    },
  });
});

module.exports = { getActivityStats };
