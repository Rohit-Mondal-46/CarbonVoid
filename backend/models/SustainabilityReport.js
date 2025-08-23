// models/SustainabilityReport.js
const mongoose = require("mongoose");

const sustainabilityReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  generatedAt: { type: Date, default: Date.now },
  suggestions: [{ type: String }],
  metrics: { type: Object }, // stores JSON
});

module.exports = mongoose.model("SustainabilityReport", sustainabilityReportSchema);
