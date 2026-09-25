import type { jsPDF } from "jspdf";
import { notoSansDevanagariRegular } from "./fonts/notoSansDevanagariRegular";
import { notoSansDevanagariBold } from "./fonts/notoSansDevanagariBold";
import { notoSansTamilRegular } from "./fonts/notoSansTamilRegular";
import { notoSansTamilBold } from "./fonts/notoSansTamilBold";
import type { Lang } from "./pdfStrings";

// jsPDF's built-in fonts (helvetica/times/courier) only cover Latin text, so
// Hindi/Tamil body copy would render as blank boxes without an embedded
// Unicode font. These are Noto Sans Devanagari / Noto Sans Tamil, subset to
// the Latin+script glyphs Google Fonts serves for those families, converted
// from woff to a plain sfnt TTF (fontTools) and base64-inlined so no network
// fetch is needed at PDF-generation time.
//
// Known limitation: jsPDF has no OpenType shaping engine (no GSUB/GPOS), so
// it draws each character's base glyph in logical order without reordering
// pre-base vowel signs or forming conjunct ligatures. Text is fully readable
// and uses the correct glyphs, but some complex Devanagari/Tamil letter
// combinations may not visually compose exactly as they would in a browser
// or word processor. The native PDF path (pdfTemplates.ts, rendered through
// the OS's own text engine) does not have this limitation.

// Registers the given language's font (a no-op for English, which uses
// jsPDF's built-in helvetica) and returns the font family name to pass to
// doc.setFont(family, "normal" | "bold") in place of "helvetica" everywhere.
export function registerPdfFont(doc: jsPDF, lang: Lang): string {
  if (lang === "hi") {
    const family = "NotoSansDevanagari";
    doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", notoSansDevanagariRegular);
    doc.addFont("NotoSansDevanagari-Regular.ttf", family, "normal");
    doc.addFileToVFS("NotoSansDevanagari-Bold.ttf", notoSansDevanagariBold);
    doc.addFont("NotoSansDevanagari-Bold.ttf", family, "bold");
    doc.addFont("NotoSansDevanagari-Bold.ttf", family, "italic");
    return family;
  }
  if (lang === "ta") {
    const family = "NotoSansTamil";
    doc.addFileToVFS("NotoSansTamil-Regular.ttf", notoSansTamilRegular);
    doc.addFont("NotoSansTamil-Regular.ttf", family, "normal");
    doc.addFileToVFS("NotoSansTamil-Bold.ttf", notoSansTamilBold);
    doc.addFont("NotoSansTamil-Bold.ttf", family, "bold");
    doc.addFont("NotoSansTamil-Bold.ttf", family, "italic");
    return family;
  }
  return "helvetica";
}
