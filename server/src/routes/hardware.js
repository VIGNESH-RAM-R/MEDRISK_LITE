const express = require("express");
const prisma = require("../lib/prisma");
const { requireUser } = require("../middleware/auth");

const router = express.Router();

// Which existing FailureMode each sensor type corresponds to (see lib/seedData.js).
const FAILURE_MODE_MATCH = {
  moisture: "Housing crack or seal breach",
  temperature: "Battery swelling or overheating",
};

// Device auth: the ESP32 can't do Clerk/OAuth, so it authenticates with a long
// random key (server/.env HARDWARE_DEVICE_KEY) sent via the "x-device-key" header.
function requireDeviceKey(req, res, next) {
  const expected = process.env.HARDWARE_DEVICE_KEY;
  if (!expected) {
    console.error("HARDWARE_DEVICE_KEY is not set in server/.env — rejecting hardware request.");
    return res.status(500).json({ error: "Server misconfigured: HARDWARE_DEVICE_KEY not set" });
  }
  const key = req.header("x-device-key");
  if (!key || key !== expected) {
    return res.status(401).json({ error: "Unauthorized — missing or invalid device key" });
  }
  next();
}

// POST /api/hardware/reading — device-authenticated, no Clerk session.
// Body: { sensorType: "moisture" | "temperature", value: number, thresholdBreached: boolean }
router.post("/reading", requireDeviceKey, async (req, res) => {
  const { sensorType, value, thresholdBreached } = req.body || {};

  if (typeof sensorType !== "string" || !sensorType.trim()) {
    return res.status(400).json({ error: "sensorType (string) is required" });
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return res.status(400).json({ error: "value (number) is required" });
  }
  if (typeof thresholdBreached !== "boolean") {
    return res.status(400).json({ error: "thresholdBreached (boolean) is required" });
  }

  const workspaceId = process.env.HARDWARE_WORKSPACE_ID;
  if (!workspaceId) {
    console.error("HARDWARE_WORKSPACE_ID is not set in server/.env — rejecting hardware request.");
    return res.status(500).json({ error: "Server misconfigured: HARDWARE_WORKSPACE_ID not set" });
  }
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    return res.status(500).json({ error: "Server misconfigured: HARDWARE_WORKSPACE_ID does not match any workspace" });
  }

  const matchMode = FAILURE_MODE_MATCH[sensorType];
  const relatedFailureMode = matchMode
    ? await prisma.failureMode.findFirst({ where: { workspaceId, mode: matchMode } })
    : null;

  const reading = await prisma.sensorReading.create({
    data: {
      workspaceId,
      sensorType,
      value,
      thresholdBreached,
      relatedFailureModeId: relatedFailureMode ? relatedFailureMode.id : null,
    },
  });

  if (thresholdBreached) {
    const riskLabel = relatedFailureMode ? relatedFailureMode.mode : matchMode || sensorType;
    await prisma.auditLogEntry.create({
      data: {
        workspaceId,
        userId: workspace.ownerId,
        text: `Hardware alert: ${sensorType} threshold breached (value: ${value}) — related to ${riskLabel} risk.`,
      },
    });
  }

  res.status(201).json(reading);
});

// GET /api/hardware/readings/latest — Clerk-authenticated, for the app UI.
// Returns the most recent reading per sensorType in the caller's workspace.
router.get("/readings/latest", requireUser, async (req, res) => {
  const readings = await prisma.sensorReading.findMany({
    where: { workspaceId: req.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const latestByType = {};
  for (const r of readings) {
    if (!latestByType[r.sensorType]) latestByType[r.sensorType] = r;
  }

  res.json(Object.values(latestByType));
});

module.exports = router;
