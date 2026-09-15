import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Users,
  Calendar as CalendarIcon,
  MapPin,
  Car,
  Hotel,
  ShieldCheck,
  Edit3,
  RotateCcw,
  Undo2,
  Printer,
  Search,
  Info,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import ItineraryDayCard from "./ItineraryDayCard";
import RegenerationModal from "./RegenerationModal";
import TripRefinementPanel from "./TripRefinementPanel";
import DayEditModal from "./DayEditModal";
import ItineraryDiffView from "./ItineraryDiffView";
import TravelAlertBanner from "./TravelAlertBanner";
import TravelIntelligencePanel from "./TravelIntelligencePanel";

export default function ItineraryResult({
  itineraryState,
  realtimeState,
  onRefine,
  onUndo,
  onUpdateDay,
  onRegenerate,
  onRefreshRealtime,
  onEditStep,
  onBookNow,
  onCreateJourney
}) {
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [diffViewData, setDiffViewData] = useState(null);
  const [forceExpandAll, setForceExpandAll] = useState(false);

  const { current: itinerary, history, isStale, source, explanation, tradeoffNotice } = itineraryState;

  if (!itinerary) return null;

  const { overview, whyThisTripWorks, days, budget, importantNotes } = itinerary;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrint = () => {
    setForceExpandAll(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setForceExpandAll(false), 500);
    }, 150);
  };

  const handleTradeoffAlternative = (alt) => {
    if (alt.action === "cancel") return;
    onRefine({ instruction: alt.label });
  };

  const realtimeImpact = realtimeState?.impact;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-left print:space-y-6">

      {/* REAL-TIME TRAVEL ALERT BANNER */}
      {realtimeImpact && (
        <TravelAlertBanner
          impact={realtimeImpact}
          onAskRefinement={(inst) => onRefine({ instruction: inst })}
        />
      )}

      {/* STALE ITINERARY WARNING BANNER */}
      {isStale && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 print:hidden"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs font-display">Trip Parameters Changed</h4>
              <p className="text-[11px] text-amber-800">Your trip settings were modified after generating this itinerary.</p>
            </div>
          </div>
          <button
            onClick={() => onRegenerate(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 text-white font-semibold text-xs px-5 py-2 hover:bg-amber-700 transition shrink-0"
          >
            <RotateCcw size={12} /> Regenerate Itinerary
          </button>
        </motion.div>
      )}

      {/* HEADER HERO BANNER */}
      <div className="bg-pine text-parchment rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden print:bg-white print:text-ink print:border print:shadow-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none print:hidden" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gold/20 text-gold border border-gold/30 print:border-neutral-300">
              <Sparkles size={12} /> Personalized Sikkim Journey
            </span>

            {/* Undo, Real-Time & AI Badges */}
            <div className="flex items-center gap-2 print:hidden">
              {realtimeImpact && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/10 text-gold border border-white/20 flex items-center gap-1">
                  <ShieldCheck size={11} /> {realtimeImpact.overallStatus}
                </span>
              )}
              {history && history.length > 0 && (
                <button
                  onClick={onUndo}
                  className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-parchment text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 transition"
                  title="Undo last modification"
                >
                  <Undo2 size={11} /> Undo Change
                </button>
              )}
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded ${
                source === "ai" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-gold/20 text-gold-light"
              }`}>
                {source === "ai" ? "✨ AI Generated" : "🗺️ Travel Intelligence Plan"}
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-parchment font-bold leading-tight print:text-ink">
            {itinerary.tripTitle || "Your Sikkim Itinerary"}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed print:text-neutral-600">
            {itinerary.summary}
          </p>

          {/* OVERVIEW METRICS STRIP */}
          <div className="pt-4 border-t border-neutral-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 print:border-neutral-200">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 block font-bold">Duration</span>
              <span className="text-base font-display font-semibold text-gold print:text-ink flex items-center gap-1 mt-0.5">
                <Clock size={14} /> {overview?.duration} Days
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 block font-bold">Travelers</span>
              <span className="text-base font-display font-semibold text-gold print:text-ink flex items-center gap-1 mt-0.5">
                <Users size={14} /> {overview?.travelers} ({overview?.travelerType})
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 block font-bold">Pace</span>
              <span className="text-base font-display font-semibold text-gold print:text-ink capitalize mt-0.5 block">
                {overview?.travelStyle}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 block font-bold">Estimated Cost</span>
              <span className="text-base font-display font-semibold text-gold print:text-ink mt-0.5 block">
                {formatPrice(overview?.estimatedCost?.min)} – {formatPrice(overview?.estimatedCost?.max)}
              </span>
            </div>
          </div>

          {/* ROUTE PILLS CHAIN */}
          {overview?.route && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-300">
              <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1">Route:</span>
              {overview.route.map((r, i) => (
                <span key={i} className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-neutral-200 font-medium print:border print:border-neutral-300 print:text-ink">
                  <MapPin size={11} className="text-gold" /> {r}
                  {i < overview.route.length - 1 && <span className="text-neutral-500 ml-1">→</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WHY THIS ITINERARY WORKS */}
      {whyThisTripWorks && whyThisTripWorks.length > 0 && (
        <div className="bg-cream border border-gold/30 rounded-2xl p-6 shadow-premium space-y-3">
          <h3 className="font-display text-sm uppercase tracking-widest font-bold text-gold-dark flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Why This Itinerary Works For You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whyThisTripWorks.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                <span className="text-gold font-bold">✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT: ITINERARY + REFINEMENT SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT 2 COLUMNS: DAY CARDS TIMELINE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink font-semibold">
              Day-by-Day Itinerary
            </h2>
            <span className="text-xs text-neutral-400 font-medium">{days?.length} Days Planned</span>
          </div>

          <div className="space-y-4">
            {days?.map((day) => {
              const dayAlerts = realtimeImpact?.alerts?.filter((a) => a.dayNumber === day.dayNumber) || [];
              return (
                <ItineraryDayCard
                  key={day.dayNumber}
                  day={day}
                  isDefaultExpanded={day.dayNumber <= 2}
                  forceExpand={forceExpandAll}
                  onEditDay={(d) => setEditingDay(d)}
                  dayRealtimeAlerts={dayAlerts}
                />
              );
            })}
          </div>

          {/* REAL-TIME TRAVEL INTELLIGENCE PANEL */}
          <div className="mt-10">
            <TravelIntelligencePanel
              realtimeState={realtimeState}
              onRefresh={onRefreshRealtime}
              isRefreshing={realtimeState?.isRefreshing}
            />
          </div>

          {/* CATEGORY BUDGET BREAKDOWN */}
          {budget && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-premium space-y-4 mt-8">
              <h3 className="font-display text-lg text-ink font-semibold flex items-center gap-2">
                <DollarSign size={18} className="text-gold-dark" /> Planning Budget Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Stay</span>
                  <span className="text-xs font-semibold text-ink mt-0.5 block">
                    {formatPrice(budget.accommodation?.min)} – {formatPrice(budget.accommodation?.max)}
                  </span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Transport</span>
                  <span className="text-xs font-semibold text-ink mt-0.5 block">
                    {formatPrice(budget.transportation?.min)} – {formatPrice(budget.transportation?.max)}
                  </span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Food</span>
                  <span className="text-xs font-semibold text-ink mt-0.5 block">
                    {formatPrice(budget.food?.min)} – {formatPrice(budget.food?.max)}
                  </span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Activities</span>
                  <span className="text-xs font-semibold text-ink mt-0.5 block">
                    {formatPrice(budget.activities?.min)} – {formatPrice(budget.activities?.max)}
                  </span>
                </div>
                <div className="bg-gold/10 p-3 rounded-xl border border-gold/30 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gold-dark font-bold uppercase block">Total Range</span>
                  <span className="text-xs font-bold text-pine mt-0.5 block">
                    {formatPrice(budget.total?.min)} – {formatPrice(budget.total?.max)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* IMPORTANT TRAVEL NOTES */}
          {importantNotes && importantNotes.length > 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-2">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Info size={14} /> Travel & Permit Considerations
              </h4>
              <ul className="space-y-1.5">
                {importantNotes.map((note, i) => (
                  <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                    <span className="text-gold-dark font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REFINEMENT PANEL SIDEBAR (HIDDEN IN PRINT) */}
        <div className="lg:col-span-1 print:hidden sticky top-36">
          <TripRefinementPanel
            onRefine={onRefine}
            isRefining={itineraryState.status === "generating"}
            explanation={explanation}
            tradeoffNotice={tradeoffNotice}
            onResolveTradeoff={handleTradeoffAlternative}
          />
        </div>

      </div>

      {/* ACTION CONTROL BAR (HIDDEN IN PRINT) */}
      <div className="pt-6 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefreshRealtime}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-pine text-xs font-semibold px-4 py-2.5 hover:bg-emerald-100 transition"
          >
            <Search size={13} /> Check Current Conditions
          </button>
          {history && history.length > 0 && (
            <button
              onClick={onUndo}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 text-ink text-xs font-semibold px-4 py-2.5 hover:border-gold hover:text-gold-dark transition"
            >
              <Undo2 size={13} /> Undo
            </button>
          )}
          <button
            onClick={() => setIsRegenModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 text-ink text-xs font-semibold px-4 py-2.5 hover:border-gold hover:text-gold-dark transition"
          >
            <RotateCcw size={13} /> Regenerate
          </button>
          <button
            onClick={() => onEditStep(1)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 text-ink text-xs font-semibold px-4 py-2.5 hover:border-gold hover:text-gold-dark transition"
          >
            <Edit3 size={13} /> Edit Preferences
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 text-ink text-xs font-semibold px-4 py-2.5 hover:border-gold hover:text-gold-dark transition"
          >
            <Printer size={13} /> Print / Save
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCreateJourney?.()}
            className="inline-flex items-center gap-2 rounded-full bg-pine text-gold font-bold text-xs px-6 py-3 hover:bg-gold hover:text-pine transition shadow-premium cursor-pointer"
          >
            Create My Sikkim Journey <Send size={13} />
          </button>
          <button
            onClick={onBookNow}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 text-ink text-xs font-semibold px-4 py-2.5 hover:border-gold hover:text-gold-dark transition cursor-pointer"
          >
            Booking Form
          </button>
        </div>
      </div>

      {/* MODALS */}
      <RegenerationModal
        isOpen={isRegenModalOpen}
        onClose={() => setIsRegenModalOpen(false)}
        onRegenerate={onRegenerate}
      />

      <DayEditModal
        isOpen={Boolean(editingDay)}
        day={editingDay}
        onClose={() => setEditingDay(null)}
        onUpdateDay={onUpdateDay}
      />

      <ItineraryDiffView
        isOpen={Boolean(diffViewData)}
        beforeItinerary={diffViewData?.before}
        afterItinerary={diffViewData?.after}
        diffSummary={diffViewData?.summary}
        onApply={() => setDiffViewData(null)}
        onCancel={() => setDiffViewData(null)}
      />

    </div>
  );
}
