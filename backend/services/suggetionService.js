const { GeminiService } = require("./geminiService");
const { User } = require("../models/User");
const { Activity } = require("../models/Activity");
const { UserFootprintCache } = require("../models/UserFootprintCache");
const { SustainabilityReport } = require("../models/SustainabilityReport");

async function analyzeUserData(userId) {
  // Verify user exists first
  const user = await User.findById(userId).select("_id");
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  const [activities, footprint] = await Promise.all([
    Activity.find({ userId }),
    UserFootprintCache.findOne({ userId })
  ]);

  const videoHours = activities
    .filter(a => ["youtube", "netflix"].includes(a.service))
    .reduce((sum, a) => sum + a.duration / 60, 0);

  const cloudStorageGB = activities
    .filter(a => a.service === "google_drive")
    .reduce((sum, a) => sum + (a.dataUsed || 0), 0) / 1024;

  const activityBreakdown = activities.reduce((acc, a) => {
    if (!acc[a.service]) {
      acc[a.service] = { hours: 0, dataGB: 0, sessions: 0 };
    }
    acc[a.service].hours += a.duration / 60;
    acc[a.service].dataGB += (a.dataUsed || 0) / 1024;
    acc[a.service].sessions += 1;
    return acc;
  }, {});

  const suggestions = await GeminiService.generateSuggestions({
    totalCO2e: footprint?.totalCO2e || 0,
    videoHours,
    cloudStorageGB,
    activityBreakdown
  });

  return {
    suggestions,
    metrics: {
      totalCO2e: footprint?.totalCO2e || 0,
      videoHours,
      cloudStorageGB,
      activityBreakdown
    }
  };
}

const SuggestionService = {
  async generateReport(userId) {
    const { metrics, suggestions } = await analyzeUserData(userId);

    return await SustainabilityReport.create({
      userId,
      suggestions,
      metrics
    });
  }
};

module.exports = { SuggestionService };
