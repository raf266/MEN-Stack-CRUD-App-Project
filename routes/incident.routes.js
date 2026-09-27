const router = require("express").Router();

const Incident = require("../models/Incident.js")
const isSignedIn = require("../middleware/is-signed-in.js");
const AffectedSystem = require("../models/AffectedSystem.js");

router.get("/", async (req, res)=>{
    const incidents = await Incident.find({
        isDeleted: false
    });

    res.render("incidents/index.ejs", {
        incidents: incidents
    })
})

router.get("/new", isSignedIn, (req, res)=>{
    res.render("incidents/new.ejs")
})

router.get("/:incidentId", async (req,res) =>{
    const incident = await Incident.findById(req.params.incidentId);

    if (!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    const affectedSystems = await AffectedSystem.find({
        incident: incident._id
    })

    res.render("incidents/show.ejs", {
        incident: incident,
        affectedSystems: affectedSystems
    })
})

router.get("/:incidentId/edit", isSignedIn, async (req, res)=>{
    const incident = await Incident.findById(req.params.incidentId)

    if (!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    if (incident.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are not authorized to edit this incident")
    }

    res.render("incidents/edit.ejs", {
        incident: incident
    })
})


router.post("/", isSignedIn, async (req,res)=>{
    req.body.createdBy = req.session.user._id

    const incident = await Incident.create(req.body);

    res.redirect(`/incidents/${incident._id}`)
})  

router.put("/:incidentId", isSignedIn, async (req,res)=>{
    const incident = await Incident.findById(req.params.incidentId)

    if (!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    if (incident.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are not authorized to edit this incident!")
    }

    incident.title = req.body.title
    incident.description = req.body.description
    incident.severity = req.body.severity
    incident.status = req.body.status

    await incident.save()

    res.redirect(`/incidents/${incident._id}`)
})

router.delete("/:incidentId", isSignedIn, async (req, res) =>{
    const incident = await Incident.findById(req.params.incidentId)

    if (!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    if (incident.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are not authorized to delete this incident!")
    }

    incident.isDeleted = true;
    incident.deletedAt = new Date();

    await incident.save();

    res.redirect("/incidents")
})

module.exports = router;