const router = require("express").Router();

const Incident = require("../models/Incident.js")
const isSignedIn = require("../middleware/is-signed-in.js")

router.get("/", async (req, res)=>{
    const incidents = await Incident.find();

    res.render("incidents/index.ejs", {
        incidents: incidents
    })
})

router.get("/new", isSignedIn, (req, res)=>{
    res.render("incidents/new.ejs")
})

router.get("/:incidentId", async (req,res) =>{
    const incident = await Incident.findById(req.params.incidentId);

    if (!incident) {
        return res.status(404).send("Incident not found!")
    }

    res.render("incidents/show.ejs", {
        incident: incident
    })
})

router.post("/", isSignedIn, async (req,res)=>{
    req.body.createdBy = req.session.user._id

    const incident = await Incident.create(req.body);

    res.redirect(`/incidents/${incident._id}`)
})  

module.exports = router;