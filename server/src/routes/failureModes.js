const express = require("express");
const prisma = require("../lib/prisma");
const { computeRpn, classifyRpn } = require("../lib/fmea");
const { COMPONENTS } = require("../lib/seedData");
const { AI_SUGGESTIONS } = require("../lib/aiSuggestions");
const groq = require("../lib/providers/groq");

const router = express.Router();

function clampScore(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 5;
  return Math.min(10, Math.max(1, v));
}

function serialize(fm, settings) {
  const rpn = computeRpn(fm.s, fm.o, fm.d);
  return { ...fm, rpn, classification: classifyRpn(rpn, settings) };
}

// GET /api/failure-modes
router.get("/", async (req, res) => {
  const list = await prisma.failureMode.findMany({
    where: { workspaceId: req.workspace.id },
    orderBy: { createdAt: "asc" },
  });
  res.json(list.map((fm) => serialize(fm, req.workspace)));
});

// POST /api/failure-modes
router.post("/", async (req, res) => {
  const { componentId, mode, effect, cause, standard, s, o, d, mitigation } = req.body;

  if (!componentId || !mode || s == null || o == null || d == null) {
    return res.status(400).json({ error: "componentId, mode, s, o, d are required" });
  }

  const created = await prisma.failureMode.create({
    data: {
      workspaceId: req.workspace.id,
      componentId,
      mode,
      effect: effect || "",
      cause: cause || "",
      standard: standard || "ISO 14971",
      s: Number(s),
      o: Number(o),
      d: Number(d),
      mitigation: mitigation || "",
      createdById: req.user.id,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Added failure mode "${created.mode}" (${componentId}).`,
    },
  });

  res.status(201).json(serialize(created, req.workspace));
});

// POST /api/failure-modes/suggest  { componentId: string }
// Real AI generation (Phase 2 feature 2): 2-3 plausible new failure modes for a
// component, each with a one-line rationale, avoiding modes already documented
// for that component. Falls back to the static curated AI_SUGGESTIONS list if
// GROQ_API_KEY isn't set or the call fails/times out/rate-limits.
router.post("/suggest", async (req, res) => {
  const { componentId } = req.body || {};
  const component = COMPONENTS.find((c) => c.id === componentId);
  if (!component) return res.status(400).json({ error: "Unknown componentId" });

  const fallback = (error) => ({
    source: "fallback",
    error,
    suggestions: (AI_SUGGESTIONS[componentId] || []).map((mode) => ({
      mode,
      rationale: "Curated suggestion from the built-in knowledge base.",
    })),
  });

  if (!groq.isConfigured()) return res.json(fallback());

  try {
    const existing = await prisma.failureMode.findMany({
      where: { workspaceId: req.workspace.id, componentId },
      select: { mode: true },
    });

    const systemPrompt =
      "You are an FMEA (Failure Mode and Effects Analysis) assistant for MedRisk Lite, helping engineers " +
      "document risk for a portable ultrasound probe medical device per ISO 14971:2019. Given a component, " +
      "suggest 2-3 NEW, plausible, specific failure modes not already listed, each with a one-sentence " +
      'rationale. Respond with strict JSON only: {"suggestions":[{"mode":string,"rationale":string}]}. ' +
      "No markdown, no prose outside the JSON.";
    const userContent =
      `Component: ${component.name}\nDescription: ${component.desc}\n` +
      `Already-documented failure modes for this component (do not duplicate these): ${
        existing.map((f) => f.mode).join("; ") || "(none yet)"
      }`;

    const content = await groq.chatComplete({
      systemPrompt,
      messages: [{ role: "user", content: userContent }],
      jsonMode: true,
      maxTokens: 500,
    });

    const parsed = JSON.parse(content);
    const suggestions = (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .filter((s) => s && typeof s.mode === "string" && s.mode.trim())
      .slice(0, 3)
      .map((s) => ({ mode: s.mode.trim(), rationale: typeof s.rationale === "string" ? s.rationale.trim() : "" }));
    if (!suggestions.length) throw new Error("Groq returned no usable suggestions");

    res.json({ source: "ai", suggestions });
  } catch (err) {
    console.error("Groq suggest-failure-modes error, falling back:", err.message);
    res.json(fallback(groq.friendlyError(err)));
  }
});

// POST /api/failure-modes/draft-mitigation  { componentId?, mode, effect?, cause? }
// Real AI generation (Phase 2 feature 3): drafts a mitigation write-up for a
// failure mode being added/edited. The frontend must treat this as an editable
// suggestion only — never auto-saved.
router.post("/draft-mitigation", async (req, res) => {
  const { componentId, mode, effect, cause } = req.body || {};
  if (!mode || typeof mode !== "string" || !mode.trim()) {
    return res.status(400).json({ error: "mode (failure mode description) is required" });
  }
  if (!groq.isConfigured()) {
    return res.status(503).json({ error: "AI mitigation drafting isn't configured (GROQ_API_KEY not set on the server)." });
  }

  const component = COMPONENTS.find((c) => c.id === componentId);
  try {
    const systemPrompt =
      "You are an FMEA risk-mitigation assistant for MedRisk Lite, a medical-device risk tool aligned with " +
      "ISO 14971:2019. Given a failure mode, write a concise, concrete, actionable mitigation strategy (2-4 " +
      "sentences) that a device engineering or quality team could actually implement — a design change, " +
      "process control, or verification/test step. Plain text only, no markdown, no preamble, no quotes.";
    const userContent =
      `Component: ${component ? component.name : componentId || "unspecified"}\n` +
      `Failure mode: ${mode.trim()}\nEffect: ${effect || "(not specified)"}\nCause: ${cause || "(not specified)"}`;

    const mitigation = await groq.chatComplete({
      systemPrompt,
      messages: [{ role: "user", content: userContent }],
      maxTokens: 300,
    });

    res.json({ mitigation: mitigation.trim() });
  } catch (err) {
    console.error("Groq draft-mitigation error:", err.message);
    res.status(502).json({ error: groq.friendlyError(err) });
  }
});

// POST /api/failure-modes/suggest-scores  { componentId?, mode, effect?, cause? }
// Real AI generation (Phase 2 feature 4): suggests S/O/D scores with a short
// rationale per score. Suggestions only — the frontend must leave the S/O/D
// inputs editable after pre-filling them.
router.post("/suggest-scores", async (req, res) => {
  const { componentId, mode, effect, cause } = req.body || {};
  if (!mode || typeof mode !== "string" || !mode.trim()) {
    return res.status(400).json({ error: "mode (failure mode description) is required" });
  }
  if (!groq.isConfigured()) {
    return res.status(503).json({ error: "AI scoring assistance isn't configured (GROQ_API_KEY not set on the server)." });
  }

  const component = COMPONENTS.find((c) => c.id === componentId);
  try {
    const systemPrompt =
      "You are an FMEA scoring assistant for MedRisk Lite, aligned with ISO 14971:2019. Given a failure mode " +
      "for a medical device component, suggest Severity (S), Occurrence (O) and Detectability (D) scores, each " +
      "an integer 1-10. Severity: 1=negligible, 10=catastrophic harm. Occurrence: 1=rare, 10=frequent. " +
      "Detectability: 1=almost always caught before harm occurs, 10=very hard or impossible to detect. Give a " +
      "short one-sentence rationale per score, grounded in the specific failure mode described. Respond with " +
      'strict JSON only: {"s":number,"o":number,"d":number,"rationale":{"s":string,"o":string,"d":string}}. ' +
      "No markdown, no prose outside the JSON.";
    const userContent =
      `Component: ${component ? component.name : componentId || "unspecified"}\n` +
      `Failure mode: ${mode.trim()}\nEffect: ${effect || "(not specified)"}\nCause: ${cause || "(not specified)"}`;

    const content = await groq.chatComplete({
      systemPrompt,
      messages: [{ role: "user", content: userContent }],
      jsonMode: true,
      maxTokens: 400,
    });

    const parsed = JSON.parse(content);
    res.json({
      s: clampScore(parsed.s),
      o: clampScore(parsed.o),
      d: clampScore(parsed.d),
      rationale: {
        s: (parsed.rationale && parsed.rationale.s) || "",
        o: (parsed.rationale && parsed.rationale.o) || "",
        d: (parsed.rationale && parsed.rationale.d) || "",
      },
    });
  } catch (err) {
    console.error("Groq suggest-scores error:", err.message);
    res.status(502).json({ error: groq.friendlyError(err) });
  }
});

// PATCH /api/failure-modes/:id
router.patch("/:id", async (req, res) => {
  const existing = await prisma.failureMode.findFirst({
    where: { id: req.params.id, workspaceId: req.workspace.id },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const { componentId, mode, effect, cause, standard, s, o, d, mitigation } = req.body;
  const data = {};
  if (componentId !== undefined) data.componentId = componentId;
  if (mode !== undefined) data.mode = mode;
  if (effect !== undefined) data.effect = effect;
  if (cause !== undefined) data.cause = cause;
  if (standard !== undefined) data.standard = standard;
  if (s !== undefined) data.s = Number(s);
  if (o !== undefined) data.o = Number(o);
  if (d !== undefined) data.d = Number(d);
  if (mitigation !== undefined) data.mitigation = mitigation;

  const updated = await prisma.failureMode.update({
    where: { id: existing.id },
    data,
  });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Updated failure mode "${updated.mode}".`,
    },
  });

  res.json(serialize(updated, req.workspace));
});

// DELETE /api/failure-modes/:id
router.delete("/:id", async (req, res) => {
  const existing = await prisma.failureMode.findFirst({
    where: { id: req.params.id, workspaceId: req.workspace.id },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  await prisma.failureMode.delete({ where: { id: existing.id } });

  await prisma.auditLogEntry.create({
    data: {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      text: `Deleted failure mode "${existing.mode}".`,
    },
  });

  res.status(204).end();
});

module.exports = router;
