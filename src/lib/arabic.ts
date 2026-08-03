import ArabicReshaper from 'arabic-persian-reshaper';
import factory from 'bidi-js';

const bidi = factory();

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
    // Remove emojis and pictographs that cause Satori to fetch dynamic fonts
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

/**
 * Reshapes Arabic text (connecting letters into presentation forms)
 * and applies BiDi reordering so Satori (@vercel/og) renders natural,
 * correctly connected, right-to-left Arabic text with normal word spacing.
 */
export function fixArabicText(text: string | null | undefined): string {
  if (!text) return '';
  const sanitized = sanitizeTextForOg(text);
  if (!sanitized) return '';

  // Check if string contains any Arabic characters
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(sanitized);
  if (!hasArabic) {
    return sanitized;
  }

  try {
    const shaper = ArabicReshaper?.ArabicShaper || ArabicReshaper;
    const convertFn = typeof shaper?.convertArabic === 'function' ? shaper.convertArabic : (ArabicReshaper as any).convertArabic;
    if (typeof convertFn !== 'function') {
      return sanitized;
    }

    const reshaped = convertFn(sanitized);
    const embedding = bidi.getEmbeddingLevels(reshaped);
    const reordered = bidi.getReorderedString(reshaped, embedding);
    return reordered;
  } catch (err) {
    console.error('Error reshaping Arabic text:', err);
    return sanitized;
  }
}
