/**
 * Customer Portal Fallback Service — Module 11
 * Generates and persists realistic customer-safe mock booking records for development mode.
 * Storage key: st_customer_portal_mock_v1
 * All records are tagged with _isMockData: true.
 * NEVER used in production mode.
 */

const STORAGE_KEY = "st_customer_portal_mock_v1";

// ─────────────────────────────────────────────
// SEEDED REALISTIC MOCK RECORDS
// ─────────────────────────────────────────────

const SEED_RECORDS = [
  // 1. Proposal Awaiting Customer Approval
  {
    _isMockData: true,
    trackingToken: "ST-TRK-88219",
    publicRequestId: "ST-REQ-2026-0042",
    status: "AWAITING_CUSTOMER",
    priority: "HIGH",
    customer: {
      firstName: "Rahul",
      fullName: "Rahul Sharma",
      travelerCount: 2,
      email: "rahul.s@example.com",
      phone: "+91 98765 43210"
    },
    trip: {
      startDate: "2026-09-10",
      endDate: "2026-09-16",
      duration: 6,
      destinations: ["Gangtok", "Lachung", "Yumthang Valley"],
      travelStyle: "Balanced & Scenic"
    },
    itinerary: {
      version: 2,
      title: "Himalayan Vistas & North Sikkim Sanctuary (6D/5N)",
      days: [
        {
          dayNumber: 1,
          title: "Arrival & Ascent to Gangtok",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Airport arrival reception", "Scenic Teesta River drive", "MG Marg evening stroll"],
          activities: [
            { time: "Morning", title: "Arrival at Bagdogra (IXB) / NJP", description: "Private luxury chauffeur greeting and transfer through Sevoke Coronation Bridge." },
            { time: "Afternoon", title: "Check-in & Acclimatization", description: "Settle in at your panoramic valley-facing suite with herbal mountain tea." },
            { time: "Evening", title: "MG Marg Promenade", description: "Explore the pedestrian-only boulevard, Tibetan handicrafts, and local bakery treats." }
          ]
        },
        {
          dayNumber: 2,
          title: "Monasteries & Sacred Heritage",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Rumtek Monastery", "Do Drul Chorten", "Tashi Viewpoint sunset"],
          activities: [
            { time: "Morning", title: "Rumtek Dharma Chakra Centre", description: "Visit the seat of the Karmapa and marvel at 16th-century Tibetan Buddhist murals." },
            { time: "Afternoon", title: "Namgyal Institute of Tibetology", description: "Explore ancient Himalayan manuscripts, thangkas, and sacred bronze statues." },
            { time: "Evening", title: "Tashi Viewpoint Sunset", description: "Sunset golden-hour panoramas over Mount Kanchenjunga." }
          ]
        },
        {
          dayNumber: 3,
          title: "Expedition to North Sikkim (Lachung)",
          baseLocation: "Lachung",
          elevation: "8,858 ft",
          highlights: ["Seven Sister Waterfalls", "Singhik Viewpoint", "Apple orchards of Lachung"],
          activities: [
            { time: "Morning", title: "Scenic Drive northwards", description: "Drive along the Teesta gorge with stops at Seven Sisters & Naga Waterfalls." },
            { time: "Afternoon", title: "Singhik Panorama & Chungthang Confluence", description: "Spectacular vantage point of Mt. Siniolchu." },
            { time: "Evening", title: "Fireside Hospitality in Lachung", description: "Warm Sikkimese dinner by the hearth in a cozy wooden mountain chalet." }
          ]
        },
        {
          dayNumber: 4,
          title: "Yumthang Valley of Flowers & Hot Springs",
          baseLocation: "Lachung",
          elevation: "11,800 ft",
          highlights: ["Yumthang Alpine meadows", "Sulphur Hot Springs", "Zero Point (optional)"],
          activities: [
            { time: "Early Morning", title: "Yumthang Valley Alpine Excursion", description: "Explore the sub-alpine valley filled with rhododendrons and glacial streams." },
            { time: "Late Morning", title: "Natural Sulphur Thermal Spring", description: "Brief soothing stop at the historic thermal medicinal spring." },
            { time: "Afternoon", title: "Return to Lachung", description: "Traditional lunch followed by an evening village walk." }
          ]
        },
        {
          dayNumber: 5,
          title: "Return to Gangtok via Mangan",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Bhim Nala Falls", "Lachung Monastery", "Fine mountain dining"],
          activities: [
            { time: "Morning", title: "Lachung Monastery & Farewell", description: "Morning blessing and photo-walk through the centuries-old monastery." },
            { time: "Afternoon", title: "Southward Mountain Drive", description: "Comfortable cruise back to Gangtok with artisanal tea breaks." },
            { time: "Evening", title: "Celebratory Sikkimese Dinner", description: "Special curated local farm-to-table tasting menu." }
          ]
        },
        {
          dayNumber: 6,
          title: "Departure with Timeless Memories",
          baseLocation: "Bagdogra / NJP",
          elevation: "410 ft",
          highlights: ["Teesta Valley scenic descent", "Airport drop-off"],
          activities: [
            { time: "Morning", title: "Breakfast & Souvenirs", description: "Final mountain breakfast and handpicked Temi tea shopping." },
            { time: "Midday", title: "Transfer to Airport / Railhead", description: "Punctual transfer for onward departure." }
          ]
        }
      ]
    },
    budget: {
      estimated: 42000,
      currentProposal: 41500,
      currency: "INR"
    },
    accommodation: {
      status: "PROVISIONAL",
      selectedOption: "Mayfair Spa Resort Gangtok (Deluxe View) + Lachung Mountain Retreat"
    },
    transportation: {
      status: "PROVISIONAL",
      summary: "Private Toyota Innova Crysta (Dedicated Mountain Specialist Driver)"
    },
    permits: {
      status: "PROCESSING",
      customerRelevantIssues: [
        "Protected Area Permit (PAP) for Yumthang Valley required. Operational desk will finalize upon your proposal sign-off."
      ]
    },
    proposal: {
      version: 2,
      versionLabel: "Proposal v2",
      validUntil: "2026-09-02",
      price: 41500,
      currency: "INR",
      inclusions: [
        "5 Nights Premium Accommodation with Daily Mountain Breakfast & Dinner",
        "Exclusive Toyota Innova Crysta with all fuel, toll, parking & driver allowances",
        "North Sikkim Protected Area Permits (PAP) & Inner Line Permits (ILP) handling",
        "24/7 On-Ground Travel Operations Coordinator & Emergency Medical Protocol"
      ],
      exclusions: [
        "Airfare / Train tickets to and from Bagdogra / NJP",
        "Personal expenses, laundry, and tipping",
        "Zero Point optional extension supplement (paid directly on-site if weather permits)",
        "Travel Insurance (highly recommended)"
      ],
      updatedAt: "2026-08-20T10:30:00Z",
      summary: "Refined 6-Day Himalayan Journey featuring bespoke stays in Gangtok and high-altitude Lachung valley."
    },
    customerApproval: {
      accepted: false
    },
    documents: [
      {
        id: "DOC-001",
        name: "Custom Trip Itinerary & Proposal v2.pdf",
        type: "Final itinerary",
        status: "READY",
        date: "2026-08-20",
        version: "v2",
        downloadUrl: "#"
      }
    ],
    customerMessages: [
      {
        id: "MSG-001",
        sender: "operations",
        senderName: "Sikkim Operations Concierge",
        text: "Namaste Rahul! We have customized Proposal v2 with the upgraded mountain-view suite in Lachung as requested. Please review and confirm your approval.",
        timestamp: "2026-08-20T11:00:00Z"
      }
    ],
    nextAction: "Please review and approve Proposal v2 to lock in vehicle and suite allocations.",
    updatedAt: "2026-08-20T11:00:00Z"
  },

  // 2. Under Review Booking
  {
    _isMockData: true,
    trackingToken: "ST-TRK-10928",
    publicRequestId: "ST-REQ-2026-0089",
    status: "UNDER_REVIEW",
    priority: "NORMAL",
    customer: {
      firstName: "Ananya",
      fullName: "Ananya Bose",
      travelerCount: 1,
      email: "ananya.b@example.com",
      phone: "+91 97654 32109"
    },
    trip: {
      startDate: "2026-09-18",
      endDate: "2026-09-23",
      duration: 5,
      destinations: ["Gangtok", "Pelling", "Namchi"],
      travelStyle: "Cultural Heritage & Wellness"
    },
    itinerary: {
      version: 1,
      title: "Monasteries & Sacred Peaks (5D/4N)",
      days: [
        {
          dayNumber: 1,
          title: "Arrival & Foothill Serenity",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Arrive Gangtok", "Evening market walk"],
          activities: [{ time: "Day", title: "Transfer to Gangtok Hotel", description: "Scenic drive from Siliguri." }]
        },
        {
          dayNumber: 2,
          title: "Spiritual Gangtok",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Enchey Monastery", "Ganesh Tok"],
          activities: [{ time: "Day", title: "Heritage Sightseeing", description: "Visit historic monasteries." }]
        },
        {
          dayNumber: 3,
          title: "Journey to West Sikkim (Pelling)",
          baseLocation: "Pelling",
          elevation: "6,800 ft",
          highlights: ["Rabdentse Ruins", "Pemayangtse Monastery"],
          activities: [{ time: "Day", title: "West Sikkim Traverse", description: "Walk through ancient royal ruins." }]
        },
        {
          dayNumber: 4,
          title: "Skywalk & Holy Chenrezig",
          baseLocation: "Pelling",
          elevation: "6,800 ft",
          highlights: ["Pelling Glass Skywalk", "Kanchenjunga Falls"],
          activities: [{ time: "Day", title: "Pelling Exploration", description: "Panoramic skywalk and waterfalls." }]
        },
        {
          dayNumber: 5,
          title: "Namchi Char Dham & Departure",
          baseLocation: "Bagdogra",
          elevation: "410 ft",
          highlights: ["Siddheshwar Dham", "Return transfer"],
          activities: [{ time: "Day", title: "Namchi Pilgrimage & Drop", description: "Visit the colossal Shiva statue." }]
        }
      ]
    },
    budget: {
      estimated: 32000,
      currentProposal: null,
      currency: "INR"
    },
    accommodation: {
      status: "CHECKING",
      selectedOption: "Heritage Boutique Lodges (Verifying boutique room availability in Pelling)"
    },
    transportation: {
      status: "CHECKING",
      summary: "Private Sedan for solo traveler comfort"
    },
    permits: {
      status: "NOT_REQUIRED",
      customerRelevantIssues: []
    },
    proposal: null,
    customerApproval: {
      accepted: false
    },
    documents: [],
    customerMessages: [
      {
        id: "MSG-101",
        sender: "operations",
        senderName: "Operations Desk",
        text: "Hi Ananya, our destination architect is verifying boutique room availability in Pelling and matching local cultural guides.",
        timestamp: "2026-08-21T09:15:00Z"
      }
    ],
    nextAction: "Our travel architects are assembling your custom proposal and verifying hotel rates.",
    updatedAt: "2026-08-21T09:15:00Z"
  },

  // 3. Confirmed Trip
  {
    _isMockData: true,
    trackingToken: "ST-TRK-44912",
    publicRequestId: "ST-REQ-2026-0015",
    status: "CONFIRMED",
    priority: "HIGH",
    customer: {
      firstName: "Vikram",
      fullName: "Vikram Mehta",
      travelerCount: 4,
      email: "vikram.m@example.com",
      phone: "+91 96543 21098"
    },
    trip: {
      startDate: "2026-08-28",
      endDate: "2026-09-04",
      duration: 7,
      destinations: ["Gangtok", "Lachung", "Nathula Pass", "Yumthang Valley"],
      travelStyle: "Luxury Family Adventure"
    },
    itinerary: {
      version: 3,
      title: "Grand Sikkim Explorer (7D/6N)",
      days: [
        {
          dayNumber: 1,
          title: "Gangtok Grand Arrival",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Luxury Transfer", "Welcome High Tea at Mayfair"],
          activities: [{ time: "Day", title: "Arrival & Check-in", description: "VIP reception and orientation." }]
        },
        {
          dayNumber: 2,
          title: "Nathula Pass & Tsomgo Sacred Lake",
          baseLocation: "Gangtok",
          elevation: "14,140 ft",
          highlights: ["High Altitude Pass", "Baba Harbhajan Mandir", "Glacial Lake"],
          activities: [{ time: "Day", title: "Nathula Indo-China Border Expedition", description: "Military checkpoint clearance and breathtaking high mountain pass." }]
        },
        {
          dayNumber: 3,
          title: "Ascent to North Sikkim",
          baseLocation: "Lachung",
          elevation: "8,858 ft",
          highlights: ["Waterfalls", "Mountain Valleys"],
          activities: [{ time: "Day", title: "Scenic Transfer to Lachung", description: "Private luxury Scorpio journey." }]
        },
        {
          dayNumber: 4,
          title: "Yumthang Alpine Meadows & Zero Point",
          baseLocation: "Lachung",
          elevation: "15,300 ft",
          highlights: ["Zero Point snow views", "Rhododendron Sanctuary"],
          activities: [{ time: "Day", title: "Alpine Snow Experience", description: "Visit the northernmost snow valley." }]
        },
        {
          dayNumber: 5,
          title: "Lachung to Gangtok Retreat",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Temi Tea tasting", "Spa relaxation"],
          activities: [{ time: "Day", title: "Return to Gangtok Spa Resort", description: "Ayurvedic massage and relaxation." }]
        },
        {
          dayNumber: 6,
          title: "Heritage & Sikkimese Artisans",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Handicraft centre", "Ropeway cable car ride"],
          activities: [{ time: "Day", title: "Local Arts & Culture", description: "Explore Sikkim's traditional weaving." }]
        },
        {
          dayNumber: 7,
          title: "Farewell Himalayan Foothills",
          baseLocation: "Bagdogra",
          elevation: "410 ft",
          highlights: ["Souvenir gifts", "Chauffeur drop to airport"],
          activities: [{ time: "Day", title: "Departure", description: "Assisted check-in at Bagdogra airport." }]
        }
      ]
    },
    budget: {
      estimated: 68000,
      currentProposal: 66500,
      currency: "INR"
    },
    accommodation: {
      status: "CONFIRMED",
      selectedOption: "Mayfair Spa Resort Gangtok (2 Suites) & Yarlam Luxury Resort Lachung"
    },
    transportation: {
      status: "CONFIRMED",
      summary: "Dedicated 4WD Mahindra Scorpio with Mountain Specialist Driver Tenzing"
    },
    permits: {
      status: "APPROVED",
      customerRelevantIssues: ["Nathula Pass & Lachung Protected Area Permits officially approved by Tourism Dept."]
    },
    proposal: {
      version: 3,
      versionLabel: "Proposal v3",
      validUntil: "2026-08-25",
      price: 66500,
      currency: "INR",
      inclusions: [
        "6 Nights Luxury 5-Star & Heritage Chalet Accommodation",
        "Full Board Meals (Curated Organic Breakfast & Chef Dinners)",
        "Exclusive 4x4 Luxury Vehicle with Expert Mountain Driver Tenzing",
        "All PAP & Military Nathula Border Access Permits Pre-Cleared",
        "Dedicated 24/7 Operations Concierge & Private Oxygen Kits"
      ],
      exclusions: [
        "Flight tickets",
        "Personal shopping & alcoholic beverages"
      ],
      updatedAt: "2026-08-18T14:00:00Z",
      summary: "Comprehensive 7-day all-inclusive luxury family expedition."
    },
    customerApproval: {
      accepted: true,
      proposalVersion: 3,
      acceptedAt: "2026-08-18T14:20:00Z",
      customerName: "Vikram Mehta",
      _isMockApproval: true
    },
    documents: [
      {
        id: "DOC-201",
        name: "Official Booking Confirmation Voucher.pdf",
        type: "Booking confirmation",
        status: "ISSUED",
        date: "2026-08-19",
        version: "v3",
        downloadUrl: "#"
      },
      {
        id: "DOC-202",
        name: "Accommodation & Stay Vouchers.pdf",
        type: "Accommodation voucher",
        status: "ISSUED",
        date: "2026-08-19",
        version: "v3",
        downloadUrl: "#"
      },
      {
        id: "DOC-203",
        name: "Protected Area Travel Permits (PAP).pdf",
        type: "Permit document",
        status: "ISSUED",
        date: "2026-08-19",
        version: "v3",
        downloadUrl: "#"
      },
      {
        id: "DOC-204",
        name: "Final Comprehensive Itinerary v3.pdf",
        type: "Final itinerary",
        status: "ISSUED",
        date: "2026-08-19",
        version: "v3",
        downloadUrl: "#"
      }
    ],
    customerMessages: [
      {
        id: "MSG-201",
        sender: "operations",
        senderName: "Operations Desk",
        text: "Your journey is 100% confirmed! Driver Tenzing will meet you at Bagdogra Airport arrivals with a Sikkim Traveller name placard.",
        timestamp: "2026-08-19T15:00:00Z"
      }
    ],
    nextAction: "Your journey is confirmed! Review your travel documents and pack warm layers for Lachung & Nathula.",
    updatedAt: "2026-08-19T15:00:00Z"
  },

  // 4. Trip with Realtime Advisory
  {
    _isMockData: true,
    trackingToken: "ST-TRK-67382",
    publicRequestId: "ST-REQ-2026-0077",
    status: "AWAITING_CUSTOMER",
    priority: "HIGH",
    customer: {
      firstName: "Soo-Jin",
      fullName: "Soo-Jin Park",
      travelerCount: 2,
      email: "soojin@example.com",
      phone: "+82 10 1234 5678"
    },
    trip: {
      startDate: "2026-09-02",
      endDate: "2026-09-10",
      duration: 8,
      destinations: ["Gangtok", "Zuluk", "Silk Route"],
      travelStyle: "Photography & Remote Trails"
    },
    itinerary: {
      version: 1,
      title: "Old Silk Route Expedition & High Passes (8D/7N)",
      days: [
        {
          dayNumber: 1,
          title: "Arrive Gangtok",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Arrive Gangtok", "Photography briefing"],
          activities: [{ time: "Day", title: "Transfer to Gangtok", description: "Scenic mountain road journey." }]
        },
        {
          dayNumber: 2,
          title: "Gangtok to Aritar Lake",
          baseLocation: "Aritar",
          elevation: "4,900 ft",
          highlights: ["Lampokhari Lake", "Aritar Monastery"],
          activities: [{ time: "Day", title: "East Sikkim Lakes", description: "Boating and tranquil views." }]
        },
        {
          dayNumber: 3,
          title: "Ascent into Silk Route Loops (Zuluk)",
          baseLocation: "Zuluk",
          elevation: "9,400 ft",
          highlights: ["32 Hairpin Bends", "Rongli checkpoint"],
          activities: [{ time: "Day", title: "Famous Zuluk Loops", description: "World-famous switchback road photography." }]
        },
        {
          dayNumber: 4,
          title: "Thambi Sunrise & Lungthung Peak",
          baseLocation: "Zuluk",
          elevation: "12,500 ft",
          highlights: ["Thambi View Point", "Mt Kanchenjunga 180° panorama"],
          activities: [{ time: "Day", title: "Sunrise Photowalk", description: "Golden hour over eastern Himalayas." }]
        },
        {
          dayNumber: 5,
          title: "Old Baba Mandir & Kupup Elephant Lake",
          baseLocation: "Gnathang",
          elevation: "12,700 ft",
          highlights: ["Kupup Lake", "World Highest Golf Course marker"],
          activities: [{ time: "Day", title: "High Plateau Exploration", description: "Untouched alpine plains." }]
        },
        {
          dayNumber: 6,
          title: "Return to Gangtok via Tsomgo",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Tsomgo Lake", "Yak ride photo opp"],
          activities: [{ time: "Day", title: "Glacial Lake Crossing", description: "Descent back into Gangtok." }]
        },
        {
          dayNumber: 7,
          title: "Gangtok Culture & Local Cuisine",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Organic farming visit", "Traditional momo making"],
          activities: [{ time: "Day", title: "Rest & Gastronomy", description: "Relaxed cultural day." }]
        },
        {
          dayNumber: 8,
          title: "Departure",
          baseLocation: "Bagdogra",
          elevation: "410 ft",
          highlights: ["Airport drop-off"],
          activities: [{ time: "Day", title: "Airport Transfer", description: "Return transfer to flight." }]
        }
      ]
    },
    budget: {
      estimated: 58000,
      currentProposal: 57000,
      currency: "INR"
    },
    accommodation: {
      status: "PROVISIONAL",
      selectedOption: "Eco Heritage Homestays of Zuluk & Padamchen"
    },
    transportation: {
      status: "PROVISIONAL",
      summary: "High-Clearance 4x4 Bolero / Scorpio Camper"
    },
    permits: {
      status: "PROCESSING",
      customerRelevantIssues: [
        "Old Silk Route military special clearance in progress.",
        "Monsoon road maintenance advisories active along Zuluk loops."
      ]
    },
    proposal: {
      version: 1,
      versionLabel: "Proposal v1",
      validUntil: "2026-08-28",
      price: 57000,
      currency: "INR",
      inclusions: [
        "7 Nights Authentic Homestay & Eco Lodge Accommodation",
        "All Home-Cooked Organic Sikkimese Meals",
        "Dedicated 4x4 High-Clearance Vehicle with Mountain Specialist",
        "Silk Route Military Border Permits & Environmental Fees",
        "Local Photography Scout"
      ],
      exclusions: [
        "International & domestic airfare",
        "Personal camera equipment insurance"
      ],
      updatedAt: "2026-08-21T16:00:00Z",
      summary: "Bespoke 8-day Silk Route photography expedition through historic high-altitude Himalayan passes."
    },
    customerApproval: {
      accepted: false
    },
    documents: [
      {
        id: "DOC-401",
        name: "Silk Route Itinerary & Photography Guide v1.pdf",
        type: "Final itinerary",
        status: "READY",
        date: "2026-08-21",
        version: "v1",
        downloadUrl: "#"
      }
    ],
    customerMessages: [
      {
        id: "MSG-401",
        sender: "operations",
        senderName: "Operations Desk",
        text: "Namaste Soo-Jin! We have put together Proposal v1 for your Silk Route photography trip. We are also keeping a real-time monitor on post-monsoon road clearance for the high switchbacks.",
        timestamp: "2026-08-21T16:05:00Z"
      }
    ],
    nextAction: "Review Proposal v1. Realtime monsoon trail alerts are actively monitored by our road operations desk.",
    updatedAt: "2026-08-21T16:05:00Z"
  },

  // 5. Completed Trip
  {
    _isMockData: true,
    trackingToken: "ST-TRK-99014",
    publicRequestId: "ST-REQ-2026-0003",
    status: "COMPLETED",
    priority: "LOW",
    customer: {
      firstName: "Prashant",
      fullName: "Prashant Naidu",
      travelerCount: 1,
      email: "prashant.n@example.com",
      phone: "+91 95432 10987"
    },
    trip: {
      startDate: "2026-07-10",
      endDate: "2026-07-14",
      duration: 4,
      destinations: ["Gangtok", "Pelling"],
      travelStyle: "Relaxed & Nature"
    },
    itinerary: {
      version: 2,
      title: "Short Hills Rejuvenation (4D/3N)",
      days: [
        {
          dayNumber: 1,
          title: "Arrival in Sikkim",
          baseLocation: "Gangtok",
          elevation: "5,410 ft",
          highlights: ["Arrive Gangtok", "Relaxation"],
          activities: [{ time: "Day", title: "Resort check-in", description: "Welcome tea and rest." }]
        },
        {
          dayNumber: 2,
          title: "Pelling Valley",
          baseLocation: "Pelling",
          elevation: "6,800 ft",
          highlights: ["Pemayangtse Monastery"],
          activities: [{ time: "Day", title: "Monastery Tour", description: "Peaceful meditation and views." }]
        },
        {
          dayNumber: 3,
          title: "Helipad Sunrise & Waterfalls",
          baseLocation: "Pelling",
          elevation: "6,800 ft",
          highlights: ["Rimbi Waterfalls", "Khecheopalri Lake"],
          activities: [{ time: "Day", title: "Sacred Wishing Lake", description: "Visit the revered lake." }]
        },
        {
          dayNumber: 4,
          title: "Homebound Transfer",
          baseLocation: "Bagdogra",
          elevation: "410 ft",
          highlights: ["Return flight"],
          activities: [{ time: "Day", title: "Airport Drop", description: "Smooth transfer to Bagdogra." }]
        }
      ]
    },
    budget: {
      estimated: 24000,
      currentProposal: 23500,
      currency: "INR"
    },
    accommodation: {
      status: "COMPLETED",
      selectedOption: "Norbu Ghang Resort Pelling (Deluxe Cottage)"
    },
    transportation: {
      status: "COMPLETED",
      summary: "Private Sedan Chauffeur"
    },
    permits: {
      status: "NOT_REQUIRED",
      customerRelevantIssues: []
    },
    proposal: {
      version: 2,
      versionLabel: "Proposal v2",
      price: 23500,
      currency: "INR",
      inclusions: ["3 Nights Accommodation", "Daily Breakfast", "Private Chauffeur"],
      exclusions: ["Flight tickets"],
      updatedAt: "2026-07-02T10:00:00Z"
    },
    customerApproval: {
      accepted: true,
      proposalVersion: 2,
      acceptedAt: "2026-07-03T11:00:00Z",
      customerName: "Prashant Naidu",
      _isMockApproval: true
    },
    documents: [
      {
        id: "DOC-901",
        name: "Final Invoice & Tax Receipt.pdf",
        type: "Payment receipt",
        status: "ISSUED",
        date: "2026-07-15",
        version: "v2",
        downloadUrl: "#"
      },
      {
        id: "DOC-902",
        name: "Completed Trip Summary & Photos.pdf",
        type: "Other",
        status: "ISSUED",
        date: "2026-07-15",
        version: "v2",
        downloadUrl: "#"
      }
    ],
    customerMessages: [
      {
        id: "MSG-901",
        sender: "operations",
        senderName: "Operations Desk",
        text: "Thank you for travelling with Sikkim Traveller, Prashant! We hope your retreat was restorative.",
        timestamp: "2026-07-15T12:00:00Z"
      }
    ],
    nextAction: "Thank you for travelling with Sikkim Traveller. We hope your journey was unforgettable!",
    updatedAt: "2026-07-15T12:00:00Z"
  }
];

