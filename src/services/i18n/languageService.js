/**
 * src/services/i18n/languageService.js
 * Language detection, Sikkim geographical terminology mapping, and constraint preservation.
 * Supports: English ('en'), Hindi ('hi'), Nepali ('ne').
 */

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'ne'];

export const LANGUAGE_LABELS = {
  en: { code: 'en', label: 'English', native: 'English', voiceLang: 'en-IN' },
  hi: { code: 'hi', label: 'Hindi', native: 'हिन्दी', voiceLang: 'hi-IN' },
  ne: { code: 'ne', label: 'Nepali', native: 'नेपाली', voiceLang: 'ne-NP' }
};

// Devanagari character set regex: \u0900-\u097F
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

// Distinct Nepali linguistic markers and common vocabulary
const NEPALI_MARKERS = [
  'छ', 'छन्', 'छैन', 'भयो', 'गर्ने', 'गर्नुहोस्', 'तपाईं', 'हजुर', 'हाम्रो',
  'सिक्किम', 'भ्रमण', 'पैदलमार्ग', 'ताल', 'बजेट', 'कति', 'राम्रो', 'हेरौं',
  'दिन', 'गाडी', 'होटल', 'घटाउनुहोस्', 'बढाउनुहोस्', 'शान्त', 'कस्तो', 'र',
  'लाई', 'गान्तोक', 'लाचुङ', 'पेलिङ', 'अवलोकन'
];

// Distinct Hindi linguistic markers and common vocabulary
const HINDI_MARKERS = [
  'है', 'हैं', 'हूँ', 'हो', 'करना', 'चाहिए', 'कृपया', 'नमस्ते', 'धन्यवाद',
  'मौसम', 'किफायती', 'सस्ता', 'दिनों', 'यात्रा', 'झील', 'बताइए', 'बजट',
  'कम', 'आरामदायक', 'होटल', 'गाड़ी', 'दीजिए', 'कीजिए', 'सकते'
];

/**
 * Detects the language of an incoming message string.
 * Returns 'ne', 'hi', or 'en'.
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';

  const clean = text.trim();
  if (!DEVANAGARI_REGEX.test(clean)) {
    return 'en';
  }

  // Strip punctuation for accurate token matching
  const stripped = clean.replace(/[?.,!;:|/\-_"'\(\)\[\]{}]/g, ' ');
  const words = stripped.split(/\s+/).filter(Boolean);
  let nepaliScore = 0;
  let hindiScore = 0;

  for (const word of words) {
    if (NEPALI_MARKERS.includes(word)) nepaliScore += 2;
    if (HINDI_MARKERS.includes(word)) hindiScore += 2;
  }

  // Specific morphological clues (e.g. verb endings like गर्नुहोस्, भयो)
  if (/गर्नुहोस्|भयो|छैन|तपाईं|हजुर|कस्तो|लाचुङ|गान्तोक/i.test(clean)) {
    nepaliScore += 4;
  }
  if (/चाहिए|कीजिए|बताइए|सकते|नमस्ते|दीजिए|किफायती/i.test(clean)) {
    hindiScore += 4;
  }

  if (nepaliScore > hindiScore) return 'ne';
  if (hindiScore > nepaliScore) return 'hi';

  // Default Devanagari preference if ambiguous: Hindi
  return 'hi';
}

/**
 * Verified Sikkim destination names in supported languages.
 * Prevents mangled translations of proper nouns.
 */
export const SIKKIM_DESTINATION_NAMES = {
  gangtok: { en: 'Gangtok', hi: 'गंगटोक', ne: 'गान्तोक' },
  pelling: { en: 'Pelling', hi: 'पेलिंग', ne: 'पेलिङ' },
  lachung: { en: 'Lachung', hi: 'लाचुंग', ne: 'लाचुङ' },
  lachen: { en: 'Lachen', hi: 'लाचेन', ne: 'लाचेन' },
  'yumthang-valley': { en: 'Yumthang Valley', hi: 'युमथांग घाटी', ne: 'युमथाङ उपत्यका' },
  'gurudongmar-lake': { en: 'Gurudongmar Lake', hi: 'गुरुडोंगमार झील', ne: 'गुरुडोङमार ताल' },
  'zero-point': { en: 'Zero Point', hi: 'जीरो प्वाइंट (युमे सामडोंग)', ne: 'जिरो पोइन्ट' },
  nathula: { en: 'Nathula Pass', hi: 'नाथुला दर्रा', ne: 'नाथुला भञ्ज्याङ' },
  'tsomgo-lake': { en: 'Tsomgo Lake', hi: 'त्सोमगो झील (चांगु)', ne: 'छोङ्गो ताल' },
  ravangla: { en: 'Ravangla', hi: 'रवांगला', ne: 'रभाङ्ला' },
  namchi: { en: 'Namchi', hi: 'नामची', ne: 'नाम्ची' },
  yuksom: { en: 'Yuksom', hi: 'युकसोम', ne: 'युक्सोम' },
  khecheopalri: { en: 'Khecheopalri Lake', hi: 'खेचोपलरी झील', ne: 'खेचोपल्री ताल' },
  zuluk: { en: 'Zuluk', hi: 'जुलुक', ne: 'जुलुक' },
  temi: { en: 'Temi Tea Garden', hi: 'तेमी चाय बगान', ne: 'तेमी चिया बगान' }
};

/**
 * Resolves localized destination name given a slug and language code.
 */
export function getLocalizedDestinationName(slug, lang = 'en') {
  if (!slug) return '';
  const clean = slug.toLowerCase().replace(/[\s_]+/g, '-');
  const entry = SIKKIM_DESTINATION_NAMES[clean];
  if (entry && entry[lang]) {
    return entry[lang];
  }
  return entry?.en || slug;
}
