const router = require("express").Router()

const AffectedSystem = require("../models/AffectedSystem.js")
const Incident = require("../models/Incident.js")
const isSignedIn = require("../middleware/is-signed-in.js")

router.get("/:incidentId/systems/new", isSignedIn, async (req, res)=>{
    const incident = await Incident.findById(req.params.incidentId)

    if(!incident || incident.isDeleted ) {
        return res.status(403).send("Incident not found!")
    }
    if(incident.createdBy.toString() !== req.session.user._id.toString()){
        return res.status(403).send("You are not authorized to add systems to this incident!")
    }
       res.render("affected-systems/new.ejs", {
        incident: incident
       }) 
})

router.post("/:incidentId/systems", isSignedIn, async (req,res)=>{
    const incident = await Incident.findById(req.params.incidentId)

    if(!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    if(incident.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are not authorized to add systems to this incident!")
    }

    console.log(req.body)

    await AffectedSystem.create({
        hostname: req.body.hostname,
        ipAddress: req.body.ipAddress,
        operatingSystem: req.body.operatingSystem,
        incident: incident._id
    })
    res.redirect(`/incidents/${incident._id}`)
})

router.delete("/:incidentId/systems/:systemId", isSignedIn, async (req, res) =>{
    const incident = await Incident.findById(req.params.incidentId)

    if(!incident || incident.isDeleted){
        return res.status(404).send("Incident not found!")
    }

    if(incident.createdBy.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("You are no authorized to delete this system!")
    }
    const system = await AffectedSystem.findById(req.params.systemId)

    if(!system || system.isDeleted){
        return res.status(404).send("Affected system not found!")
    }

    system.isDeleted = true
    system.deletedAt = new Date()

    await system.save()

    res.redirect(`/incidents/${incident._id}`)
})

module.exports = router;