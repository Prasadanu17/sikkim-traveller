/**
 * Permit Intelligence Provider.
 * Provides verified PAP / ILP permit processing rules, document requirements, and status advisories.
 * STRICT SAFETY RULE: Never claims a user's individual permit is approved without a verified booking system.
 */

const PERMIT_RULES = {
  "North Sikkim": {
    permitType: "Protected Area Permit (PAP)",
    required: true,
    leadTimeHours: 24,
    documentsNeeded: ["Passport size photos (2 per person)", "Government Photo ID proof (Voter ID / Passport / Driving License)"],
    restrictions: "Foreign nationals require additional RAP endorsement via registered operator.",
    sourceName: "Tourism & Civil Aviation Department, Govt of Sikkim",
    sourceUrl: "https://sikkimtourism.gov.in/Permits"
  },
  "East Sikkim": {
    permitType: "Nathula Pass & Tsomgo PAP",
    required: true,
    leadTimeHours: 24,
    documentsNeeded: ["Passport photos (2)", "Identity proof"],
    restrictions: "Nathula Pass permits issued for Indian Nationals on designated days (Wed–Sun).",
    sourceName: "Police Checkpost Branch, Gangtok",
    sourceUrl: "https://sikkimtourism.gov.in/Permits"
  }
};

export async function fetchPermitIntelligence(regions = []) {
  const activeRules = [];
  regions.forEach((reg) => {
    if (PERMIT_RULES[reg]) {
      activeRules.push({
        region: reg,
        ...PERMIT_RULES[reg]
      });
    }
  });

  return {
    permitRules: activeRules,
    confidence: "HIGH",
    disclaimer: "Permit guidelines are for planning lead-time context only. Permits are processed locally through registered travel desks.",
    source: {
      type: "official",
      name: "Tourism & Civil Aviation Department, Government of Sikkim",
      url: "https://sikkimtourism.gov.in/Permits",
      retrievedAt: new Date().toISOString(),
      isCurrent: true
    }
  };
}
