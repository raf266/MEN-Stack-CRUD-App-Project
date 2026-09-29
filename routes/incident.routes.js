const router = require("express").Router();

const Incident = require("../models/Incident.js")
const isSignedIn = require("../middleware/is-signed-in.js")
const AffectedSystem = require("../models/AffectedSystem.js")
const InvestigationNote = require("../models/InvestigationNote.js")
const PDFDocument = require("pdfkit")
const Evidence = require("../models/Evidence.js")
const upload = require("../middleware/upload.js")


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

router.get("/:incidentId/export", isSignedIn, async (req,res)=>{
    const incident = await Incident.findById(req.params.incidentId)

    if (!incident || incident.isDeleted)
        return res.status(404).send("Incident not found!")

    const affectedSystems = await AffectedSystem.find({
        incident: incident._id,
        isDeleted: false
    })

    const investigationNotes = await InvestigationNote.find({incident: incident._id}).populate("author")

    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=incident-report.pdf")

    doc.pipe(res)

    doc.fontSize(22).text("SOCTrack Incident Report")
    doc.moveDown()

    doc.fontSize(16).text(incident.title)
    doc.moveDown()

    doc.fontSize(12).text(`Description: ${incident.description}`)
    doc.text(`Severity: ${incident.severity}`)
    doc.text(`Status: ${incident.status}`)
    doc.text(`Created: ${incident.createdAt.toLocaleDateString()}`)

    doc.moveDown()
    doc.fontSize(16).text("Affected Systems")

    affectedSystems.forEach((system) =>{
        doc.fontSize(12).text(`Hostname: ${system.hostname}`)
        doc.text(`IP Address: ${system.ipAddress}`)
        doc.text(`Operating System: ${system.operatingSystem}`)
        doc.moveDown()
    })

    doc.fontSize(16).text("Investigation Notes")

    investigationNotes.forEach((note) =>{
        doc.fontSize(12).text(note.content)
        doc.text(`Author: ${note.author.username}`)
        doc.text(`Date: ${note.createdAt.toLocaleDateString()}`)
    })

    doc.end()
})

router.post("/:incidentId/evidence", isSignedIn, upload.single("evidence"), async (req,res)=>{
    const incident = await Incident.findById(req.params.incidentId)

    if(!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    const evidence = new Evidence({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: "/uploads/" + req.file.filename,
        incident: incident.id
    })

    await evidence.save()

    req.session.message = "Evidence uploaded successfully!"

    res.redirect(`/incidents/${incident._id}`)
})

router.get("/:incidentId", async (req,res) =>{
    const incident = await Incident.findById(req.params.incidentId);

    if (!incident || incident.isDeleted) {
        return res.status(404).send("Incident not found!")
    }

    const affectedSystems = await AffectedSystem.find({
        incident: incident._id,
        isDeleted: false
    })

    const investigationNotes = await InvestigationNote.find({incident: incident._id}).populate("author")

    res.render("incidents/show.ejs", {
        incident: incident,
        affectedSystems: affectedSystems,
        investigationNotes: investigationNotes,
        message: req.session.message
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

    req.session.message = "Incident created successfully!"

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