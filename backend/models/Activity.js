// models/Activity.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: String, required: true },
    duration: { type: Number, required: true },
    dataUsed: { type: Number, required: true },
    resolution: { type: String },
    co2e: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ user: 1 });
activitySchema.index({ createdAt: 1 });

module.exports = mongoose.model("Activity", activitySchema);
