require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { requireUser, clerkMiddleware } = require("./middleware/auth");
const { UPLOAD_DIR } = require("./middleware/upload");
const workspaceRoutes = require("./routes/workspace");
const failureModeRoutes = require("./routes/failureModes");
const complianceRoutes = require("./routes/compliance");
const chatRoutes = require("./routes/chat");
const snapshotRoutes = require("./routes/snapshots");
const onboardingRoutes = require("./routes/onboarding");
const hardwareRoutes = require("./routes/hardware");

const app = express();

const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:8082";
app.use(cors({ origin: APP_ORIGIN }));
app.use(express.json());
app.use(clerkMiddleware());
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/health", (req, res) => res.json({ ok: true }));

// Every route below verifies the Clerk session and resolves req.user/req.workspace.
app.use("/api/workspace", requireUser, workspaceRoutes);
app.use("/api/failure-modes", requireUser, failureModeRoutes);
app.use("/api/compliance", requireUser, complianceRoutes);
app.use("/api/chat", requireUser, chatRoutes);
app.use("/api/snapshots", requireUser, snapshotRoutes);
app.use("/api/onboarding", requireUser, onboardingRoutes);
// Not gated by requireUser at this level: POST /reading uses its own device-key
// auth (ESP32 can't do Clerk/OAuth), while GET /readings/latest applies requireUser itself.
app.use("/api/hardware", hardwareRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || /Unsupported file type/.test(err.message || "")) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`MedRisk Lite server listening on http://localhost:${PORT}`);
});
