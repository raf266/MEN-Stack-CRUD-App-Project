const mongoose = require("mongoose");

const investigationNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {timestamps: true});

const InvestigationNote = mongoose.model("InvestigationNote", investigationNoteSchema);

module.exports = InvestigationNote;
