// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, maxlength: 255 }, // optional
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    footprint: { type: mongoose.Schema.Types.ObjectId, ref: "UserFootprintCache" },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "SustainabilityReport" }],
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

module.exports = mongoose.model("User", userSchema);
