const { activityService } = require("../services/activityService.js");
const { ActivityCreateSchema } = require("../models/Activity.js");

const ActivityController = {
  async createActivity(req, res) {
    try {
      // If ActivityCreateSchema has a parse method (e.g., zod-like), use it; else fall back
      const data =
        ActivityCreateSchema && typeof ActivityCreateSchema.parse === "function"
          ? ActivityCreateSchema.parse(req.body)
          : req.body;

      const activity = await activityService.createActivity(data);
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to create activity" });
    }
  },

  async getCarbonFootprint(req, res) {
    try {
      const footprint = await activityService.getUserCarbonFootprint(
        req.params.userId
      );
      res.json(footprint);
    } catch {
      res.status(500).json({ error: "Failed to calculate footprint" });
    }
  },

  async getEmissionsBreakdown(req, res) {
    try {
      const range = req.query.range || "all"; // "day" | "week" | "month" | "year" | "all"
      const breakdown = await activityService.getEmissionsBreakdown(
        req.params.userId,
        range
      );
      res.json(breakdown);
    } catch {
      res.status(500).json({ error: "Failed to get breakdown" });
    }
  },

  async getActivity(req, res) {
    try {
      const activity = await activityService.getActivityById(req.params.id);
      if (activity) {
        res.json(activity);
      } else {
        res.status(404).json({ error: "Not found" });
      }
    } catch {
      res.status(500).json({ error: "Failed to get activity" });
    }
  },
};

module.exports = { ActivityController };
