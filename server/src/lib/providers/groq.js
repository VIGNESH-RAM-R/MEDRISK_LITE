// Real-AI upgrade path for all 4 Phase 2 AI features (chat, suggested failure
// modes, mitigation drafting, S-O-D scoring). Only used when GROQ_API_KEY is set
// in the environment; every caller must fall back to its non-AI behavior if
// isConfigured() is false or the call throws (missing key, timeout, rate limit,
// bad response). Kept server-side so the key is never exposed to the client.
//
// Groq's API is OpenAI-compatible (same request/response shape as OpenAI's chat
// completions API), which is why this reads like an OpenAI client rather than
// the Anthropic Messages API shape used elsewhere in this codebase.

const MODEL = process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 15000;

function isConfigured() {
  return Boolean(process.env.GROQ_API_KEY);
}

// messages: [{ role: 'user'|'assistant', content: string }]
// jsonMode: when true, asks Groq to return a raw JSON object (no markdown fences).
async function chatComplete({ systemPrompt, messages, jsonMode = false, maxTokens = 1024 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        // openai/gpt-oss-* models are reasoning models whose hidden "reasoning"
        // tokens count against max_tokens too — "low" keeps that budget small so
        // it doesn't crowd out (truncate) the actual visible response.
        reasoning_effort: "low",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      const timeoutErr = new Error("Groq request timed out");
      timeoutErr.status = 408;
      throw timeoutErr;
    }
    throw err;
  }
  clearTimeout(timeout);

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`Groq API error ${res.status}: ${errText.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!content) throw new Error("Groq API returned an empty response");
  return content;
}

// Back-compat wrapper matching the chat route's history+message shape.
async function generateReply({ systemPrompt, history, message }) {
  const messages = [
    ...(history || []).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
    { role: "user", content: message },
  ];
  return chatComplete({ systemPrompt, messages });
}

function friendlyError(err) {
  const status = err && err.status;
  if (status === 401) return "That API key was rejected — double check GROQ_API_KEY on the server.";
  if (status === 408) return "The AI service took too long to respond — try again.";
  if (status === 429) return "Rate limited by Groq's free tier — try again in a moment.";
  if (status >= 500) return "The AI service is temporarily unavailable — try again shortly.";
  return "Could not reach the AI provider right now.";
}

module.exports = { isConfigured, chatComplete, generateReply, friendlyError, MODEL };
