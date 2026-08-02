import ArabicReshaper from 'arabic-persian-reshaper';
import factory from 'bidi-js';

const bidi = factory();

/**
 * Reshapes Arabic text (connecting letters into presentation forms)
 * and applies BiDi reordering so Satori (@vercel/og) renders natural,
 * correctly connected, right-to-left Arabic text with normal word spacing.
 */
export function fixArabicText(text: string | null | undefined): string {
  if (!text) return '';
  const cleaned = text.trim();
  if (!cleaned) return '';

  // Check if string contains any Arabic characters
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(cleaned);
  if (!hasArabic) {
    return cleaned;
  }

  try {
    const shaper = ArabicReshaper?.ArabicShaper || ArabicReshaper;
    const convertFn = typeof shaper?.convertArabic === 'function' ? shaper.convertArabic : (ArabicReshaper as any).convertArabic;
    if (typeof convertFn !== 'function') {
      return cleaned;
    }

    const reshaped = convertFn(cleaned);
    const embedding = bidi.getEmbeddingLevels(reshaped);
    const reordered = bidi.getReorderedString(reshaped, embedding);
    return reordered;
  } catch (err) {
    console.error('Error reshaping Arabic text:', err);
    return cleaned;
  }
}
