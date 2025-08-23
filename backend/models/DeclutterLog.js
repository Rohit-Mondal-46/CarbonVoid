// models/DeclutterLog.js
const mongoose = require("mongoose");

const declutterLogSchema = new mongoose.Schema({
  suggestions: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DeclutterLog", declutterLogSchema);
