/**
 * Neutrality Guard
 * Scans generated narrative and letter text for accusatory, biased, or non-neutral words
 * in English, Marathi, and Hindi, replacing matches with "[...]".
 */

export const ACCUSATORY_WORDS: Record<'en' | 'mr' | 'hi', string[]> = {
  en: [
    'fraud',
    'theft',
    'corruption',
    'cheating',
    'scam',
    'stolen',
    'illegal',
    'dishonest',
    'misappropriation',
  ],
  mr: [
    'फसवणूक',
    'भ्रष्टाचार',
    'चोरी',
    'घोटाळा',
    'लबाडी',
  ],
  hi: [
    'धोखाधड़ी',
    'भ्रष्टाचार',
    'चोरी',
    'घोटाला',
    'ठगी',
  ],
};

export interface NeutralityCheckResult {
  sanitizedText: string;
  maskedCount: number;
  originalMatches: string[];
}

/**
 * Applies neutrality sanitization to text, replacing forbidden words with '[...]'.
 */
export function sanitizeNeutrality(text: string): NeutralityCheckResult {
  if (!text || typeof text !== 'string') {
    return { sanitizedText: '', maskedCount: 0, originalMatches: [] };
  }

  const allWords = [
    ...ACCUSATORY_WORDS.en,
    ...ACCUSATORY_WORDS.mr,
    ...ACCUSATORY_WORDS.hi,
  ];

  let maskedCount = 0;
  const matches: string[] = [];
  let result = text;

  for (const word of allWords) {
    // Escape regex characters if any
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b|${escaped}`, 'gi');

    result = result.replace(regex, (match) => {
      maskedCount += 1;
      matches.push(match);
      return '[...]';
    });
  }

  return {
    sanitizedText: result,
    maskedCount,
    originalMatches: matches,
  };
}
