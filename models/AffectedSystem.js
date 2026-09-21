const mongoose = require("mongoose");

const affectedSystemSchema = new mongoose.Schema({
  hostname: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true
  },
  operatingSystem: {
    type: String,
    required: true,
  },
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident",
    required: true,
  }
}, {timestamps: true});

const AffectedSystem = mongoose.model("AffectedSystem", affectedSystemSchema);

module.exports = AffectedSystem;
