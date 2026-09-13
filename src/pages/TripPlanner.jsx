import { motion, AnimatePresence } from "framer-motion";
import useTripPlanner from "../hooks/useTripPlanner";
import PlannerProgress from "../components/planner/PlannerProgress";
import TravelDateSelector from "../components/planner/TravelDateSelector";
import TripDurationSelector from "../components/planner/TripDurationSelector";
import InterestSelector from "../components/planner/InterestSelector";
import BestTimeInsight from "../components/planner/BestTimeInsight";
import DestinationSelector from "../components/planner/DestinationSelector";
import TravelerSelector from "../components/planner/TravelerSelector";
import BudgetSelector from "../components/planner/BudgetSelector";
import AccommodationSelector from "../components/planner/AccommodationSelector";
import TransportationSelector from "../components/planner/TransportationSelector";
import PlannerSummary from "../components/planner/PlannerSummary";
import ItineraryLoading from "../components/planner/ItineraryLoading";
import ItineraryResult from "../components/planner/ItineraryResult";
import TripCopilot from "../components/copilot/TripCopilot";
import BookingJourney from "../components/booking/BookingJourney";
import JourneyCreatedModal from "../components/planner/JourneyCreatedModal";
import { checkBookingReadiness } from "../services/booking/bookingReadinessService";
import { createCustomerJourney } from "../services/customer/customerJourneyCreationService";
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Compass } from "lucide-react";
import { useEffect, useRef, useState } from "react";


