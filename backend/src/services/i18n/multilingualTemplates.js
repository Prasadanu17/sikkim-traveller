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

    removeActivity: (dayNum) => `I can remove one activity from Day ${dayNum} to give you more breathing room and rest.`,
    removeActivityCardTitle: (dayNum) => `Remove Activity from Day ${dayNum}`,
    removeActivityCardDesc: (dayNum) => `Removes the densest non-essential activity from Day ${dayNum} for a lighter schedule.`,
    removeActivityActionLabel: (dayNum) => `Lighten Day ${dayNum}`,

    replaceDest: (oldD, newD) => `I can replace ${oldD} with ${newD} and optimize your driving routes accordingly.`,
    replaceDestCardTitle: (oldD, newD) => `Replace ${oldD} with ${newD}`,
    replaceDestCardDesc: (oldD, newD) => `Updates your route circuit from ${oldD} to ${newD} and balances daily travel times.`,
    replaceDestActionLabel: (oldD, newD) => `Swap to ${newD}`,

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
    permits: 'Travel permits: Inner Line Permits / Restricted Area Permits (RAP/ILP) and Protected Area Permits (PAP) govern Sikkim travel. Indian citizens require PAP for Tsomgo Lake, Baba Mandir, Nathula Pass, and North Sikkim (Lachung, Lachen, Yumthang Valley, Zero Point, Gurudongmar Lake). Foreign nationals require an initial RAP (30 days) to enter Sikkim. In North Sikkim, foreign nationals ARE permitted to visit Lachung, Yumthang Valley, and Lachen with a PAP when booked through a registered Sikkim tour operator in groups of two or more with a local guide. HOWEVER, Nathula Pass and Gurudongmar Lake are strictly prohibited for foreign nationals under Ministry of Home Affairs border regulations. Permits are subject to government verification and are never pre-approved.',
    altitudeWarning: 'Acclimatization reminder: Stay hydrated, avoid rapid climbing without night rest in Lachen/Lachung, and descend immediately if acute headache develops.',
    foodCulture: 'Sikkimese cuisine offers rich Himalayan flavors: steamed beef/pork or vegetable momos, warm thukpa, fermented gundruk soup, kinema, and chhurpi soup. For cultural heritage, explore Rumtek and Pemayangtse monasteries.',
    recommend5Day: 'For a classic 5-day Sikkim circuit, I recommend: Day 1 Arrival & Gangtok MG Marg, Day 2 Tsomgo Lake & Baba Mandir, Day 3 Scenic drive to Pelling via Ravangla Buddha Park, Day 4 Pemayangtse Monastery & Skywalk, Day 5 Departure via Bagdogra/NJP.',
    northSikkimDurationNotice: (currentDur) => `Visiting North Sikkim (Lachung/Lachen/Yumthang) requires at least 4 full days due to the 6+ hour mountain road each way. With your current ${currentDur}-day plan, extending to 5 days is recommended for altitude safety.`,
    generalFallback: (duration) => `I am your Sikkim Trip Copilot. I can help you optimize your ${duration}-day itinerary, answer road/weather questions, or suggest budget savings. How would you like to refine your trip?`,
    
    // Warm conversational & high-conversion romance/charm responses
    loveCompliment: (duration) => `Aww, that just made my Himalayan day! 🏔️✨ Wait until you see the golden sunrise over Mt. Kanchenjunga from Pelling or the misty pine valleys of Lachung—you're going to fall completely in love with Sikkim! Your ${duration}-day journey is tailored to be truly special. Would you like to review your stays or finalize your booking request?`,
    friendlyGreeting: (duration) => `Tashi Delek! 🙏 Welcome to Sikkim Traveller! I'm here to craft your dream Himalayan holiday. From snow-clad passes to cozy boutique homestays and verified mountain 4WDs, we take care of everything. How can I help make your ${duration}-day adventure unforgettable?`,
    appreciationResponse: (duration) => `You're so very welcome! 🏔️ Nothing gives us more joy than helping travellers experience the authentic beauty and culture of Sikkim. Everything in your ${duration}-day itinerary is ready for booking whenever you're set. Shall we proceed?`
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

    removeActivity: (dayNum) => `मैं दिन ${dayNum} से एक गतिविधि हटा सकता हूँ ताकि आपको पर्याप्त आराम मिल सके।`,
    removeActivityCardTitle: (dayNum) => `दिन ${dayNum} से गतिविधि हटाएं`,
    removeActivityCardDesc: (dayNum) => `दिन ${dayNum} से अतिरिक्त गतिविधि हटाकर कार्यक्रम को हल्का बनाएं।`,
    removeActivityActionLabel: (dayNum) => `दिन ${dayNum} हल्का करें`,

    replaceDest: (oldD, newD) => `मैं ${oldD} की जगह ${newD} जोड़ सकता हूँ और मार्ग को पुनर्गठित कर सकता हूँ।`,
    replaceDestCardTitle: (oldD, newD) => `${oldD} को ${newD} से बदलें`,
    replaceDestCardDesc: (oldD, newD) => `आपके यात्रा मार्ग को ${oldD} से ${newD} में बदलकर समय संतुलित करता है।`,
    replaceDestActionLabel: (oldD, newD) => `${newD} पर स्विच करें`,

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
    permits: 'यात्रा परमिट: सिक्किम यात्रा इनर लाइन परमिट / रिस्ट्रिक्टेड एरिया परमिट (RAP/ILP) और प्रोटेक्टेड एरिया परमिट (PAP) द्वारा नियंत्रित है। भारतीय नागरिकों को त्सोमगो झील, बाबा मंदिर, नाथुला दर्रा और उत्तरी सिक्किम (लाचुंग, लाचेन, युमथांग, जीरो पॉइंट, गुरुडोंगमार) के लिए PAP आवश्यक है। विदेशी नागरिकों को सिक्किम प्रवेश के लिए 30-दिवसीय RAP आवश्यक है। उत्तरी सिक्किम में, विदेशी पर्यटकों को पंजीकृत टूर ऑपरेटर के माध्यम से कम से कम 2 व्यक्तियों के समूह में लाचुंग, युमथांग घाटी और लाचेन जाने की अनुमति है। हालांकि, गृह मंत्रालय के सीमा सुरक्षा नियमों के तहत विदेशी नागरिकों के लिए नाथुला दर्रा और गुरुडोंगमार झील में प्रवेश पूर्णतः प्रतिबंधित है। परमिट पहले से स्वीकृत नहीं होते।',
    altitudeWarning: 'ऊंचाई पर अनुकूलन सलाह: पर्याप्त पानी पिएं, लाचेन/लाचुंग में रात रुकने के बिना सीधे ऊंचाई पर न जाएं, और सिरदर्द होने पर तुरंत नीचे आएं।',
    foodCulture: 'सिक्किमी भोजन में मोमो, गरमा-गरम थुकपा, गुन्द्रुक सूप, किनेमा और छुरपी शामिल हैं। सांस्कृतिक दर्शन के लिए रुमटेक और पेमायांगत्से मठ अवश्य देखें।',
    recommend5Day: 'सिक्किम के लिए 5-दिवसीय आदर्श यात्रा कार्यक्रम: दिन 1 गंगटोक आगमन व एमजी मार्ग, दिन 2 त्सोमगो झील व बाबा मंदिर, दिन 3 पेलिंग यात्रा (रवांगला बुद्ध पार्क होते हुए), दिन 4 पेमायांगत्से मठ व स्काईवॉक, दिन 5 प्रस्थान।',
    northSikkimDurationNotice: (currentDur) => `उत्तरी सिक्किम (लाचुंग/लाचेन/युमथांग) जाने के लिए कम से कम 4 दिन आवश्यक हैं क्योंकि सड़क यात्रा में 6 घंटे लगते हैं। आपकी ${currentDur}-दिनों की योजना में 1 दिन जोड़ना सुरक्षित रहेगा।`,
    generalFallback: (duration) => `मैं आपका सिक्किम ट्रिप कोपायलट हूँ। मैं आपकी ${duration}-दिनों की यात्रा को बेहतर बनाने, मौसम व सड़क की जानकारी देने और बजट बचाने में मदद कर सकता हूँ।`,
    loveCompliment: (duration) => `बहुत-बहुत धन्यवाद! 🏔️✨ सिक्किम की खूबसूरत वादियां, कंचनजंघा का सुनहरा दृश्य और लाचुंग की शांत सुबहें आपका दिल जीत लेंगी। आपकी ${duration}-दिनों की यात्रा सचमुच यादगार होगी। क्या आप अपने होटल देखना चाहते हैं या सीधे बुकिंग शुरू करें?`,
    friendlyGreeting: (duration) => `ताशी देलेक! 🙏 सिक्किम ट्रेवलर में आपका स्वागत है। हम आपके लिए सपनों जैसी हिमालयी यात्रा तैयार करते हैं—आरामदायक होमस्टे, सुरक्षित 4WD गाड़ियां और सभी परमिट। आइए आपकी ${duration}-दिनों की यात्रा शुरू करें!`,
    appreciationResponse: (duration) => `आपका बहुत स्वागत है! 🏔️ सिक्किम की अद्भुत प्रकृति और संस्कृति का अनुभव कराना ही हमारा उद्देश्य है। आपकी ${duration}-दिनों की यात्रा योजना पूरी तरह तैयार है। क्या हम बुकिंग की ओर बढ़ें?`
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

    removeActivity: (dayNum) => `म दिन ${dayNum} बाट एउटा क्रियाकलाप हटाउन सक्छु ताकि तपाईंले पर्याप्त आराम पाउन सक्नुहोस्।`,
    removeActivityCardTitle: (dayNum) => `दिन ${dayNum} बाट गतिविधि हटाउनुहोस्`,
    removeActivityCardDesc: (dayNum) => `दिन ${dayNum} को तालिकालाई हल्का बनाउन अतिरिक्त गतिविधि हटाउँछ।`,
    removeActivityActionLabel: (dayNum) => `दिन ${dayNum} हल्का बनाउनुहोस्`,

    replaceDest: (oldD, newD) => `म ${oldD} को सट्टा ${newD} राखेर तपाईंको यात्रा मार्ग समायोजन गर्न सक्छु।`,
    replaceDestCardTitle: (oldD, newD) => `${oldD} लाई ${newD} सँग बदल्नुहोस्`,
    replaceDestCardDesc: (oldD, newD) => `तपाईंको भ्रमण मार्ग ${oldD} बाट ${newD} मा सारेर दैनिक यात्रा समय सन्तुलन गर्दछ।`,
    replaceDestActionLabel: (oldD, newD) => `${newD} मा सर्नुहोस्`,

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
    permits: 'यात्रा परमिट: सिक्किम भ्रमण इनर लाइन परमिट / रेस्ट्रिक्टेड एरिया परमिट (RAP/ILP) र संरक्षित क्षेत्र परमिट (PAP) द्वारा सञ्चालित हुन्छ। भारतीय नागरिकहरूलाई छोङ्गो ताल, बाबा मन्दिर, नाथुला भञ्ज्याङ र उत्तर सिक्किम (लाचुङ, लाचेन, युमथाङ उपत्यका, जिरो पोइन्ट, गुरुडोङमार) का लागि PAP चाहिन्छ। विदेशी नागरिकहरूलाई सिक्किम प्रवेशका लागि ३०-दिने RAP अनिवार्य छ। उत्तर सिक्किममा विदेशी पर्यटकहरूलाई दर्तावाला ट्राभल एजेन्सीमार्फत कम्तीमा २ जनाको समूहमा लाचुङ, युमथाङ र लाचेन भ्रमण गर्न अनुमति दिइएको छ। तर, गृह मन्त्रालयको सीमा सुरक्षा नियम अनुसार विदेशी नागरिकहरूलाई नाथुला भञ्ज्याङ र गुरुडोङमार ताल जान पूर्ण रूपमा प्रतिबन्ध लगाइएको छ। परमिट पहिले नै स्वीकृत हुँदैन।',
    altitudeWarning: 'लेक लाग्ने (AMS) सचेतना: प्रशस्त पानी पिउनुहोस्, लाचेन/लाचुङमा बास नबसी सिधै उच्च भागमा नउक्लनुहोस्, र टाउको दुखेमा तुरुन्त ओर्लनुहोस्।',
    foodCulture: 'सिक्किमी परिकारमा मोमो, थुक्पा, गुन्द्रुकको झोल, किनेमा र छुर्पी प्रसिद्ध छन्। ऐतिहासिक संस्कृतिका लागि रुम्तेक र पेमायाङत्से गुम्बा अवलोकन गर्नुहोस्।',
    recommend5Day: 'सिक्किमको उत्कृष्ट ५-दिने भ्रमण तालिका: दिन १ गान्तोक आगमन र एमजी मार्ग, दिन २ छोङ्गो ताल र बाबा मन्दिर, दिन ३ पेलिङ प्रस्थान (रवाङ्ला बुद्ध पार्क हुँदै), दिन ४ पेमायाङत्से गुम्बा र स्काइवाक, दिन ५ फिर्ती।',
    northSikkimDurationNotice: (currentDur) => `उत्तर सिक्किम (लाचुङ/लाचेन/युमथाङ) जान कम्तीमा ४ दिन चाहिन्छ किनकि सडक यात्रा ६ घण्टाभन्दा लामो हुन्छ। तपाईंको ${currentDur}-दिने तालिकामा १ दिन थप्नु उपयुक्त हुनेछ।`,
    generalFallback: (duration) => `म तपाईंको सिक्किम भ्रमण कोपाइलट हुँ। म तपाईंको ${duration}-दिने यात्रालाई परिष्कृत गर्न, मौसम/सडक जानकारी दिन र बजेट घटाउन मद्दत गर्न सक्छु।`,
    loveCompliment: (duration) => `धेरै धेरै धन्यवाद! 🏔️✨ कञ्चनजङ्घाको सुनौलो बिहानी, लाचुङका सल्लाघारी र हिमाली तालहरू देखेर तपाईं पक्कै पनि मन्त्रमुग्ध हुनुहुनेछ। तपाईंको ${duration}-दिने यात्रा जीवनभरको लागि अविस्मरणीय हुनेछ। के हामी तपाईंको होटल हेर्ने वा यात्रा बुकिङ अघि बढाउने?`,
    friendlyGreeting: (duration) => `टासी देलेक! 🙏 सिक्किम ट्राभलरमा हार्दिक स्वागत छ! हामी तपाईंको सहज र रोमाञ्चक हिमाली बिदाका लागि भरपर्दो गाडी, सुन्दर होमस्टे र परमिटको पूर्ण व्यवस्था गर्दछौं। तपाईंको ${duration}-दिने यात्रा कसरी सुरु गरौं?`,
    appreciationResponse: (duration) => `तपाईंलाई धेरै स्वागत छ! 🏔️ सिक्किमको वास्तविक सौन्दर्य र संस्कृति पस्कन पाउनु हाम्रो लागि खुसीको कुरा हो। तपाईंको ${duration}-दिने योजना तयार छ, के हामी बुकिङ सुरु गरौं?`
  }
};

/**
 * Returns localized template strings for the specified language.
 */
export function getMultilingualTemplates(lang = 'en') {
  return MULTILINGUAL_TEMPLATES[lang] || MULTILINGUAL_TEMPLATES.en;
}
