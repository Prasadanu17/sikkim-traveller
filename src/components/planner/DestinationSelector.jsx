import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Sparkles,
  AlertTriangle,
  Check,
  X,
  Compass,
  Map,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { destinations as allDests } from "../../data/destinations";

const REGIONS = ["All", "East Sikkim", "North Sikkim", "West Sikkim", "South Sikkim"];

export default function DestinationSelector({
  destinationsState,
  duration,
  interests,
  setDestinationMode,
  toggleDestination,
  optimizeRoute,
  resetDestinations
}) {
  const { mode, selected, recommendations, routeAnalysis } = destinationsState;
  const { isValid, score: routeScore, warnings } = routeAnalysis;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState("All");
  const [expandedDest, setExpandedDest] = useState(null);
  
  // AI recommendations loading animation state
  const [aiLoadingStep, setAiLoadingStep] = useState(0); // 0: Idle, 1: Analyzing, 2: Matching, 3: Optimizing, 4: Done

  const handleStartAISelection = () => {
    setDestinationMode("ai");
    setAiLoadingStep(1);
  };

  // Run the loading steps simulation for AI Recommendations
  useEffect(() => {
    if (mode === "ai" && aiLoadingStep >= 1 && aiLoadingStep < 4) {
      const timer = setTimeout(() => {
        setAiLoadingStep((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [mode, aiLoadingStep]);

  // Filtered destinations list for manual browsing
  const filteredDestinations = allDests.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = activeRegion === "All" || dest.region === activeRegion;

    return matchesSearch && matchesRegion;
  });

  const getMatchedInterestsCount = (dest) => {
    return dest.interests.filter((i) => interests.includes(i)).length;
  };

  const getRegionBadgeColor = (region) => {
    switch (region) {
      case "East Sikkim": return "bg-blue-50 text-blue-700 border-blue-150";
      case "North Sikkim": return "bg-indigo-50 text-indigo-700 border-indigo-150";
      case "West Sikkim": return "bg-amber-50 text-amber-700 border-amber-150";
      case "South Sikkim": return "bg-emerald-50 text-emerald-700 border-emerald-150";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-150";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* 1. INITIAL CHOICE PANEL */}
      {!mode && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-xl mx-auto py-8"
        >
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-2">
            Where would you like to go in Sikkim?
          </h2>
          <p className="text-sm text-neutral-500 mb-8">
            Choose specific towns and attractions manually, or let Sikkim Traveller build the right destination combination for you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDestinationMode("manual")}
              className="flex flex-col items-center p-8 bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl text-center shadow-premium"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 mb-4 flex items-center justify-center">
                <Map size={20} />
              </div>
              <span className="font-display text-base text-ink mb-1">I'll Choose</span>
              <span className="text-xs text-neutral-400">Browse by region and select your spots</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartAISelection}
              className="flex flex-col items-center p-8 bg-cream border border-gold hover:border-gold-light rounded-2xl text-center shadow-gold-glow"
            >
              <div className="w-12 h-12 rounded-full bg-gold text-pine mb-4 flex items-center justify-center">
                <Sparkles size={20} className="fill-current" />
              </div>
              <span className="font-display text-base text-ink mb-1">Let AI Choose For Me</span>
              <span className="text-xs text-neutral-400">Optimized matching for your duration & season</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 2. AI RECOMMENDATIONS SCREEN */}
      {mode === "ai" && (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {aiLoadingStep < 4 ? (
              /* Loading screen simulation */
              <motion.div
                key="ai-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-16 bg-white border border-neutral-200 rounded-2xl shadow-premium"
              >
                <div className="relative mb-6">
                  <Sparkles size={36} className="text-gold animate-bounce" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-gold rounded-full -m-2"
                  />
                </div>
                <h3 className="font-display text-xl text-ink mb-2">Building Destination Combinations</h3>
                
                {/* Stepper loading messages */}
                <p className="text-sm text-gold-dark font-medium uppercase tracking-widest text-[10px]">
                  {aiLoadingStep === 1 && "Analyzing your interest parameters..."}
                  {aiLoadingStep === 2 && "Matching seasonal profiles & road accessibility..."}
                  {aiLoadingStep === 3 && "Optimizing route and distance transfers..."}
                </p>
              </motion.div>
            ) : (
              /* Recommendations list display */
              <motion.div
                key="ai-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold tracking-widest text-gold bg-pine rounded-full mb-3 uppercase">
                    <Sparkles size={12} className="fill-current" /> AI Recommendations
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1">
                    Your Recommended Destinations
                  </h2>
                  <p className="text-sm text-neutral-500 max-w-md mx-auto">
                    These destinations provide a balanced, backtracking-free circuit matching your {duration}-day trip parameters.
                  </p>
                </div>

                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.slug}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-premium flex flex-col md:flex-row"
                    >
                      <div className="md:w-1/3 relative h-48 md:h-auto min-h-[160px]">
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-4 text-parchment">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                            {rec.elevation}
                          </span>
                          <h4 className="font-display text-lg font-bold leading-tight">
                            {rec.name}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase ${getRegionBadgeColor(rec.region)}`}>
                              {rec.region}
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              {rec.score}% Compatibility
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 leading-normal line-clamp-2 mt-2">
                            {rec.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {rec.interests.slice(0, 3).map((i) => (
                              <span key={i} className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-500 font-sans">
                                #{i}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div>
                            <span className="text-neutral-400">Why recommended:</span>
                            <ul className="list-disc pl-4 text-neutral-600 font-medium space-y-0.5 mt-0.5 text-[11px]">
                              {rec.reasons.map((r, ri) => (
                                <li key={ri}>{r}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-cream border border-gold/25 text-gold-dark px-3 py-1.5 rounded-lg text-right shrink-0">
                            <span className="text-[9px] uppercase tracking-wide block font-semibold">Recommended stay</span>
                            <span className="font-display text-sm font-bold">{rec.recommendedDays} Day{rec.recommendedDays > 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4 mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p className="text-xs text-neutral-500 max-w-md leading-normal">
                    Want to customize this AI route? Switch to Manual Mode to edit recommendations, add destinations, or change durations.
                  </p>
                  <button
                    onClick={() => setDestinationMode("manual")}
                    className="shrink-0 bg-white hover:bg-neutral-50 text-ink font-semibold text-xs py-2.5 px-4 border border-neutral-300 rounded-lg shadow-sm transition"
                  >
                    Customize Selections
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3. MANUAL BROWSING SCREEN */}
      {mode === "manual" && (
        <div className="space-y-6">
          {/* Filters and Search controls */}
          <div className="bg-white p-4 rounded-xl border border-neutral-150 shadow-premium space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Sikkim destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-250 bg-neutral-50/50 text-sm outline-none focus:border-gold transition font-sans text-ink"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setDestinationMode("ai")}
                className="inline-flex items-center justify-center gap-1.5 bg-cream border border-gold hover:border-gold-light text-gold-dark font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
              >
                <Sparkles size={14} className="fill-current" /> Let AI Recommend
              </button>
            </div>

            {/* Region Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap tracking-wide transition ${
                    activeRegion === region
                      ? "bg-pine text-parchment"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-500 border border-neutral-200/50"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredDestinations.map((dest) => {
              const isSelected = selected.includes(dest.slug);
              const isExpanded = expandedDest === dest.slug;
              const matchedCount = getMatchedInterestsCount(dest);

              return (
                <motion.div
                  key={dest.slug}
                  layout
                  className={`bg-white border rounded-xl overflow-hidden shadow-premium flex flex-col justify-between transition-all ${
                    isSelected ? "border-gold ring-2 ring-gold/15" : "border-neutral-200"
                  }`}
                >
                  <div className="relative h-40 shrink-0">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3.5 text-parchment">
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-85 block">
                        {dest.elevation}
                      </span>
                      <h4 className="font-display text-base font-bold leading-tight">
                        {dest.name}
                      </h4>
                    </div>

                    {/* Checkmark bubble */}
                    <button
                      onClick={() => toggleDestination(dest.slug)}
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition ${
                        isSelected
                          ? "bg-gold text-pine hover:bg-gold-light"
                          : "bg-white/80 hover:bg-white text-neutral-500"
                      }`}
                    >
                      <Check size={14} strokeWidth={isSelected ? 3 : 2} />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`text-[9px] border px-2 py-0.5 rounded-full font-bold uppercase ${getRegionBadgeColor(dest.region)}`}>
                          {dest.region}
                        </span>
                        {matchedCount > 0 && (
                          <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-sans font-medium">
                            {matchedCount} Interest match{matchedCount > 1 ? "es" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                        {dest.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedDest(isExpanded ? null : dest.slug)}
                        className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wider"
                      >
                        Details <ChevronDown size={10} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <span className="text-[10px] text-neutral-400">
                        Stay: <span className="font-semibold text-neutral-600">{dest.recommendedDuration.ideal} days</span>
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-neutral-100 bg-neutral-50/50 p-4 text-xs space-y-3 text-left"
                      >
                        <div>
                          <span className="font-semibold text-neutral-600 block mb-1">Highlights:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-neutral-500">
                            {dest.highlights.map((h, hi) => (
                              <li key={hi}>{h}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-neutral-600 block">Altitude access warning:</span>
                          <p className="text-neutral-500 leading-normal mt-0.5">
                            {(dest.region === "North Sikkim" || (parseInt(dest.elevation.replace(/[^0-9]/g, ""), 10) || 0) > 3000) ? (
                              "⚠️ High altitude permits required. Road access is weather dependent and subject to sudden closures during severe winter snow or heavy monsoon landslide periods."
                            ) : (
                              "Standard regional access permits. Road links are generally stable throughout travel months."
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {filteredDestinations.length === 0 && (
              <div className="col-span-full text-center py-10 bg-white border rounded-xl">
                <HelpCircle size={30} className="text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No destinations found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DYNAMIC VALIDATION RECAP & SIDEBAR (Only visible when selections exist) */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white border border-neutral-200 rounded-xl shadow-premium overflow-hidden text-left"
        >
          {/* Summary status bar */}
          <div className="bg-pine px-5 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="text-parchment">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold opacity-85 block">
                Trip Route Composition
              </span>
              <h4 className="font-display text-base font-medium">
                {selected.length} Destination{selected.length > 1 ? "s" : ""} Selected
              </h4>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                isValid
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-amber-50 text-amber-600 border-amber-250"
              }`}>
                Route Score: {routeScore}%
              </span>
              {mode === "manual" && (
                <button
                  onClick={resetDestinations}
                  className="text-xs text-parchment/60 hover:text-rose-400 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Visual slugs flow */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {selected.map((slug, idx) => {
                const dest = allDests.find((d) => d.slug === slug);
                if (!dest) return null;
                return (
                  <div key={slug} className="flex items-center shrink-0">
                    <div className="bg-neutral-100 border border-neutral-200 text-ink font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <MapPin size={10} className="text-neutral-400" />
                      <span>{dest.name}</span>
                    </div>
                    {idx < selected.length - 1 && (
                      <span className="text-neutral-300 font-bold px-1.5">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Warnings warnings warning alert */}
            {!isValid && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex gap-2.5">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Trip Compatibility Notice
                    </h5>
                    <ul className="list-disc pl-4 text-xs text-amber-800 space-y-1 mt-1.5 leading-relaxed">
                      {warnings.map((warn, wIdx) => (
                        <li key={wIdx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-1 border-t border-amber-200/50 pl-6">
                  <button
                    onClick={optimizeRoute}
                    className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1.5 px-3 rounded shadow transition"
                  >
                    ✨ Optimize My Route
                  </button>
                  <button
                    onClick={() => {
                      // Set isValid manually in local view or dismiss. For simplicity, optimizeRoute is enough.
                    }}
                    className="text-xs text-amber-600 hover:text-amber-900 font-semibold hover:underline"
                  >
                    Keep My Destinations
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
