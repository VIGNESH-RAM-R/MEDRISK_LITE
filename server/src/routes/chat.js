const express = require("express");
const prisma = require("../lib/prisma");
const { computeChatStats, localFallbackReply, buildSystemPrompt } = require("../lib/chatbot");
const groq = require("../lib/providers/groq");

const router = express.Router();

const LANGUAGE_NAMES = { en: "English", hi: "Hindi", ta: "Tamil" };

// POST /api/chat  { message: string, history?: {role:'user'|'assistant', text:string}[], language?: 'en'|'hi'|'ta' }
// Uses a real Groq call if GROQ_API_KEY is configured on the server, otherwise
// falls back to the free rule-based "Roger" assistant (English only — the
// rule-based knowledge base isn't translated, see Phase 3 report).
router.post("/", async (req, res) => {
  const { message, history, language } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }
  const languageName = LANGUAGE_NAMES[language] || null;

  const [failureModes, compliance] = await Promise.all([
    prisma.failureMode.findMany({ where: { workspaceId: req.workspace.id } }),
    prisma.complianceClause.findMany({ where: { workspaceId: req.workspace.id } }),
  ]);

  const settings = {
    alarpFrom: req.workspace.alarpFrom,
    unacceptableFrom: req.workspace.unacceptableFrom,
  };
  const stats = computeChatStats(failureModes, compliance, settings);

  if (groq.isConfigured()) {
    try {
      const reply = await groq.generateReply({
        systemPrompt: buildSystemPrompt(stats, languageName),
        history: Array.isArray(history) ? history : [],
        message,
      });
      return res.json({ reply, mode: "ai" });
    } catch (err) {
      console.error("Groq chat error, falling back to rule-based reply:", err.message);
      const reply = localFallbackReply(message, { stats, settings, chatScope: req.workspace.chatScope });
      return res.json({ reply: `${groq.friendlyError(err)}\n\n${reply}`, mode: "fallback" });
    }
  }

  const reply = localFallbackReply(message, {
    stats,
    settings,
    chatScope: req.workspace.chatScope,
  });

  res.json({ reply, mode: "rule-based" });
});

module.exports = router;