// ─────────────────────────────────────────────
// STORAGE CONTROLLERS
// ─────────────────────────────────────────────

/**
 * Initializes and seeds localStorage if empty or invalid.
 */
export function initMockStorage() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RECORDS));
      return SEED_RECORDS;
    }
    const parsed = JSON.parse(existing);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RECORDS));
      return SEED_RECORDS;
    }
    return parsed;
  } catch (_err) {
    return SEED_RECORDS;
  }
}

/**
 * Returns all mock bookings from localStorage.
 */
export function getMockBookings() {
  return initMockStorage();
}

/**
 * Finds a mock booking by tracking token or public request ID.
 * @param {string} token
 */
export function getMockBookingByToken(token) {
  if (!token) return null;
  const list = getMockBookings();
  const clean = token.trim().toUpperCase();

  let found = list.find(b =>
    b.trackingToken?.toUpperCase() === clean ||
    b.publicRequestId?.toUpperCase() === clean ||
    b.requestId?.toUpperCase() === clean ||
    b.accessToken?.toUpperCase() === clean
  );

  if (found) return found;

  // Search Operations mock bookings store (st_ops_mock_bookings_v1)
  try {
    const rawOps = localStorage.getItem("st_ops_mock_bookings_v1");
    if (rawOps) {
      const opsList = JSON.parse(rawOps);
      if (Array.isArray(opsList)) {
        const opsFound = opsList.find(b =>
          b.requestId?.toUpperCase() === clean ||
          b.publicRequestId?.toUpperCase() === clean ||
          b.trackingToken?.toUpperCase() === clean ||
          b.accessToken?.toUpperCase() === clean ||
          b.id?.toUpperCase() === clean
        );

        if (opsFound) {
          return {
            _isMockData: true,
            trackingToken: opsFound.trackingToken || opsFound.accessToken || opsFound.requestId,
            publicRequestId: opsFound.publicRequestId || opsFound.requestId,
            status: opsFound.status || "RECEIVED",
            priority: opsFound.priority || "NORMAL",
            customer: opsFound.customer || {
              firstName: (opsFound.traveler?.fullName || opsFound.traveler?.name || "Traveler").split(" ")[0],
              fullName: opsFound.traveler?.fullName || opsFound.traveler?.name || "Traveler",
              travelerCount: opsFound.traveler?.total || 2,
              email: opsFound.traveler?.email || "",
              phone: opsFound.traveler?.phone || ""
            },
            trip: opsFound.trip || {
              startDate: opsFound.trip?.startDate || new Date().toISOString().split("T")[0],
              endDate: opsFound.trip?.endDate || null,
              duration: opsFound.trip?.duration || 5,
              destinations: opsFound.destinations || ["Gangtok"],
              travelStyle: "Balanced"
            },
            itinerary: opsFound.itinerary || {
              version: 1,
              title: "Sikkim Journey",
              days: []
            },
            budget: opsFound.budget || {
              estimated: opsFound.budget?.estimatedRange?.min || 25000,
              currentProposal: null,
              currency: "INR"
            },
            accommodation: opsFound.accommodation || { status: "PROVISIONAL", selectedOption: "Standard Stays" },
            transportation: opsFound.transportation || { status: "PROVISIONAL", summary: "Private Cab" },
            permits: opsFound.permits || { status: "PROCESSING", customerRelevantIssues: [] },
            proposal: opsFound.proposal || null,
            customerApproval: opsFound.customerApproval || { accepted: false },
            documents: opsFound.documents || [],
            customerMessages: opsFound.customerMessages || [],
            nextAction: opsFound.nextAction || "Your booking request is under review by Sikkim Traveller operations desk.",
            updatedAt: opsFound.updatedAt || new Date().toISOString()
          };
        }
      }
    }
  } catch (_err) {
    // Ignore JSON parse errors
  }

  return null;
}

