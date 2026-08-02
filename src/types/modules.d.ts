declare module 'arabic-persian-reshaper' {
  const ArabicReshaper: {
    convertArabic(text: string): string;
  };
  export default ArabicReshaper;
}

declare module 'bidi-js' {
  export interface BidiFactory {
    getEmbeddingLevels(text: string): { levels: Uint8Array };
    getReorderedString(text: string, levels: { levels: Uint8Array } | any): string;
  }
  export default function factory(): BidiFactory;
}
