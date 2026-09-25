const express = require("express");
const prisma = require("../lib/prisma");
const { COMPONENTS, FAILURE_MODES, COMPLIANCE_CLAUSES } = require("../lib/seedData");
const { AI_SUGGESTIONS } = require("../lib/aiSuggestions");

const router = express.Router();

// GET /api/workspace — bootstrap payload: workspace settings + static reference data.
router.get("/", async (req, res) => {
  const { workspace } = req;
  const onboardingCount = await prisma.onboardingResponse.count({
    where: { workspaceId: workspace.id, userId: req.user.id },
  });
  res.json({
    id: workspace.id,
    name: workspace.name,
    alarpFrom: workspace.alarpFrom,
    unacceptableFrom: workspace.unacceptableFrom,
    chatScope: workspace.chatScope,
    sheathApplied: workspace.sheathApplied,
    chatModel: workspace.chatModel,
    components: COMPONENTS,
    aiSuggestions: AI_SUGGESTIONS,
    onboardingCompleted: onboardingCount > 0,
  });
});

// PATCH /api/workspace — update thresholds / chat scope / sheath / chat model (Settings + Workspace tabs).
router.patch("/", async (req, res) => {
  const { alarpFrom, unacceptableFrom, chatScope, name, sheathApplied, chatModel } = req.body;
  const data = {};
  if (typeof alarpFrom === "number") data.alarpFrom = alarpFrom;
  if (typeof unacceptableFrom === "number") data.unacceptableFrom = unacceptableFrom;
  if (chatScope === "redirect" || chatScope === "refuse") data.chatScope = chatScope;
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof sheathApplied === "boolean") data.sheathApplied = sheathApplied;
  if (typeof chatModel === "string" && chatModel.trim()) data.chatModel = chatModel.trim();

  const updated = await prisma.workspace.update({
    where: { id: req.workspace.id },
    data,
  });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Updated workspace settings (${Object.keys(data).join(", ") || "no-op"}).`,
    },
  });

  res.json(updated);
});

// GET /api/workspace/audit-log — recent activity feed (capped at 50, newest first).
router.get("/audit-log", async (req, res) => {
  const entries = await prisma.auditLogEntry.findMany({
    where: { workspaceId: req.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });
  res.json(entries);
});

// GET /api/workspace/export — full JSON backup of the workspace's live data.
router.get("/export", async (req, res) => {
  const [workspace, failureModes, compliance, snapshots, auditLog] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: req.workspace.id } }),
    prisma.failureMode.findMany({ where: { workspaceId: req.workspace.id } }),
    prisma.complianceClause.findMany({ where: { workspaceId: req.workspace.id }, include: { evidence: true } }),
    prisma.snapshot.findMany({ where: { workspaceId: req.workspace.id } }),
    prisma.auditLogEntry.findMany({ where: { workspaceId: req.workspace.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  res.json({
    exportedAt: new Date().toISOString(),
    workspace: {
      name: workspace.name,
      alarpFrom: workspace.alarpFrom,
      unacceptableFrom: workspace.unacceptableFrom,
      chatScope: workspace.chatScope,
      sheathApplied: workspace.sheathApplied,
      chatModel: workspace.chatModel,
    },
    failureModes,
    compliance,
    snapshots,
    auditLog,
  });
});

// POST /api/workspace/import — restore failure modes + compliance from a previous export.
// Replaces the current workspace's failure modes and compliance clauses.
router.post("/import", async (req, res) => {
  const { failureModes, compliance } = req.body || {};
  if (!Array.isArray(failureModes) || !Array.isArray(compliance)) {
    return res.status(400).json({ error: "failureModes[] and compliance[] are required" });
  }

  await prisma.$transaction(async (tx) => {
    await tx.failureMode.deleteMany({ where: { workspaceId: req.workspace.id } });
    await tx.complianceClause.deleteMany({ where: { workspaceId: req.workspace.id } });

    if (failureModes.length) {
      await tx.failureMode.createMany({
        data: failureModes.map((fm) => ({
          workspaceId: req.workspace.id,
          componentId: fm.componentId,
          mode: fm.mode,
          effect: fm.effect || "",
          cause: fm.cause || "",
          standard: fm.standard || "ISO 14971",
          s: Number(fm.s) || 1,
          o: Number(fm.o) || 1,
          d: Number(fm.d) || 1,
          mitigation: fm.mitigation || "",
          createdById: req.user.id,
        })),
      });
    }

    if (compliance.length) {
      await tx.complianceClause.createMany({
        data: compliance.map((c) => ({
          workspaceId: req.workspace.id,
          clause: c.clause,
          title: c.title,
          mapped: c.mapped || "",
          status: ["complete", "partial", "pending"].includes(c.status) ? c.status : "pending",
        })),
      });
    }

    await tx.auditLogEntry.create({
      data: {
        workspaceId: req.workspace.id,
        userId: req.user.id,
        text: `Imported backup: ${failureModes.length} failure mode(s), ${compliance.length} compliance clause(s).`,
      },
    });
  });

  res.status(204).end();
});

// POST /api/workspace/reset — revert to the original seeded ultrasound-probe data set.
router.post("/reset", async (req, res) => {
  await prisma.$transaction(async (tx) => {
    await tx.failureMode.deleteMany({ where: { workspaceId: req.workspace.id } });
    await tx.complianceClause.deleteMany({ where: { workspaceId: req.workspace.id } });
    await tx.snapshot.deleteMany({ where: { workspaceId: req.workspace.id } });

    await tx.failureMode.createMany({
      data: FAILURE_MODES.map((fm) => ({ ...fm, workspaceId: req.workspace.id, createdById: req.user.id })),
    });
    await tx.complianceClause.createMany({
      data: COMPLIANCE_CLAUSES.map((c) => ({ ...c, workspaceId: req.workspace.id })),
    });
    await tx.workspace.update({
      where: { id: req.workspace.id },
      data: { sheathApplied: true },
    });

    await tx.auditLogEntry.create({
      data: {
        workspaceId: req.workspace.id,
        userId: req.user.id,
        text: "Data reset to the original seeded ultrasound-probe data set.",
      },
    });
  });

  res.status(204).end();
});

module.exports = router;
