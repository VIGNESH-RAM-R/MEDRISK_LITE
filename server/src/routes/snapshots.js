const express = require("express");
const prisma = require("../lib/prisma");
const { computeRpn, classifyRpn } = require("../lib/fmea");

const router = express.Router();

const STATUS_WEIGHT = { complete: 100, partial: 50, pending: 0 };

async function computeCurrentStats(workspace) {
  const [failureModes, compliance] = await Promise.all([
    prisma.failureMode.findMany({ where: { workspaceId: workspace.id } }),
    prisma.complianceClause.findMany({ where: { workspaceId: workspace.id } }),
  ]);
  const settings = { alarpFrom: workspace.alarpFrom, unacceptableFrom: workspace.unacceptableFrom };
  const bands = { Acceptable: 0, ALARP: 0, Unacceptable: 0 };
  failureModes.forEach((f) => bands[classifyRpn(computeRpn(f.s, f.o, f.d), settings)]++);
  const avg = failureModes.length
    ? Math.round(failureModes.reduce((a, f) => a + computeRpn(f.s, f.o, f.d), 0) / failureModes.length)
    : 0;
  const compScore = compliance.length
    ? Math.round(compliance.reduce((a, c) => a + STATUS_WEIGHT[c.status], 0) / compliance.length)
    : 0;
  return { avg, bands, count: failureModes.length, compScore };
}

// GET /api/snapshots
router.get("/", async (req, res) => {
  const snapshots = await prisma.snapshot.findMany({
    where: { workspaceId: req.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json(snapshots);
});

// POST /api/snapshots  { label: string }
router.post("/", async (req, res) => {
  const { label } = req.body;
  if (!label || typeof label !== "string" || !label.trim()) {
    return res.status(400).json({ error: "label is required" });
  }

  const stats = await computeCurrentStats(req.workspace);

  const snapshot = await prisma.snapshot.create({
    data: {
      workspaceId: req.workspace.id,
      label: label.trim(),
      statsJson: stats,
      createdById: req.user.id,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Risk snapshot saved: "${snapshot.label}".`,
    },
  });

  res.status(201).json(snapshot);
});

// DELETE /api/snapshots/:id
router.delete("/:id", async (req, res) => {
  const existing = await prisma.snapshot.findFirst({
    where: { id: req.params.id, workspaceId: req.workspace.id },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  await prisma.snapshot.delete({ where: { id: existing.id } });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: "Risk snapshot deleted.",
    },
  });

  res.status(204).end();
});

module.exports = router;
