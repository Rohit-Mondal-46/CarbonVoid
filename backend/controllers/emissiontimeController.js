const Activity = require('../models/Activity'); // Mongoose model
const { getTimeRange } = require('../utils/time');
const asyncHandler = require('../utils/asyncHandler');

// GET /:userId/emissions/:timeframe
const getTimeBasedEmissions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const timeframe = req.query.timeframe || 'month'; // default
  const { start, end } = getTimeRange(timeframe);

  console.log('Query Parameters:', {
    userId,
    timeframe,
    start: start.toISOString(),
    end: end.toISOString()
  });

  try {
    const emissions = await Activity.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalCO2e: { $sum: "$co2e" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('Query Results:', emissions);

    res.json(emissions.map(e => ({
      date: e._id,
      totalCO2e: e.totalCO2e
    })));
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /:userId/emissions/services
const getServiceWiseEmissions = asyncHandler(async (req, res) => {
  console.log('--- EXECUTING SERVICE WISE FUNCTION ---');
  const { userId } = req.params;
  console.log('Service-wise userId:', userId);

  try {
    const result = await Activity.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$service",
          totalCO2e: { $sum: "$co2e" }
        }
      }
    ]);

    console.log('Raw service-wise results:', result);

    res.json({
      endpoint: 'service-wise',
      data: result.map(r => ({
        service: r._id,
        co2e: r.totalCO2e
      }))
    });
  } catch (error) {
    console.error('Service-wise Error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = {
  getTimeBasedEmissions,
  getServiceWiseEmissions
};
