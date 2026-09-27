const router = require("express").Router()

const InvestigationNote = require("../models/InvestigationNote.js")
const Incident = require("../models/Incident.js")
const isSignedIn = require("../middleware/is-signed-in.js")


router.get("/:incidentId/notes/new", isSignedIn, async (req, res) => {

    const incident = await Incident.findById(req.params.incidentId)

    if (!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    if (incident.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are not authorized to add notes to this incident!")
    }

    res.render("investigation-notes/new.ejs", {
        incident: incident
    })
})


router.post("/:incidentId/notes", isSignedIn, async (req, res) => {

    const incident = await Incident.findById(req.params.incidentId)

    if (!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    if (incident.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are not authorized to add notes to this incident!")
    }

    await InvestigationNote.create({
        content: req.body.content,
        incident: incident._id,
        author: req.session.user._id
    })

    res.redirect(`/incidents/${incident._id}`)
})


module.exports = router