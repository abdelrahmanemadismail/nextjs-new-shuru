/**
 * Sanitizes input text by removing unsupported emojis/symbols and replacing
 * complex smart quotes and em-dashes that are missing from local font glyph maps.
 */
export function sanitizeTextForOg(text: string | null | undefined): string {
  if (!text) return '';
  let cleaned = text.trim();
  if (!cleaned) return '';

  return cleaned
    .replace(/[\u00AB\u00BB\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u00B7\u25FE\u25FD\u25AA\u25AB\u25CF\u25CB\u25A0\u25A1]/g, ' - ')
    .replace(/[\u2010-\u2015\u2212\u2013\u2014]/gu, '-')
    .replace(/\u2026/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, '')
    // Remove emojis and pictographs that cause font rendering issues
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Prepares Arabic text for HarfBuzz (Skia / @napi-rs/canvas) text shaping.
 * HarfBuzz expects clean, raw Unicode Arabic text to correctly apply script shaping,
 * ligatures, and bidirectional ordering.
 */
export function fixArabicText(text: string | null | undefined): string {
  return sanitizeTextForOg(text);
}