export default function TripPlanner({ onOpenBooking }) {
  const {
    currentStep,
    state,
    isCalculating,
    startPlanning,
    setDates,
    setDuration,
    toggleInterest,
    setDestinationMode,
    toggleDestination,
    optimizeRoute,
    resetDestinations,
    setTravelers,
    setTravelStyle,
    setBudget,
    setAccommodation,
    setTransportation,
    generateTripItinerary,
    refineItineraryAction,
    undoItineraryAction,
    updateDayAction,
    fetchRealtimeIntelligenceAction,
    goToStep,
    nextStep,
    prevStep,
    resetPlanner,
    canContinue
  } = useTripPlanner();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [createdJourneyResult, setCreatedJourneyResult] = useState(null);

  // Direct passwordless journey creation handler
  const handleCreateJourneyDirectly = (customTravelerInfo = {}) => {
    const res = createCustomerJourney({
      plannerState: state,
      travelerInfo: customTravelerInfo
    });
    if (res.success) {
      setCreatedJourneyResult(res);
    }
  };

  // Scroll to top on step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, isCalculating, state.itinerary.status]);

  // Page SEO
  useEffect(() => {
    document.title = "AI Trip Planner - Sikkim Traveller";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Design your custom Sikkim journey using AI. Get seasonality scoring, optimal travel dates, destination matching, and personalised budget planning."
      );
    }
  }, []);

  // Listen for custom open-booking-wizard triggers (e.g. from Copilot).
  // We use a ref to always call the latest handleFinalSubmit without re-registering the listener.
  const handleFinalSubmitRef = useRef(null);
  useEffect(() => {
    const handleOpenWizard = () => handleFinalSubmitRef.current?.();
    window.addEventListener("open-booking-wizard", handleOpenWizard);
    return () => window.removeEventListener("open-booking-wizard", handleOpenWizard);
  }, []);

  // Final booking submission from summary or itinerary result
  const handleFinalSubmit = () => {
    const readiness = checkBookingReadiness(state);
    if (!readiness.ready) {
      alert(`Your trip is almost ready. Please complete your traveler details.\n\nMissing:\n- ${readiness.missingFields.join("\n- ")}`);
      return;
    }
    setIsBookingOpen(true);
  };
  handleFinalSubmitRef.current = handleFinalSubmit;

  const WIZARD_STEPS = [1, 2, 3, 5, 6, 7, 9, 10, 11];

  const getNextLabel = () => {
    if (currentStep === 3) return "Generate Insights";
    if (currentStep === 7) return "Choose Stay Preferences";
    if (currentStep === 9) return "Choose Transport";
    if (currentStep === 10) return "Review Summary";
    return "Continue";
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background Contour Texture */}
      <div className="absolute inset-0 bg-contour opacity-[0.03] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">

          {/* ─── STEP 0: Start Screen ─── */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto py-10"
            >
              <div className="w-16 h-16 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center mx-auto mb-6 shadow-premium animate-pulse">
                <Compass size={28} className="animate-spin-slow" />
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold-dark font-bold block mb-3">
                Introducing AI Travel Consultant
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-4">
                Plan Your Sikkim Trip with AI
              </h1>
              <p className="text-sm sm:text-base text-neutral-500 max-w-lg mx-auto leading-relaxed mb-10 font-sans">
                Tell us what you want to experience. We'll help you find the right time, select the perfect destinations, and build your bespoke Himalayan journey.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={startPlanning}
                className="inline-flex items-center gap-2 rounded-full bg-pine text-parchment font-semibold text-sm px-10 py-4 hover:bg-gold hover:text-pine hover:shadow-gold-glow transition-all duration-300"
              >
                Start Planning <Sparkles size={14} className="fill-current" />
              </motion.button>
            </motion.div>
          )}

          {/* ─── LOADING (Intelligence or Itinerary Generation) ─── */}
          {isCalculating && state.itinerary.status !== "generating" && (
            <motion.div
              key="loading-calc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="relative flex items-center justify-center mb-6">
                <Loader2 size={40} className="text-gold animate-spin shrink-0 z-10" />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-12 h-12 bg-gold/30 rounded-full z-0"
                />
              </div>
              <h3 className="font-display text-xl text-ink mb-1.5">Analyzing Sikkim Travel Intelligence</h3>
              <p className="text-xs text-neutral-400 max-w-xs leading-normal">
                Evaluating seasonal rainfall, high-pass weather restrictions, and matching your activity interests...
              </p>
            </motion.div>
          )}

          {/* ─── ITINERARY GENERATION ANIMATED OVERLAY ─── */}
          {state.itinerary.status === "generating" && (
            <motion.div key="loading-itinerary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ItineraryLoading />
            </motion.div>
          )}

          {/* ─── WIZARD STEPS ─── */}
          {WIZARD_STEPS.includes(currentStep) && !isCalculating && state.itinerary.status !== "generating" && (
            <motion.div
              key={`wizard-step-${currentStep}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between"
            >
              <PlannerProgress currentStep={currentStep} />

              <div className="flex-1 py-4">
                {currentStep === 1 && (
                  <TravelDateSelector
                    dates={state.dates}
                    onChangeDates={setDates}
                    setDuration={setDuration}
                  />
                )}
                {currentStep === 2 && (
                  <TripDurationSelector
                    duration={state.duration}
                    setDuration={setDuration}
                    isFixedDates={state.dates.mode === "fixed"}
                  />
                )}
                {currentStep === 3 && (
                  <InterestSelector
                    selectedInterests={state.interests}
                    onToggleInterest={toggleInterest}
                  />
                )}
                {currentStep === 5 && (
                  <DestinationSelector
                    destinationsState={state.destinations}
                    duration={state.duration}
                    interests={state.interests}
                    setDestinationMode={setDestinationMode}
                    toggleDestination={toggleDestination}
                    optimizeRoute={optimizeRoute}
                    resetDestinations={resetDestinations}
                  />
                )}
                {currentStep === 6 && (
                  <TravelerSelector
                    travelers={state.travelers}
                    travelStyle={state.travelStyle}
                    onChangeTravelers={setTravelers}
                    onChangeStyle={setTravelStyle}
                  />
                )}
                {currentStep === 7 && (
                  <BudgetSelector
                    budgetState={state.budget}
                    budgetIntelligence={state.budgetIntelligence}
                    onChangeBudget={setBudget}
                    goToStep={goToStep}
                  />
                )}
                {currentStep === 9 && (
                  <AccommodationSelector
                    accommodation={state.accommodation}
                    travelPreferences={state.travelPreferences}
                    budget={state.budget}
                    travelers={state.travelers}
                    onChangeAccommodation={setAccommodation}
                  />
                )}
                {currentStep === 10 && (
                  <TransportationSelector
                    transportation={state.transportation}
                    travelPreferences={state.travelPreferences}
                    budget={state.budget}
                    destinations={state.destinations.selected}
                    travelers={state.travelers}
                    travelStyle={state.travelStyle}
                    onChangeTransportation={setTransportation}
                  />
                )}
                {currentStep === 11 && (
                  <PlannerSummary
                    state={state}
                    goToStep={goToStep}
                    onGenerateItinerary={() => generateTripItinerary(null)}
                    onSubmit={handleFinalSubmit}
                    onCreateJourney={handleCreateJourneyDirectly}
                  />
                )}
              </div>

              {/* Navigation — hidden on summary */}
              {currentStep !== 11 && (
                <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-4 mt-12 border-t border-neutral-100 pt-6">
                  <button
                    onClick={prevStep}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-400 hover:text-ink transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>

                  <motion.button
                    whileHover={canContinue() ? { scale: 1.02 } : {}}
                    whileTap={canContinue() ? { scale: 0.98 } : {}}
                    onClick={nextStep}
                    disabled={!canContinue()}
                    className={`inline-flex items-center gap-2 rounded-full font-semibold text-sm px-8 py-3.5 transition-all ${
                      canContinue()
                        ? "bg-marigold text-pine hover:bg-gold-light hover:shadow-gold-glow"
                        : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    {getNextLabel()} <ArrowRight size={14} />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── STEP 4: Timing Insights ─── */}
          {currentStep === 4 && !isCalculating && (
            <BestTimeInsight
              travelIntelligence={state.travelIntelligence}
              state={state}
              onBookNow={onOpenBooking}
              onReset={resetPlanner}
              onNext={nextStep}
            />
          )}

          {/* ─── STEP 12: ITINERARY RESULT VIEW ─── */}
          {currentStep === 12 && !isCalculating && state.itinerary.status !== "generating" && (
            <motion.div
              key="step-12-itinerary"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <PlannerProgress currentStep={12} />
              <ItineraryResult
                itineraryState={state.itinerary}
                plannerState={state}
                realtimeState={state.realtimeIntelligence}
                onRefine={(req) => refineItineraryAction(req)}
                onUndo={undoItineraryAction}
                onUpdateDay={(dNum, dChanges) => updateDayAction(dNum, dChanges)}
                onRegenerate={(pref) => generateTripItinerary(pref)}
                onRefreshRealtime={() => fetchRealtimeIntelligenceAction()}
                onEditStep={(stepIdx) => goToStep(stepIdx)}
                onViewSummary={() => goToStep(11)}
                onBookNow={() => handleFinalSubmit()}
                onCreateJourney={handleCreateJourneyDirectly}
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* ─── MODULE 8: AI TRIP COPILOT FLOATING ASSISTANT ─── */}
        {currentStep >= 1 && (
          <TripCopilot
            plannerState={state}
            onRefineItinerary={(req) => refineItineraryAction(req)}
          />
        )}

        {/* ─── MODULE 9: SMART BOOKING WIZARD OVERLAY ─── */}
        {isBookingOpen && (
          <BookingJourney
            plannerState={state}
            onClose={() => setIsBookingOpen(false)}
            onToggleCopilot={() => window.dispatchEvent(new CustomEvent("open-copilot"))}
            onJourneyCreated={(res) => {
              setIsBookingOpen(false);
              setCreatedJourneyResult(res);
            }}
          />
        )}

        {/* ─── MODULE 17: JOURNEY CREATED MODAL ─── */}
        <JourneyCreatedModal
          journeyResult={createdJourneyResult}
          isOpen={Boolean(createdJourneyResult)}
          onClose={() => setCreatedJourneyResult(null)}
        />
      </div>
    </div>
  );
}