/**
 * Saves the full list of mock bookings to localStorage.
 * @param {Array} bookings
 */
export function saveMockBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (_err) {
    console.warn("[CustomerPortalFallback] Failed to save mock bookings to localStorage");
  }
}

/**
 * Updates a single mock booking by trackingToken.
 * @param {object} updatedBooking
 */
export function updateMockBooking(updatedBooking) {
  if (!updatedBooking?.trackingToken) return null;
  const list = getMockBookings();
  const index = list.findIndex(b => b.trackingToken === updatedBooking.trackingToken);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...updatedBooking,
      updatedAt: new Date().toISOString()
    };
    saveMockBookings(list);
    return list[index];
  }
  return null;
}

/**
 * Returns demo tokens for the quick switcher UI in development mode.
 */
export function getDemoTokens() {
  return [
    { token: "ST-TRK-88219", label: "Proposal Awaiting Approval (Rahul - 6D)", status: "AWAITING_CUSTOMER", badge: "Awaiting Approval" },
    { token: "ST-TRK-10928", label: "Under Review & Price Prep (Ananya - 5D)", status: "UNDER_REVIEW", badge: "Under Review" },
    { token: "ST-TRK-44912", label: "Confirmed Journey (Vikram - 7D)", status: "CONFIRMED", badge: "Confirmed" },
    { token: "ST-TRK-67382", label: "Realtime Advisory / Silk Route (Soo-Jin - 8D)", status: "AWAITING_CUSTOMER", badge: "Advisory Alert" },
    { token: "ST-TRK-99014", label: "Completed Trip (Prashant - 4D)", status: "COMPLETED", badge: "Completed" }
  ];
}
