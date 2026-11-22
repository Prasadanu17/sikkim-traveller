/**
 * src/services/i18n/multilingualTemplates.js
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
    
    // Warm conversational, emotional, and inspirational responses
    loveCompliment: (duration, hasItinerary = false) => hasItinerary
      ? `Aww, that warms my heart like a steaming cup of Temi tea on a misty morning in Ravangla! 🌸✨ But careful—flatter me like that and I might just whisk you away to Sikkim tomorrow!\n\nYour ${duration}-day journey is already beautifully mapped out. Imagine waking up to Mt. Kanchenjunga glowing pure gold from your balcony in Pelling, with every detail—from private mountain 4WDs to cozy stays—taken care of by our local team.\n\nWhat do you say—shall we make it real? Whenever you're ready to order your mountain holiday, simply say "Book this trip" or request a booking, and our Gangtok operations team will lock in your dates and permits! 🏔️❤️`
      : `Aww, that warms my heart like a fresh cup of Temi tea on a misty morning in Ravangla! 🌸✨ But careful—flatter me like that and I might just whisk you away to Sikkim!\n\nIf you think I'm charming, wait until you watch the morning sun turn Mt. Kanchenjunga to pure gold, stroll through mist-kissed pine forests, and hear sacred monastery bells echoing through the valley. Sikkim has an irresistible way of making everyone fall hopelessly in love.\n\nShall we turn that love into your dream holiday? Tell me how many days you have or who you're traveling with, and let's craft an escape you'll truly fall in love with! 🏔️❤️`,
    travelAspiration: (duration) => `Then perhaps it's time to turn that wish into a little Himalayan adventure! 🏔️ Imagine waking up to the Kanchenjunga mountain views, enjoying a peaceful morning in Pelling, or watching the clouds drift through the beautiful valleys of Lachung.\n\nI'd love to help you make this trip special. Are you dreaming of a peaceful escape, an adventure-filled holiday, or a little bit of both?`,
    travelInspiration: 'Sikkim truly feels like another world! 🌿 In just a few hours of driving, you transition from subtropical bamboo valleys and terraced tea gardens to 14,000-foot alpine meadows bordered by sacred snow peaks. The sheer variety of landscapes here takes your breath away.\n\nHave you visited the Himalayas before, or would this be your first time experiencing these mountain heights?',
    snowfall: 'Experiencing snowfall in Sikkim is pure magic! ❄️ The best chances for fresh snow are in North Sikkim—especially Yumthang Valley, Zero Point (15,300 ft), and Katao near Lachung—between late December and March. During this time, the pine forests and rivers are cloaked in white.\n\nAre you planning to travel during the winter months, or are you looking for high-altitude snow points in spring?',
    peacefulGetaway: 'If you are seeking peace and solitude away from tourist crowds, Sikkim has wonderful hidden sanctuaries. 🍃 Consider Ravangla for meditative mornings by Buddha Park and quiet walks in Temi Tea Estate, historic Yuksom surrounded by sacred lakes and ancient pines, or the untouched village homestays of Dzongu and Rinchenpong.\n\nWould you prefer staying in a peaceful village homestay with homemade organic food, or a quiet boutique mountain retreat?',
    familyTrip: "What a wonderful idea! Sikkim is one of India's safest, cleanest, and most hospitable destinations for families. 👨‍👩‍👧 For a comfortable family journey with both children and elders, a balanced circuit like Gangtok (cable car rides, flower shows, easy monastery visits) combined with Pelling (Kanchenjunga skywalk, scenic waterfalls) works beautifully without tiring high-altitude fatigue.\n\nHow many family members are traveling, and will there be young children or elderly grandparents with you?",
    romanticTrip: 'A romantic Sikkim journey is truly unforgettable. 🌸 Imagine sharing golden sunrise views over Mt. Kanchenjunga from your private balcony in Pelling, cozy evenings by a mountain fireplace, and peaceful walks through mist-kissed pine forests in Ravangla.\n\nHow many days are you envisioning for your romantic getaway? We can craft an intimate 4 to 6-day itinerary featuring boutique mountain chalets and private scenic transit.',
    budgetInquiry: 'Sikkim trip costs depend on your travel style, season, and vehicle requirements. Here is a realistic breakdown:\n\n• **Comfortable / Homestay Circuit**: ~₹3,500 – ₹5,500 per person/day (includes verified private mountain vehicle, dedicated local driver, cozy boutique homestays with breakfast & dinner, and permit assistance).\n• **Premium Mountain Resort Circuit**: ~₹7,500 – ₹12,000 per person/day (includes luxury 4-star/heritage hotels, premium SUV like Innova Crysta, all meals and VIP permit facilitation).\n\nNorth Sikkim circuits (Lachung/Lachen) include dedicated commercial SUV rates set by local transport syndicates. Would you like an exact estimate based on your preferred duration and group size?',
    budgetInclusions: 'Here is a clear breakdown of what is included in our estimated Sikkim Traveller pricing:\n\n**Included in Estimates:**\n• Dedicated private mountain vehicle (Scorpio/Bolero/Innova Crysta) with fuel, tolls, and experienced mountain driver allowances.\n• Handpicked boutique stays or premium hotels with complimentary breakfast & dinner.\n• Processing assistance for Sikkim Protected Area Permits (PAP) and Inner Line Permits.\n• 24/7 on-ground assistance from our Gangtok operations desk.\n\n**Exclusions:**\n• Personal expenses, snacks, and monastery entry tickets (typically ₹20–₹50).\n• High-altitude snow equipment rentals (boots/jackets at Zero Point/Tsomgo).\n• Optional union surcharge for Zero Point (approx ₹3,000–₹4,000 per vehicle, payable locally to driver if roads allow).\n\n*Note: Our displayed figures are deterministic estimates—exact pricing is confirmed upon reservation request based on your travel dates and vehicle allocation.*',
    bestTimeToVisit: 'The best time to visit Sikkim depends on the experience you seek:\n\n• **Spring (March to May)**: Mild temperatures (10°C–20°C) with vibrant rhododendrons and orchids blanketing Yumthang Valley and West Sikkim.\n• **Autumn (October to November)**: The clearest skies of the year with spectacular panoramic views of Mt. Kanchenjunga across Pelling and Gangtok.\n• **Winter (December to February)**: Crisp, snowy wonderland in North Sikkim (Zero Point, Katao) and high passes, perfect for snow lovers and quiet monastery retreats.\n• **Monsoon (July to August)**: Lush greenery and roaring waterfalls, though mountain roads are prone to landslides and driving delays.\n\nWhich season aligns best with your travel calendar?',
    northSikkimInquiry: 'Yes, visiting North Sikkim (Lachung, Yumthang Valley, and Zero Point) is one of the most unforgettable Himalayan experiences! 🏔️\n\nHere is what you need to know:\n• **Duration**: Requires at least 2 nights / 3 days from Gangtok due to the scenic 6-hour mountain drive each way.\n• **Permits**: Protected Area Permit (PAP) issued via registered Sikkim tour operators. Indian nationals can visit all areas including Gurudongmar Lake and Zero Point.\n• **Foreign Nationals**: Under Ministry of Home Affairs border guidelines, foreign visitors are welcome in Lachung and Yumthang Valley in groups of 2 or more with a registered agency; however, Nathula Pass and Gurudongmar Lake remain restricted.\n• **Altitude**: Zero Point reaches 15,300 ft and Gurudongmar reaches 17,800 ft—adequate acclimatization in Lachung/Lachen is essential.\n\nWould you like to incorporate North Sikkim into your itinerary?',
    destinationAdvice: 'Sikkim is naturally divided into four distinct travel circuits, each with its own charm:\n\n• **East Sikkim (Gangtok & Tsomgo Lake)**: Vibrant mountain capital, monasteries, ropeway, and the glacial Tsomgo Lake.\n• **West Sikkim (Pelling & Yuksom)**: The ultimate vantage point for Mt. Kanchenjunga, sacred Khecheopalri Lake, skywalk, and ancient capital.\n• **North Sikkim (Lachung & Yumthang)**: High alpine valleys, hot springs, Zero Point (15,300 ft), and dramatic waterfalls.\n• **South Sikkim (Ravangla & Namchi)**: Serene tea gardens, giant Buddha Park, and peaceful mountain temples.\n\nFor a first-time trip of 4 to 6 days, an East + West or East + North combination is most popular. Which landscape calls to you most?',
    startPlanning: "Wonderful! Let's bring your Sikkim vacation to life. 🏔️✨ We will tailor an itinerary that matches your dates, travel style, and favorite destinations.\n\nTo begin, tell me: how many days do you have in mind for your trip, and who will you be traveling with?",
    bookingReady: "Your custom Sikkim itinerary is ready to proceed as a verified reservation request! 🏔️📋\n\nHere is how our reservation process works:\n1. You submit your booking request with traveler names and preferred dates.\n2. Our local Gangtok operations team verifies live boutique hotel availability and allocates a verified mountain vehicle with a licensed local driver.\n3. We prepare your government permit documentation.\n\n*Note: This submits a reservation request for our team to verify and secure—no immediate payment is charged until availability is confirmed.* Click below to review your traveler details and send your request.",
    bookingNoItinerary: "To request a booking, we first need to shape your personalized itinerary so our local team has your exact destinations, dates, and stay preferences. 🗺️\n\nWould you like me to recommend a balanced 5-day Sikkim route, or would you like to select your preferred destinations first?",
    friendlyGreeting: (duration) => `Tashi Delek! 🙏 Welcome to Sikkim Traveller! I'm here to craft your dream Himalayan holiday. From snow-clad passes to cozy boutique homestays and verified mountain 4WDs, we take care of everything. How can I help make your ${duration}-day adventure unforgettable?`,
    appreciationResponse: (duration) => `You're so very welcome! 🏔️ Nothing gives us more joy than helping travellers experience the authentic beauty and culture of Sikkim. How else can I assist with your mountain plans?`
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
    loveCompliment: (duration, hasItinerary = false) => hasItinerary
      ? `अरे वाह, बहुत-बहुत शुक्रिया! यह बात सुनकर हमारा दिल यमथांग घाटी के खिले हुए बुरांश के फूलों जैसा खिल उठा! 🌸✨ यह प्यार पेलिंग की ठंडी सुबह में रवांगला (Ravangla) की एक कप गर्म तेमी चाय (Temi tea) जैसा सुकून देता है।\n\nलेकिन संभलिए—अगर आपको मुझसे इतना प्यार हो गया है, तो सोचिए जब आप पेलिंग की बालकनी से कंचनजंगा पर पहला सुनहरा सूर्योदय देखेंगे, तो सिक्किम से कितना गहरा प्यार हो जाएगा!\n\nआपकी ${duration}-दिनों की यात्रा योजना पहले से ही खूबसूरती से तैयार है। क्या ख्याल है—इसे एक असली यादगार सफर में बदलें? जब भी आप अपनी यात्रा बुक करना चाहें, बस "Book this trip" कहें और हमारी स्थानीय गंगटोक टीम आपके परमिट, 4WD वाहन और बुटीक होटलों की पूरी व्यवस्था कर देगी! 🏔️❤️`
      : `अरे वाह, बहुत-बहुत शुक्रिया! यह बात सुनकर हमारा दिल यमथांग घाटी के खिले हुए बुरांश के फूलों जैसा खिल उठा! 🌸✨ यह प्यार पेलिंग की ठंडी सुबह में रवांगला (Ravangla) की गर्म तेमी चाय (Temi tea) की चुस्की जैसा सुकून देता है।\n\nसिक्किम के शांत पहाड़, बर्फ से ढकी चोटियाँ और पाइन के जंगल आपका इंतज़ार कर रहे हैं। क्या हम आपके लिए एक सपनों जैसी छुट्टी की योजना बनाएं? बस बताइए आप कितने दिनों की यात्रा सोच रहे हैं या किसके साथ आ रहे हैं—आइए एक ऐसा सफर तैयार करें जिससे आपको सचमुच प्यार हो जाए! 🏔️❤️`,
    travelAspiration: (duration) => `तो फिर उस ख्वाहिश को एक खूबसूरत हिमालयी सफर में बदलने का सही वक्त आ गया है! 🏔️ कल्पना कीजिए—पेलिंग में कंचनजंघा के सामने जागना, छोङ्गो झील की शांति, और लाचुंग की हरी-भरी वादियों में तैरते बादल।\n\nमैं आपकी इस यात्रा को बेहद खास बनाने में मदद करूँगा। क्या आप एक शांत सुकून भरा सफर चाहते हैं, रोमांच से भरपूर यात्रा, या दोनों का एक सुंदर संतुलन?`,
    travelInspiration: 'सिक्किम सचमुच किसी जादुई दुनिया जैसा है! 🌿 कुछ ही घंटों के सफर में आप हरी-भरी चाय की ढलानों और बांस के जंगलों से निकलकर 14,000 फीट ऊंची बर्फीली वादियों में पहुंच जाते हैं। यहाँ की कुदरती खूबसूरती हर किसी को हैरान कर देती है।\n\nक्या आप पहले कभी हिमालय आ चुके हैं, या यह आपका पहला पहाड़ी सफर होगा?',
    snowfall: 'सिक्किम में बर्फबारी का अनुभव सचमुच अविस्मरणीय होता है! ❄️ ताज़ा बर्फबारी देखने के लिए सबसे बेहतरीन जगहें उत्तरी सिक्किम में हैं—खासकर युमथांग घाटी, ज़ीरो पॉइंट (15,300 फीट) और लाचुंग के पास काटाओ। दिसंबर के अंत से मार्च तक यहाँ चारों तरफ बर्फ की सफेद चादर बिछी होती है।\n\nक्या आप सर्दियों में यात्रा की योजना बना रहे हैं, या वसंत के मौसम में ऊंची बर्फीली चोटियों को देखना चाहते हैं?',
    peacefulGetaway: 'अगर आप भीड़भाड़ से दूर एक शांत और सुकून भरा सफर चाहते हैं, तो सिक्किम में बेहद खूबसूरत जगहें हैं। 🍃 आप बुद्ध पार्क और टेमी टी एस्टेट के पास रवांगला, पवित्र जंगलों से घिरे ऐतिहासिक युक्सोम, या रिनचेनपोंग के शांत मठों और विलेज होमस्टे का चयन कर सकते हैं।\n\nक्या आप स्थानीय जैविक भोजन वाले शांत विलेज होमस्टे में रुकना पसंद करेंगे, या किसी एकांत बुटीक माउंटेन रिसॉर्ट में?',
    familyTrip: 'यह तो बहुत ही प्यारा सरप्राइज है! सिक्किम पूरे भारत में परिवारों के लिए सबसे सुरक्षित, साफ और मेहमाननवाज़ राज्यों में से एक है। 👨‍👩‍👧 बच्चों और बुज़ुर्गों के साथ यात्रा के लिए गंगटोक (रोपवे, फ्लावर शो, त्सोमगो झील) और पेलिंग (कंचनजंघा व्यू, स्काईवॉक, झरने) का संतुलित सर्किट बहुत आरामदायक रहता है।\n\nपरिवार में कुल कितने सदस्य यात्रा कर रहे हैं, और क्या आपके साथ छोटे बच्चे या बुज़ुर्ग माता-पिता भी होंगे?',
    romanticTrip: 'सिक्किम में एक रोमांटिक सफर हमेशा के लिए यादगार बन जाता है। 🌸 पेलिंग में अपनी निजी बालकनी से कंचनजंघा पर सुबह की सुनहरी किरणें देखना, शाम को अंगीठी के पास बैठकर बातें करना, और रवांगला के शांत देवदार के जंगलों में सैर करना बेहद खूबसूरत अनुभव है।\n\nआप इस खास सफर के लिए कितने दिनों की योजना बना रहे हैं? हम आपके लिए निजी वाहन और बेहतरीन बुटीक होटलों के साथ 4 से 6 दिनों का खास प्लान बना सकते हैं।',
    budgetInquiry: 'सिक्किम यात्रा का खर्च आपकी पसंद, अवधि और वाहन पर निर्भर करता है। यहाँ एक वास्तविक अनुमान दिया गया है:\n\n• **आरामदायक होमस्टे सर्किट**: लगभग ₹3,500 – ₹5,500 प्रति व्यक्ति/दिन (जिसमें प्राइवेट पहाड़ी वाहन, स्थानीय चालक, स्वादिष्ट भोजन सहित बेहतरीन होमस्टे और परमिट शामिल हैं)।\n• **प्रीमियम रिसॉर्ट सर्किट**: लगभग ₹7,500 – ₹12,000 प्रति व्यक्ति/दिन (प्रीमियम होटल, इनोवा/एसयूवी और विशेष सुविधाएं)।\n\nउत्तरी सिक्किम के लिए विशेष व्यावसायिक वाहन नियम लागू होते हैं। क्या आप अपने यात्रियों की संख्या और दिनों के आधार पर सटीक बजट देखना चाहेंगे?',
    budgetInclusions: 'सिक्किम ट्रेवलर के अनुमानित बजट में क्या शामिल है और क्या नहीं, इसका स्पष्ट विवरण:\n\n**शामिल (Inclusions):**\n• समर्पित निजी पहाड़ी 4WD वाहन (Scorpio/Innova Crysta), ईंधन और अनुभवी चालक भत्ता।\n• नाश्ते व रात्रिभोज सहित बेहतरीन बुटीक होटल या होमस्टे।\n• सभी आवश्यक सरकारी परमिट (PAP/ILP) की दस्तावेज़ी सहायता।\n• हमारी गंगटोक टीम द्वारा 24/7 स्थानीय सहायता।\n\n**शामिल नहीं (Exclusions):**\n• व्यक्तिगत खर्च, स्नैक्स और मठों के प्रवेश शुल्क (लगभग ₹20–₹50)।\n• ज़ीरो पॉइंट/त्सोमगो पर जूते/जैकेट किराए पर लेना।\n• ज़ीरो पॉइंट के लिए वैकल्पिक स्थानीय यूनियन शुल्क (लगभग ₹3,000–₹4,000 प्रति वाहन)।\n\n*ध्यान दें: प्रदर्शित दरें अनुमानित हैं—आरक्षण अनुरोध भेजने पर तारीखों और होटल उपलब्धता के अनुसार सटीक पुष्टि की जाती है।*',
    bestTimeToVisit: 'सिक्किम यात्रा के लिए सबसे उत्तम समय आपकी पसंद पर निर्भर करता है:\n\n• **वसंत (मार्च से मई)**: सुहावना मौसम (10°C–20°C), खिले हुए बुरांश (rhododendron) के फूल और युमथांग घाटी की हरियाली।\n• **शरद ऋतु (अक्टूबर से नवंबर)**: साल का सबसे साफ आसमान और पेलिंग व गंगटोक से कंचनजंगा के अद्भुत दृश्य।\n• **सर्दियां (दिसंबर से फरवरी)**: उत्तरी सिक्किम (ज़ीरो पॉइंट, काटाओ) में बर्फबारी और शांतिपूर्ण मठ दर्शन।\n• **मानसून (जुलाई से अगस्त)**: भारी बारिश और भूस्खलन की संभावना, इसलिए यह समय पहाड़ी यात्रा के लिए कम अनुशंसित है।\n\nआप किस महीने में यात्रा की योजना बना रहे हैं?',
    northSikkimInquiry: 'हाँ, उत्तरी सिक्किम (लाचुंग, युमथांग घाटी और ज़ीरो पॉइंट) की यात्रा एक अविस्मरणीय हिमालयी अनुभव है! 🏔️\n\nज़रूरी जानकारी:\n• **अवधि**: गंगटोक से कम से कम 2 रात / 3 दिन का समय आवश्यक है क्योंकि दोनों तरफ 6 घंटे की पहाड़ी यात्रा है।\n• **परमिट**: संरक्षित क्षेत्र परमिट (PAP) पंजीकृत टूर ऑपरेटर के माध्यम से जारी किया जाता है। भारतीय नागरिक गुरुडोंगमार और ज़ीरो पॉइंट सहित सभी क्षेत्रों में जा सकते हैं।\n• **विदेशी नागरिक**: गृह मंत्रालय के नियमों के अनुसार विदेशी पर्यटक कम से कम 2 व्यक्तियों के समूह में लाचुंग और युमथांग जा सकते हैं, परंतु नाथुला दर्रा और गुरुडोंगमार झील उनके लिए प्रतिबंधित है।\n• **ऊंचाई**: ज़ीरो पॉइंट 15,300 फीट और गुरुडोंगमार 17,800 फीट पर है—लाचुंग/लाचेन में रुककर अनुकूलन करना आवश्यक है।\n\nक्या आप अपनी यात्रा में उत्तरी सिक्किम जोड़ना चाहते हैं?',
    destinationAdvice: 'सिक्किम मुख्य रूप से चार खूबसूरत भागों में बंटा हुआ है:\n\n• **पूर्वी सिक्किम (गंगटोक व त्सोमगो झील)**: राजधानी, संस्कृति, रोपवे और पवित्र झील।\n• **पश्चिमी सिक्किम (पेलिंग व युक्सोम)**: कंचनजंघा का निकटतम दृश्य, स्काईवॉक और ऐतिहासिक धरोहर।\n• **उत्तरी सिक्किम (लाचुंग व युमथांग)**: बर्फीली घाटियां, झरने और ज़ीरो पॉइंट (15,300 फीट)।\n• **दक्षिणी सिक्किम (रवांगला व नामची)**: विशाल बुद्ध पार्क और सुरम्य चाय बागान।\n\n4 से 6 दिनों की पहली यात्रा के लिए पूर्व + पश्चिम या पूर्व + उत्तर का संयोजन सबसे लोकप्रिय है। आप कौन सा देखना चाहेंगे?',
    startPlanning: 'बहुत बढ़िया! आइए आपकी सिक्किम यात्रा की योजना शुरू करते हैं। 🏔️✨ हम आपके समय और पसंद के अनुसार एक बेहतरीन कार्यक्रम तैयार करेंगे।\n\nशुरुआत के लिए बताइए: आप कितने दिनों की यात्रा सोच रहे हैं, और आपके साथ कौन-कौन यात्रा कर रहा है?',
    bookingReady: 'आपकी सिक्किम यात्रा का कार्यक्रम एक सत्यापित आरक्षण अनुरोध (Reservation Request) के रूप में आगे बढ़ने के लिए तैयार है! 🏔️📋\n\nप्रक्रिया इस प्रकार है:\n1. आप अपनी तारीखों और यात्रियों के विवरण के साथ अनुरोध भेजते हैं।\n2. हमारी गंगटोक टीम होटलों में कमरों की उपलब्धता जांचती है और प्राइवेट पहाड़ी वाहन व चालक आवंटित करती है।\n3. हम आपके सरकारी परमिट तैयार करते हैं।\n\n*ध्यान दें: यह हमारे स्थानीय दल द्वारा उपलब्धता सुनिश्चित करने हेतु एक आरक्षण अनुरोध है—कमरे सुनिश्चित होने से पहले कोई भुगतान नहीं लिया जाता।*',
    bookingNoItinerary: 'बुकिंग अनुरोध के लिए पहले एक यात्रा कार्यक्रम बनाना आवश्यक है ताकि हमारी टीम आपकी पसंद के अनुसार होटल और वाहन का प्रबंध कर सके। 🗺️\n\nक्या आप चाहेंगे कि मैं आपके लिए एक 5-दिवसीय योजना सुझाऊं, या आप पहले अपने पसंदीदा स्थान चुनना चाहेंगे?',
    friendlyGreeting: (duration) => `ताशी देलेक! 🙏 सिक्किम ट्रेवलर में आपका स्वागत है। हम आपके लिए सपनों जैसी हिमालयी यात्रा तैयार करते हैं—आरामदायक होमस्टे, सुरक्षित 4WD गाड़ियां और सभी परमिट। आइए आपकी ${duration}-दिनों की यात्रा शुरू करें!`,
    appreciationResponse: (duration) => `आपका बहुत स्वागत है! 🏔️ सिक्किम की अद्भुत प्रकृति और संस्कृति का अनुभव कराना ही हमारा उद्देश्य है। मैं आपकी यात्रा योजना में आगे कैसे सहायता कर सकता हूँ?`
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
    loveCompliment: (duration, hasItinerary = false) => hasItinerary
      ? `आहा, धेरै धेरै धन्यवाद! तपाईंको यो न्यानो मायाले यमथाङ उपत्यकाका राता लालीगुराँस जस्तै मनै प्रफुल्ल बनायो! 🌸✨ यो मिठो कुराले चिसो बिहानमा तातो चिया र रभाङ्ला (Ravangla) को तेमी चिया (Temi tea) को चुस्कीजस्तै आनन्द दियो।\n\nमलाई यति माया गर्नुहुन्छ भने, जब पेलिङको बालकनीबाट कञ्चनजङ्घाको पहिलो सुनौलो किरण देख्नुहुनेछ, तब सिक्किमको मायामा पुरै लठ्ठ पर्नुहुनेछ!\n\nतपाईंको ${duration}-दिने यात्रा पहिले नै निकै सुन्दर तरिकाले तयार भइसकेको छ। के भन्नुहुन्छ—यसलाई वास्तविक यात्रामा बदल्ने होइन त? जब पनि यात्रा बुक गर्न चाहनुहुन्छ, बस "Book this trip" भन्नुहोस् र हाम्रो स्थानीय गान्तोक टोलीले सम्पूर्ण प्रबन्ध मिलाउनेछ! 🏔️❤️`
      : `आहा, धेरै धेरै धन्यवाद! तपाईंको यो न्यानो माया र मिठो अभिव्यक्तिले चिसो बिहानमा तातो चिया र रभाङ्ला (Ravangla) को तेमी चिया (Temi tea) को चुस्कीजस्तै मन न्यानो बनायो! 🌸✨ सिक्किमका पवित्र हिमाल, सल्लाघारी र शान्त गुम्बाहरू तपाईंलाई पर्खिरहेका छन्।\n\nके हामी तपाईंको लागि एउटा मनमोहक यात्रा योजना सुरु गरौं? भन्नुहोस्, कति दिनको भ्रमण सोच्नुभएको छ वा को-कोसँग आउँदै हुनुहुन्छ—तपाईंलाई सधैं सम्झना रहने विशेष यात्रा तयार पारौं! 🏔️❤️`,
    travelAspiration: (duration) => `त्यसो भए त्यो रहरलाई एउटा सुन्दर हिमाली यात्रामा बदल्ने बेला आएको छ! 🏔️ कल्पना गर्नुहोस्—पेलिङबाट कञ्चनजङ्घाको बिहानी दृश्य, लाचुङका सल्लाघारीमा मडारिने बादल र पवित्र तालहरूको कञ्चन पानी।\n\nतपाईंको यो यात्रालाई अविस्मरणीय बनाउन म साथ दिनेछु। तपाईं शान्त एकान्त चाहनुहुन्छ, साहसिक रोमाञ्च, वा दुवैको मिठो संगम?`,
    travelInspiration: 'सिक्किम साँच्चै एउटा अलौकिक संसार जस्तै छ! 🌿 केही घण्टाको यात्रामा नै तपाईं हरिया चिया बगान र पहाडी खोलानालाबाट १४,००० फिट उचाइका हिउँले ढाकिएका उपत्यकामा पुग्न सक्नुहुन्छ। यहाँको प्राकृतिक दृश्यले जो कोहीलाई मोहित बनाउँछ।\n\nके तपाईं पहिले पनि हिमाली भेग घुम्नुभएको छ, वा यो तपाईंको पहिलो अनुभव हुनेछ?',
    snowfall: 'सिक्किममा हिउँ परेको देख्नु साँच्चै जादुई अनुभव हो! ❄️ ताजा हिउँ खेल्न र देख्नका लागि उत्तर सिक्किमका ठाउँहरू—विशेष गरी युमथाङ उपत्यका, जिरो पोइन्ट (१५,३०० फिट) र लाचुङ नजिकैको काटाओ सबैभन्दा उपयुक्त हुन्छन्। पुसदेखि फागुनसम्म यहाँ बाक्लो हिउँ पर्दछ।\n\nके तपाईं जाडो याममा भ्रमणको योजना बनाउँदै हुनुहुन्छ, वा वसन्त ऋतुमा हिउँ हेर्न जान चाहनुहुन्छ?',
    peacefulGetaway: 'यदि तपाईं भीडभाडबाट टाढा शान्त र एकान्त वातावरण खोज्दै हुनुहुन्छ भने सिक्किममा उत्कृष्ट ठाउँहरू छन्। 🍃 बुद्ध पार्क र टेमी चिया बगान नजिकैको रवाङ्ला, पवित्र ताल र प्राचीन सल्लाघारीले घेरिएको ऐतिहासिक युक्सोम, वा जोङ्गु र रिन्चेनपोङका शान्त गाउँहरू यसका लागि उत्तम छन्।\n\nके तपाईं स्थानीय अर्गानिक खाना पाइने शान्त होमस्टे रोज्न चाहनुहुन्छ, वा एकान्त बुटिक रिसोर्ट?',
    familyTrip: 'परिवारलाई यस्तो सरप्राइज दिनु कति राम्रो विचार! सिक्किम परिवारका साथ भ्रमण गर्नका लागि अत्यन्त सुरक्षित, सफा र पाहुना-मैत्री गन्तव्य हो। 👨‍👩‍👧 बालबच्चा र ज्येष्ठ नागरिकहरूसँगको यात्राका लागि गान्तोक (केबलकार, फुलबारी, छोङ्गो ताल) र पेलिङ (कञ्चनजङ्घा स्काईवाक, झरनाहरू) को सहज सर्किट निकै उपयुक्त हुन्छ।\n\nपरिवारमा कति जना सदस्य हुनुहुन्छ, र के सँगै साना बालबच्चा वा ज्येष्ठ आमाबुबा पनि हुनुहुन्छ?',
    romanticTrip: 'सिक्किममा रोमान्टिक यात्रा जीवनभरका लागि अविस्मरणीय हुनेछ। 🌸 पेलिङमा आफ्नै कोठाको बाल्कोनीबाट कञ्चनजङ्घामा पर्ने बिहानीको पहिलो घाम हेर्नु, साँझपख न्यानो चुल्हो नजिक बस्नु, र रवाङ्लाका सल्लाघारीमा शान्त पैदल यात्रा गर्नु निकै रमाइलो हुन्छ।\n\nयो विशेष यात्राका लागि तपाईं कति दिनको समय सोच्दै हुनुहुन्छ? हामी ४ देखि ६ दिनको रोमान्टिक र आरामदायी यात्रा योजना तयार गर्न सक्छौं।',
    budgetInquiry: 'सिक्किम यात्राको खर्च तपाईंको रोजाइ, दिन र गाडीको प्रकारमा भर पर्छ। यहाँ वास्तविक खर्चको विवरण छ:\n\n• **आरामदायी होमस्टे सर्किट**: करिब ₹३,५०० – ₹५,५०० प्रति व्यक्ति/दिन (यसमा निजी पहाडी गाडी, अनुभवी चालक, खानासहित राम्रो होमस्टे र परमिट सुविधा समावेश हुन्छ)।\n• **प्रीमियम रिसोर्ट सर्किट**: करिब ₹७,५०० – ₹१२,००० प्रति व्यक्ति/दिन (लक्जरी होटल, इनोभा गाडी र विशेष सेवा)।\n\nके तपाईं आफ्नो यात्रा अवधि र यात्री संख्या अनुसार विस्तृत अनुमानित बजेट जान्न चाहनुहुन्छ?',
    budgetInclusions: 'हाम्रो अनुमानित बजेटमा के-के समावेश छ भन्ने स्पष्ट विवरण:\n\n**समावेश (Inclusions):**\n• निजी पहाडी गाडी (Scorpio/Innova Crysta), इन्धन र अनुभवी चालक खर्च।\n• बिहानी खाजा र बेलुकीको खानासहित उत्कृष्ट बुटिक होटल वा होमस्टे।\n• सरकारी परमिट (PAP/ILP) कागजात सहायता।\n• हाम्रो गान्तोक टोलीबाट २४/७ स्थानीय सहयोग।\n\n**समावेश नभएको (Exclusions):**\n• व्यक्तिगत खर्च र गुम्बा प्रवेश शुल्क (करिब ₹२०–₹५०)।\n• जिरो पोइन्टमा हिउँका बुट/ज्याकेट भाडा।\n• जिरो पोइन्ट जानका लागि अतिरिक्त युनियन शुल्क (प्रति गाडी करिब ₹३,०००–₹४,०००)।\n\n*नोट: उल्लेखित रकमहरू अनुमानित हुन्—आरक्षण अनुरोध पठाएपछि मिति र उपलब्धता अनुसार यकिन रकम पुष्टि गरिन्छ।*',
    bestTimeToVisit: 'सिक्किम भ्रमणका लागि सबैभन्दा उपयुक्त मौसम तपाईंको रोजाइमा भर पर्छ:\n\n• **वसन्त ऋतु (फागुनदेखि वैशाख / March–May)**: हल्का न्यानो मौसम (10°C–20°C), युमथाङ उपत्यकामा फुल्ने राता लालीगुराँस र मनमोहक दृश्य।\n• **शरद ऋतु (असोजदेखि कार्तिक / Oct–Nov)**: कञ्चनजङ्घा हिमालको सफा र उत्कृष्ट दृश्य हेर्न वर्षकै सबैभन्दा राम्रो समय।\n• **हिउँद (मंसिरदेखि माघ / Dec–Feb)**: उत्तर सिक्किम (जिरो पोइन्ट, काटाओ) मा ताजा हिउँ र शान्त हिमाली वातावरण।\n• **वर्षायाम (असारदेखि साउन / July–Aug)**: अत्यधिक वर्षा र पहिरोको जोखिमका कारण पहाडी यात्राका लागि कम सिफारिस गरिन्छ।\n\nतपाईं कुन महिनामा भ्रमणको योजना सोच्दै हुनुहुन्छ?',
    northSikkimInquiry: 'हो, उत्तर सिक्किम (लाचुङ, युमथाङ उपत्यका र जिरो पोइन्ट) को भ्रमण जीवनभरकै अविस्मरणीय हिमाली अनुभव हो! 🏔️\n\nमुख्य जानकारी:\n• **अवधि**: गान्तोकबाट कम्तीमा २ रात / ३ दिन आवश्यक पर्छ किनकि ६ घण्टाको पहाडी यात्रा हुन्छ।\n• **परमिट**: दर्तावाला एजेन्सीमार्फत प्रोटेक्टेड एरिया परमिट (PAP) अनिवार्य हुन्छ।\n• **विदेशी नागरिक**: विदेशी पर्यटक कम्तीमा २ जनाको समूहमा लाचुङ र युमथाङ जान सक्छन्; तर नाथुला भञ्ज्याङ र गुरुडोङमार तालमा विदेशीलाई जान प्रतिबन्ध छ।\n• **उचाइ**: जिरो पोइन्ट १५,३०० फिट र गुरुडोङमार १७,८०० फिटमा छ—लाचुङ/लाचेनमा बास बसी अनुकूलन गर्नु अनिवार्य हुन्छ।\n\nके तपाईं आफ्नो तालिकामा उत्तर सिक्किम समावेश गर्न चाहनुहुन्छ?',
    destinationAdvice: 'सिक्किम मुख्यतया चार सुन्दर क्षेत्रहरूमा विभाजित छ:\n\n• **पूर्वी सिक्किम (गान्तोक र छोङ्गो ताल)**: मुख्य सहर, गुम्बा, केबलकार र पवित्र हिमाली ताल।\n• **पश्चिम सिक्किम (पेलिङ र युक्सोम)**: कञ्चनजङ्घाको उत्कृष्ट दृश्य, स्काईवाक र प्राचीन इतिहास।\n• **उत्तर सिक्किम (लाचुङ र युमथाङ)**: हिमाली उपत्यका, झरना र जिरो पोइन्ट।\n• **दक्षिण सिक्किम (रवाङ्ला र नाम्ची)**: विशाल बुद्ध पार्क र सुन्दर चिया बगान।\n\nपहिलो पटकको यात्राका लागि पूर्व + पश्चिम वा पूर्व + उत्तर संयोजन सबैभन्दा उत्तम हुन्छ। कुन भेग हेर्न मन छ?',
    startPlanning: 'धेरै राम्रो! आउनुहोस् तपाईंको सिक्किम यात्राको योजना सुरु गरौं। 🏔️✨ हामी तपाईंको रुचि र समय अनुसार उत्कृष्ट तालिका बनाउनेछौं।\n\nसुरुवातका लागि भन्नुहोस्: तपाईं कति दिनको भ्रमण सोच्दै हुनुहुन्छ, र सँगै को-को यात्रा गर्दै हुनुहुन्छ?',
    bookingReady: 'तपाईंको सिक्किम यात्रा तालिका एक प्रमाणित आरक्षण अनुरोध (Reservation Request) को रूपमा अघि बढाउन तयार छ! 🏔️📋\n\nप्रक्रिया यस प्रकार छ:\n१. तपाईं आफ्नो मिति र यात्रीहरूको विवरण पठाउनुहुन्छ।\n२. हाम्रो गान्तोक टोलीले होटेल कोठाको उपलब्धता रुजु गरी निजी गाडी र चालक निश्चित गर्दछ।\n३. हामी आवश्यक सरकारी परमिट कागजात तयार गर्छौं।\n\n*नोट: यो हाम्रो स्थानीय टोलीद्वारा उपलब्धता पुष्टि गर्नका लागि पठाइने आरक्षण अनुरोध हो—कोठा निश्चित नभएसम्म कुनै रकम लिइँदैन।*',
    bookingNoItinerary: 'बुकिङ अनुरोध पठाउनका लागि पहिले यात्रा तालिका बनाउनु आवश्यक हुन्छ ताकि हाम्रो टोलीले तपाईंको रोजाइ अनुसार होटेल र गाडी व्यवस्था गर्न सकोस्। 🗺️\n\nके म ५-दिने यात्रा मार्ग सिफारिस गरूँ, वा तपाईं पहिले आफ्ना रोजाइका स्थानहरू छनोट गर्न चाहनुहुन्छ?',
    friendlyGreeting: (duration) => `टासी देलेक! 🙏 सिक्किम ट्राभलरमा हार्दिक स्वागत छ! हामी तपाईंको सहज र रोमाञ्चक हिमाली बिदाका लागि भरपर्दो गाडी, सुन्दर होमस्टे र परमिटको पूर्ण व्यवस्था गर्दछौं। तपाईंको ${duration}-दिने यात्रा कसरी सुरु गरौं?`,
    appreciationResponse: (duration) => `तपाईंलाई धेरै स्वागत छ! 🏔️ सिक्किमको वास्तविक सौन्दर्य र संस्कृति पस्कन पाउनु हाम्रो लागि खुसीको कुरा हो। म तपाईंको यात्रा योजनामा थप कसरी मद्दत गर्न सक्छु?`
  }
};

/**
 * Returns localized template strings for the specified language.
 */
export function getMultilingualTemplates(lang = 'en') {
  return MULTILINGUAL_TEMPLATES[lang] || MULTILINGUAL_TEMPLATES.en;
}
