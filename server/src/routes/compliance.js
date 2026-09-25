const express = require("express");
const prisma = require("../lib/prisma");
const { upload } = require("../middleware/upload");

const router = express.Router();

// GET /api/compliance
router.get("/", async (req, res) => {
  const clauses = await prisma.complianceClause.findMany({
    where: { workspaceId: req.workspace.id },
    // Not orderBy clause text — "Cl.10" sorts before "Cl.4" alphabetically.
    // cuids are roughly creation-ordered, which matches the seeded Cl.4..Cl.10 order.
    orderBy: { id: "asc" },
    include: { evidence: true },
  });
  res.json(clauses);
});

// PATCH /api/compliance/:id — update status
router.patch("/:id", async (req, res) => {
  const existing = await prisma.complianceClause.findFirst({
    where: { id: req.params.id, workspaceId: req.workspace.id },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const { status } = req.body;
  if (!["complete", "partial", "pending"].includes(status)) {
    return res.status(400).json({ error: "status must be complete|partial|pending" });
  }

  const updated = await prisma.complianceClause.update({
    where: { id: existing.id },
    data: { status },
  });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Set ${updated.clause} (${updated.title}) status to "${status}".`,
    },
  });

  res.json(updated);
});

// POST /api/compliance/:id/evidence/upload — real file upload (multipart/form-data, field name "file").
router.post("/:id/evidence/upload", upload.single("file"), async (req, res) => {
  const existing = await prisma.complianceClause.findFirst({
    where: { id: req.params.id, workspaceId: req.workspace.id },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });
  if (!req.file) return res.status(400).json({ error: "file is required" });

  const publicUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  const evidence = await prisma.evidence.create({
    data: {
      complianceClauseId: existing.id,
      fileUrl: publicUrl,
      fileName: req.file.originalname,
      uploadedById: req.user.id,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Attached evidence "${req.file.originalname}" to ${existing.clause}.`,
    },
  });

  res.status(201).json(evidence);
});

// DELETE /api/compliance/:id/evidence/:evidenceId
router.delete("/:id/evidence/:evidenceId", async (req, res) => {
  const clause = await prisma.complianceClause.findFirst({
    where: { id: req.params.id, workspaceId: req.workspace.id },
  });
  if (!clause) return res.status(404).json({ error: "Not found" });

  const evidence = await prisma.evidence.findFirst({
    where: { id: req.params.evidenceId, complianceClauseId: clause.id },
  });
  if (!evidence) return res.status(404).json({ error: "Not found" });

  await prisma.evidence.delete({ where: { id: evidence.id } });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Removed evidence "${evidence.fileName}" from ${clause.clause}.`,
    },
  });

  res.status(204).end();
});

module.exports = router;
