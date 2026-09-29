const mongoose = require("mongoose")

const evidenceSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    incident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
        required: true
    }
}, {timestamps: true})

const Evidence = mongoose.model("Evidence", evidenceSchema)

module.exports = Evidence