// Sikkim's six districts (post-2021 reorganization)
export const districts = [
  {
    slug: "gangtok",
    name: "Gangtok",
    elevation: "1,650m",
    tagline: "The capital, and your first breath of thin mountain air",
    cover: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&h=1100&fit=crop&q=80",
    highlights: ["MG Marg", "Rumtek Monastery", "Tsomgo Lake day trips"],
    description:
      "Gangtok is where most journeys begin — a hillside capital of monasteries, market streets, and your first proper view of the range you're about to walk into.",
  },
  {
    slug: "mangan",
    name: "Mangan",
    elevation: "3,800m",
    tagline: "North Sikkim's high valleys — Lachung, Lachen, Yumthang",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=1100&fit=crop&q=80",
    highlights: ["Yumthang Valley", "Lachung", "Lachen", "Gurudongmar Lake"],
    description:
      "The district that holds Sikkim's most dramatic altitude gain — rhododendron valleys, high alpine lakes, and villages that still run on their own rhythm.",
  },
  {
    slug: "namchi",
    name: "Namchi",
    elevation: "1,675m",
    tagline: "South Sikkim's tea terraces and pilgrimage hills",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1100&fit=crop&q=80",
    highlights: ["Ravangla", "Temi Tea Garden", "Char Dham"],
    description:
      "Gentler slopes and terraced tea estates — Namchi district trades altitude for green, unhurried country roads and long views of Kanchenjunga.",
  },
  {
    slug: "gyalshing",
    name: "Gyalshing",
    elevation: "2,150m",
    tagline: "West Sikkim — Pelling's monasteries and mountain lakes",
    cover: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&h=1100&fit=crop&q=80",
    highlights: ["Pelling", "Khecheopalri Lake", "Pemayangtse Monastery"],
    description:
      "Home to some of the oldest monasteries in the state and the closest road-accessible views of Kanchenjunga's west face.",
  },
  {
    slug: "pakyong",
    name: "Pakyong",
    elevation: "3,150m",
    tagline: "The old Silk Route — Nathula, Zuluk, and switchback roads",
    cover: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&h=1100&fit=crop&q=80",
    highlights: ["Nathula Pass", "Zuluk", "Silk Route viewpoints"],
    description:
      "A district defined by its roads — the old trade route to Tibet, hairpin bends stacked up a mountainside, and one of the few Indo-China border crossings open to travelers.",
  },
  {
    slug: "soreng",
    name: "Soreng",
    elevation: "1,340m",
    tagline: "Sikkim's newest district — quiet villages, working farms",
    cover: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&h=1100&fit=crop&q=80",
    highlights: ["Rimbi", "Dentam", "Organic farm homestays"],
    description:
      "The least-visited of the six — carved from West Sikkim in 2021 — where our homestay partners still outnumber the tourists.",
  },
];

export const getDistrictBySlug = (slug) =>
  districts.find((d) => d.slug === slug);

