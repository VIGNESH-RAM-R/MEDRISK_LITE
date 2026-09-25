# MEDRISK Lite — Phase 2 & Phase 3 Roadmap

This document is for Claude Code to read and implement, in order. Phase 2 must be completed and verified before Phase 3 begins.

---

## Phase 2 — Real AI Features

The app currently has an AI Assistant ("Roger") that's rule-based/free, and an "AI-suggested failure modes" panel that pulls from a static curated list. Make AI genuinely functional in 4 places, wired to a real LLM via the Anthropic API. Scope is intentionally limited to these 4 — do not add anything beyond this list.

### 0. Setup
- An `ANTHROPIC_API_KEY` will be provided in `server/.env`.
- All AI calls must happen server-side (never expose the key to the frontend).
- Add a shared helper in `server/src/lib/providers/anthropic.js` (if it doesn't already exist from an earlier hook) that other routes can call with a system prompt + user content and get back a text response.

### 1. AI Assistant chat ("Roger") — upgrade to real AI
- When `ANTHROPIC_API_KEY` is set, route chat messages through Claude instead of the rule-based fallback. Keep the rule-based version as an automatic fallback if the key is missing or the API call fails, so the app never breaks.
- System prompt should ground it in FMEA / ISO 14971 / this app's actual data (failure modes, compliance status) so answers are relevant, not generic.

### 2. AI-suggested failure modes — upgrade to real generation
- Replace the static `AI_SUGGESTIONS` lookup with a real API call: given a component's name + description (and ideally the existing failure modes already logged for it, to avoid duplicates), ask Claude to suggest 2-3 plausible new failure modes with a one-line rationale each.
- Keep the existing "+ Add to FMEA Workspace" UI flow — just swap the data source from static to AI-generated.

### 3. AI mitigation strategy drafting (new)
- In the FMEA Workspace, when a user is filling in or editing a failure mode's mitigation field, add a "Draft mitigation with AI" button.
- Sends the failure mode's mode/effect/cause/component to Claude, gets back a draft mitigation write-up, and populates the field as an editable suggestion — the user must be able to edit or discard it, never auto-saved without review.

### 4. AI S-O-D scoring assistant (new)
- When adding or editing a failure mode, add an optional "Suggest scores with AI" action: user provides/has already written the failure mode description, AI returns suggested Severity/Occurrence/Detection values (1-10 each) with a short written rationale for each score.
- These are suggestions only — pre-fill the S/O/D inputs but leave them editable, and show the AI's rationale next to them so the user (and a reviewer) can see the reasoning, not just the numbers.

### 5. Error handling & resilience
- Every AI call must have a graceful failure path (timeout, rate limit, no key configured) that shows a clear message in the UI rather than crashing or hanging silently.
- Add loading states for all 4 features so it's clear when a request is in flight.

### 6. Verification
- Test all 4 features end-to-end with a real API key: does the chat give relevant answers, do suggested failure modes make sense for their component, does mitigation drafting produce something reasonable, do S-O-D suggestions come with sane reasoning.
- Confirm the app still works normally if `ANTHROPIC_API_KEY` is removed (graceful fallback, no crashes).

### 7. Report back
- Confirm the env var that needs to be set.
- List exactly which files changed for each of the 4 features.
- Flag anything that couldn't be fully verified due to API cost/rate limits.

---

## Phase 3 — Multi-Language Support (Hindi, Tamil, English)

Only begin this phase after Phase 2 is complete and verified. English remains the default language; Hindi and Tamil are added as selectable options.

### 1. Language infrastructure
- Add an i18n solution appropriate for Expo/React Native web (e.g. `i18next` + `react-i18next`, or an equivalent lightweight approach already compatible with the existing stack — check `app/package.json` before adding new dependencies).
- Store all user-facing UI strings (labels, buttons, headers, nav items, empty states, error/toast messages, form placeholders) in translation files: `en.json`, `hi.json`, `ta.json`.
- Do not hardcode any new UI strings going forward — all text must go through the translation layer.

### 2. Scope of translation
- Translate every screen: Dashboard, Device Library, FMEA Workspace, Risk Register, Analytics, Compliance, AI Assistant, Report Generator, Settings, sign-in screen.
- Translate static reference content (component names/descriptions, standard names) where meaningful; technical standard codes (e.g. "ISO 14971:2019", "IEC 60601-1") should stay in their original form since they are formal identifiers, not prose.
- The AI Assistant ("Roger") and other AI features from Phase 2 should ideally respond in the user's selected language when feasible — pass the selected language into the system prompt sent to Claude.

### 3. Language switcher
- Add a language selector in Settings (English / हिंदी / தமிழ்), persisted per user (or locally via AsyncStorage at minimum).
- Switching language should update the UI immediately without requiring a full app restart, where feasible.

### 4. PDF Report Generator
- Generated PDF reports and the user manual should respect the currently selected language, including headers and section titles, so the exported document isn't English-only regardless of the app's UI language.

### 5. Verification
- Switch through all three languages and click through every screen to confirm no missing/fallback strings, no layout breakage from longer Hindi/Tamil text, and that dynamic content (e.g. AI Assistant responses) responds sensibly to the selected language.
- Confirm English remains the default for new/unset users.

### 6. Report back
- List which files/screens were translated.
- Flag any strings intentionally left untranslated and why (e.g. formal standard codes).
- Note any UI layout adjustments made to accommodate longer translated text.
