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
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/\u2026/g, '...')
    // Remove emojis and pictographs that cause font rendering issues
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
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

