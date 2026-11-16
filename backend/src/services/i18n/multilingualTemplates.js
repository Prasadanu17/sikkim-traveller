/**
 * backend/src/services/i18n/multilingualTemplates.js
 * Verified multilingual responses and action card texts for English, Hindi, and Nepali.
 * Follows authentic Sikkim regional vocabulary and preserves travel constraints.
 */

export const MULTILINGUAL_TEMPLATES = {
  en: {
    welcome: (duration) => `Hi! I'm your Sikkim Trip Copilot. I understand your ${duration}-day journey. Ask me anything about your destinations, weather, budget optimizations, or trip refinement!`,
    budgetReduced: (duration, savings) => `I analyzed your ${duration}-day Sikkim trip. Switching to shared transportation (Sumo) and boutique homestays can save approximately ₹${savings.toLocaleString('en-IN')}.`,
    budgetCardTitle: 'Lower Your Trip Cost',
    budgetCardDesc: 'Switching to shared transport and budget homestays will reduce your estimated budget.',
    budgetActionLabel: 'Apply Savings Option',
    
    dayRelaxed: (dayNum) => `I can adjust Day ${dayNum} to incorporate more rest time, slower morning pacing, and dedicated relaxation.`,
    dayCardTitle: (dayNum) => `Make Day ${dayNum} More Relaxed`,
    dayCardDesc: (dayNum) => `Lightens Day ${dayNum} activity density to allow restful exploration and leisure.`,
    dayActionLabel: (dayNum) => `Relax Day ${dayNum}`,

    transportShared: 'Switching to shared Sumo transport will reduce your mountain transit expenses.',
    transportCardTitle: 'Switch to Shared Sumo Transport',
    transportActionLabel: 'Switch to Shared Sumo',

    stayHomestay: 'I can update your stay preferences to authentic homestays across all overnight locations.',
    stayCardTitle: 'Switch Stay Preference to Homestays',
    stayActionLabel: 'Set Stays to Homestays',

    durationChange: (fromDays, toDays) => `I can adjust your trip schedule from ${fromDays} days to ${toDays} days.`,
    durationCardTitle: (toDays) => `Adjust Trip Duration to ${toDays} Days`,
    durationActionLabel: (toDays) => `Update to ${toDays} Days`,

    weather: 'Current weather across Sikkim mountain passes: Clear to partly cloudy in Gangtok (14°C - 20°C). North Sikkim high-altitude regions (Lachung, Yumthang) are cold (2°C - 8°C) with morning mist.',
    permits: 'Travel permits (Inner Line Permits for North Sikkim / Protected Area Permits for Tsomgo & Nathula) are required for all tourists. Our registered operations team coordinates these with military and civil authorities once you submit your trip request. Permits are never pre-approved.',
    altitudeWarning: 'Acclimatization reminder: Stay hydrated, avoid rapid climbing without night rest in Lachen/Lachung, and descend immediately if acute headache develops.',
    generalFallback: (duration) => `I am your Sikkim Trip Copilot. I can help you optimize your ${duration}-day itinerary, answer road/weather questions, or suggest budget savings. How would you like to refine your trip?`
  },

  hi: {
    welcome: (duration) => `नमस्ते! मैं आपका सिक्किम ट्रिप कोपायलट हूँ। मैं आपकी ${duration}-दिनों की यात्रा योजना को समझता हूँ। मुझसे गंतव्यों, मौसम, बजट बचत या योजना में बदलाव के बारे में कुछ भी पूछें!`,
    budgetReduced: (duration, savings) => `मैंने आपकी ${duration}-दिनों की सिक्किम यात्रा का विश्लेषण किया। शेयर्ड सूमो और होमस्टे का चयन करके आप लगभग ₹${savings.toLocaleString('en-IN')} की बचत कर सकते हैं।`,
    budgetCardTitle: 'यात्रा का बजट कम करें',
    budgetCardDesc: 'शेयर्ड ट्रांसपोर्ट और बजट होमस्टे का चयन करने से आपका अनुमानित खर्च कम हो जाएगा।',
    budgetActionLabel: 'बचत विकल्प लागू करें',

    dayRelaxed: (dayNum) => `मैं दिन ${dayNum} को अधिक आरामदायक बना सकता हूँ, जिसमें सुबह का धीमा समय और विश्राम शामिल होगा।`,
    dayCardTitle: (dayNum) => `दिन ${dayNum} को अधिक आरामदायक बनाएं`,
    dayCardDesc: (dayNum) => `दिन ${dayNum} की गतिविधियों को हल्का करता है ताकि आप सुकून से घूम सकें।`,
    dayActionLabel: (dayNum) => `दिन ${dayNum} को रिलैक्स करें`,

    transportShared: 'शेयर्ड सूमो परिवहन चुनने से आपका पहाड़ी यात्रा खर्च काफी कम हो जाएगा।',
    transportCardTitle: 'शेयर्ड सूमो परिवहन चुनें',
    transportActionLabel: 'शेयर्ड सूमो पर स्विच करें',

    stayHomestay: 'मैं आपके ठहरने के विकल्प को सभी स्थानों पर प्रामाणिक होमस्टे में बदल सकता हूँ।',
    stayCardTitle: 'ठहरने के लिए होमस्टे चुनें',
    stayActionLabel: 'होमस्टे लागू करें',

    durationChange: (fromDays, toDays) => `मैं आपकी यात्रा को ${fromDays} दिनों से बदलकर ${toDays} दिनों का कर सकता हूँ।`,
    durationCardTitle: (toDays) => `यात्रा अवधि ${toDays} दिन करें`,
    durationActionLabel: (toDays) => `${toDays} दिन अपडेट करें`,

    weather: 'सिक्किम के पहाड़ी मार्गों पर वर्तमान मौसम: गंगटोक में साफ से आंशिक बादल (14°C - 20°C)। उत्तरी सिक्किम (लाचुंग, युमथांग) में ठंड (2°C - 8°C) और सुबह हल्का कोहरा है।',
    permits: 'पर्यटकों के लिए इनर लाइन परमिट (उत्तरी सिक्किम) और प्रोटेक्टेड एरिया परमिट (त्सोमगो और नाथुला) अनिवार्य हैं। आपकी बुकिंग के बाद हमारी टीम सेना और प्रशासन के साथ समन्वय करके परमिट प्रक्रिया पूरा करती है। परमिट पहले से स्वीकृत नहीं होते।',
    altitudeWarning: 'ऊंचाई पर अनुकूलन सलाह: पर्याप्त पानी पिएं, लाचेन/लाचुंग में रात रुकने के बिना सीधे ऊंचाई पर न जाएं, और सिरदर्द होने पर तुरंत नीचे आएं।',
    generalFallback: (duration) => `मैं आपका सिक्किम ट्रिप कोपायलट हूँ। मैं आपकी ${duration}-दिनों की यात्रा को बेहतर बनाने, मौसम व सड़क की जानकारी देने और बजट बचाने में मदद कर सकता हूँ।`
  },

  ne: {
    welcome: (duration) => `नमस्ते! म तपाईंको सिक्किम भ्रमण कोपाइलट हुँ। म तपाईंको ${duration}-दिने यात्रा तालिका बुझ्दछु। गन्तव्य, मौसम, बजेट बचत वा योजना परिमार्जन बारे मलाई सोध्नुहोस्!`,
    budgetReduced: (duration, savings) => `मैले तपाईंको ${duration}-दिने सिक्किम भ्रमणको विश्लेषण गरें। साझा सुमो र होमस्टे छनोट गरेर तपाईंले लगभग ₹${savings.toLocaleString('en-IN')} बचत गर्न सक्नुहुन्छ।`,
    budgetCardTitle: 'भ्रमण बजेट घटाउनुहोस्',
    budgetCardDesc: 'साझा सवारी र होमस्टे रोज्दा तपाईंको अनुमानित खर्च कम हुनेछ।',
    budgetActionLabel: 'बचत विकल्प लागू गर्नुहोस्',

    dayRelaxed: (dayNum) => `म दिन ${dayNum} लाई थप आरामदायी बनाउन सक्छु, जसमा बिहानको ढिलो सुरुवात र विश्राम समावेश हुनेछ।`,
    dayCardTitle: (dayNum) => `दिन ${dayNum} लाई शान्त र आरामदायी बनाउनुहोस्`,
    dayCardDesc: (dayNum) => `दिन ${dayNum} को व्यस्तता घटाएर आरामसँग घुम्ने अवसर प्रदान गर्दछ।`,
    dayActionLabel: (dayNum) => `दिन ${dayNum} आरामदायी बनाउनुहोस्`,

    transportShared: 'साझा सुमो रोज्नुभएमा तपाईंको पहाडी यातायात खर्च उल्लेख्य रूपमा घट्नेछ।',
    transportCardTitle: 'साझा सुमो यातायात रोज्नुहोस्',
    transportActionLabel: 'साझा सुमोमा सर्नुहोस्',

    stayHomestay: 'म तपाईंको बसाइको रोजाइलाई सबै ठाउँमा प्रामाणिक होमस्टेमा रूपान्तरण गर्न सक्छु।',
    stayCardTitle: 'बसाइको लागि होमस्टे रोज्नुहोस्',
    stayActionLabel: 'होमस्टे छनोट गर्नुहोस्',

    durationChange: (fromDays, toDays) => `म तपाईंको यात्रालाई ${fromDays} दिनबाट ${toDays} दिनमा समायोजन गर्न सक्छु।`,
    durationCardTitle: (toDays) => `यात्रा अवधि ${toDays} दिन बनाउनुहोस्`,
    durationActionLabel: (toDays) => `${toDays} दिन अपडेट गर्नुहोस्`,

    weather: 'सिक्किमका पहाडी सडकहरूमा वर्तमान मौसम: गान्तोकमा सफा तथा आंशिक बदली (14°C - 20°C)। उत्तर सिक्किमका उच्च भूभाग (लाचुङ, युमथाङ) मा जाडो (2°C - 8°C) र बिहानी कुहिरो छ।',
    permits: 'पर्यटकहरूका लागि इनर लाइन परमिट (उत्तर सिक्किम) र संरक्षित क्षेत्र परमिट (छोङ्गो ताल तथा नाथुला) अनिवार्य छ। हाम्रो टोलीले सुरक्षा निकाय र प्रशासनसँग समन्वय गरी परमिट प्रक्रिया अघि बढाउँछ। परमिट पहिले नै स्वीकृत हुँदैन।',
    altitudeWarning: 'लेक लाग्ने (AMS) सचेतना: प्रशस्त पानी पिउनुहोस्, लाचेन/लाचुङमा बास नबसी सिधै उच्च भागमा नउक्लनुहोस्, र टाउको दुखेमा तुरुन्त ओर्लनुहोस्।',
    generalFallback: (duration) => `म तपाईंको सिक्किम भ्रमण कोपाइलट हुँ। म तपाईंको ${duration}-दिने यात्रालाई परिष्कृत गर्न, मौसम/सडक जानकारी दिन र बजेट घटाउन मद्दत गर्न सक्छु।`
  }
};

/**
 * Returns localized template strings for the specified language.
 */
export function getMultilingualTemplates(lang = 'en') {
  return MULTILINGUAL_TEMPLATES[lang] || MULTILINGUAL_TEMPLATES.en;
}
