// models/UserFootprintCache.js
const mongoose = require("mongoose");

const userFootprintCacheSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    totalCO2e: { type: Number, required: true },
    activityCount: { type: Number, required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

userFootprintCacheSchema.index({ totalCO2e: 1 });

module.exports = mongoose.model("UserFootprintCache", userFootprintCacheSchema);
