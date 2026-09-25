const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// POST /api/onboarding  { company?, errors?, question? }
// One-time "quick setup" survey shown after first sign-in (see workspace.js's
// `onboardingCompleted` flag on the bootstrap payload).
router.post("/", async (req, res) => {
  const { company, errors, question } = req.body;

  const response = await prisma.onboardingResponse.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      company: typeof company === "string" ? company.trim() || null : null,
      errors: typeof errors === "string" ? errors.trim() || null : null,
      question: typeof question === "string" ? question.trim() || null : null,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: "Onboarding quick-setup responses recorded.",
    },
  });

  res.status(201).json(response);
});

module.exports = router;
