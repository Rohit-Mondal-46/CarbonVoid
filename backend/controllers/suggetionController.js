const { SuggestionService } = require("../services/suggetionService");
const SustainabilityReport = require("../models/SustainabilityReport");

const SuggestionController = {
  generateReport: async (req, res) => {
    const userId = req.params.userId;

    if (!userId || typeof userId !== "string") {
      res.status(400).json({ error: "Invalid user ID format" });
      return;
    }

    try {
      const report = await SuggestionService.generateReport(userId);
      res.json(report);
    } catch (error) {
      console.error("Report generation failed:", error);
      const status = error.message && error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        error: error.message || "Failed to generate report",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  getReports: async (req, res) => {
    try {
      const reports = await SustainabilityReport.find({
        user: req.params.userId,
      }).sort({ generatedAt: -1 });
      res.json(reports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      res.status(500).json({
        error: "Failed to fetch reports",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  },
};

module.exports = { SuggestionController };
