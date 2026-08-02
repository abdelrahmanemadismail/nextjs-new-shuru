import ArabicReshaper from 'arabic-persian-reshaper';
import factory from 'bidi-js';

const bidi = factory();

/**
 * Reshapes Arabic text (connecting letters) and applies BiDi reordering
 * so that Satori (@vercel/og) renders natural, correctly-connected Arabic script
 * without word spacing bugs, broken letters, or reversed word order.
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
    // 1. Reshape Arabic letters to connected presentation forms
    const reshaped = ArabicReshaper.convertArabic(cleaned);
    // 2. Perform BiDi reordering for visual RTL order
    const embedding = bidi.getEmbeddingLevels(reshaped);
    const reordered = bidi.getReorderedString(reshaped, embedding);
    return reordered;
  } catch (err) {
    console.error('Error reshaping Arabic text:', err);
    return cleaned;
  }
}
