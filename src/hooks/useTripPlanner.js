import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getBestTravelWindow } from "../services/travelIntelligence/bestTimeService";
import {
  getRecommendedDestinations,
  validateDestinationCombination,
  optimizeDestinationRoute
} from "../services/travelIntelligence/destinationRecommendationService";
import {
  estimateTripBudget,
  analyzeBudgetMatch
} from "../services/travelIntelligence/budgetService";
import { getTravelPreferenceRecommendations } from "../services/travelIntelligence/travelPreferenceService";
import { generateItinerary } from "../services/itinerary/itineraryGeneratorService";
import { refineTripItinerary } from "../services/itinerary/itineraryRefinementService";
import { applyItineraryPatch } from "../services/itinerary/itineraryPatchService";
import { checkTripRealtimeIntelligence } from "../services/realtime/realtimeIntelligenceService";
import { processCopilotMessage } from "../services/copilot/copilotService";
import { destinations as allDests } from "../data/destinations";

const DEFAULT_STATE = {
  dates: {
    mode: "fixed", // fixed | flexible
    start: "",
    end: ""
  },
  duration: 5,
  interests: [],
  destinations: {
    mode: null, // null | 'manual' | 'ai'
    selected: [],
    recommendations: [],
    routeAnalysis: {
      isValid: true,
      score: 100,
      warnings: []
    }
  },
  travelers: {
    type: "", // solo | couple | family | friends | group
    adults: 1,
    children: 0,
    seniors: 0,
    total: 1,
    childrenAgeGroups: []
  },
  travelStyle: "balanced", // relaxed | balanced | packed
  budget: {
    mode: null, // null | 'fixed' | 'estimate'
    level: "comfortable", // budget | comfortable | premium | luxury
    targetMin: 0,
    targetMax: 0,
    currency: "INR"
  },
  budgetIntelligence: null,
  travelIntelligence: null,
  accommodation: {
    mode: "recommend",
    types: [],
    comfort: "",
    roomPreference: "",
    locationPreferences: [],
    priorities: []
  },
  transportation: {
    mode: "recommend",
    preferredModes: [],
    comfort: "",
    longDriveTolerance: "",
    transferPreference: "",
    arrivalPreference: "flexible",
    departurePreference: "flexible"
  },
  travelPreferences: {
    comfortOptimized: false,
    notes: [],
    accommodationSuggestions: [],
    transportSuggestions: []
  },
  // MODULES 5 + 6
  itinerary: {
    status: "idle",             // idle | generating | success | fallback | error
    current: null,
    previous: null,
    history: [],                // Undo history stack
    isStale: false,             // Set true if wizard settings change post-generation
    generatedAt: null,
    source: null,               // ai | fallback
    explanation: null,
    tradeoffNotice: null,
    error: null,
    regenerationPreference: null
  },
  // MODULE 7
  realtimeIntelligence: {
    status: "idle",
    isCurrent: false,
    data: null,
    impact: null,
    lastChecked: null,
    isRefreshing: false
  },
  // MODULE 8: AI TRIP COPILOT
  copilot: {
    status: "idle",
    lastMessage: null,
    error: null
  }
};

export default function useTripPlanner() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState(() => {
    const destinationQuery = searchParams.get("destination");
    let initialSelected = [];
    let initialMode = null;
    
    if (destinationQuery) {
      const match = allDests.find(
        (d) => d.slug === destinationQuery || d.district === destinationQuery
      );
      if (match) {
        initialSelected = [match.slug];
        initialMode = "manual";
      }
    }

    return {
      ...DEFAULT_STATE,
      destinations: {
        ...DEFAULT_STATE.destinations,
        mode: initialMode,
        selected: initialSelected
      }
    };
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState(null);

  const DRAFT_KEY = "st_trip_planner_draft_v2";

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state && (parsed.currentStep > 0 || parsed.state?.itinerary?.current)) {
          setHasSavedDraft(true);
          setSavedDraftInfo({
            currentStep: parsed.currentStep,
            duration: parsed.state.duration || 5,
            destinationCount: parsed.state.destinations?.selected?.length || 0,
            hasItinerary: Boolean(parsed.state.itinerary?.current),
            savedAt: parsed.savedAt || Date.now()
          });
        }
      }
    } catch (_) {
      // Ignore storage read errors
    }
  }, []);

  // Persist draft to localStorage when user makes progress
  useEffect(() => {
    if (currentStep > 0 || state.itinerary.current) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          state,
          currentStep,
          savedAt: Date.now()
        }));
        setHasSavedDraft(true);
      } catch (_) {
        // Ignore quota/private mode errors
      }
    }
  }, [state, currentStep]);

  const resumeDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.state) {
          setState(parsed.state);
          setCurrentStep(parsed.currentStep || (parsed.state.itinerary?.current ? 12 : 1));
          setHasSavedDraft(false);
        }
      }
    } catch (_) {}
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasSavedDraft(false);
      setSavedDraftInfo(null);
    } catch (_) {}
  };

  const markItineraryStaleIfGenerated = (prevState) => {
    return Boolean(prevState.itinerary?.current);
  };

  useEffect(() => {
    const destinationQuery = searchParams.get("destination");
    if (destinationQuery) {
      const match = allDests.find(
        (d) => d.slug === destinationQuery || d.district === destinationQuery
      );
      if (match) {
        setState((prev) => {
          const updatedSelected = prev.destinations.selected.includes(match.slug)
            ? prev.destinations.selected
            : [...prev.destinations.selected, match.slug];
          
          const analysis = validateDestinationCombination({
            selectedSlugs: updatedSelected,
            duration: prev.duration
          });

          return {
            ...prev,
            destinations: {
              ...prev.destinations,
              mode: "manual",
              selected: updatedSelected,
              routeAnalysis: analysis
            },
            itinerary: {
              ...prev.itinerary,
              isStale: markItineraryStaleIfGenerated(prev)
            }
          };
        });
      }
    }
  }, [searchParams]);

  // Handle incoming prompt parameter from URL
  useEffect(() => {
    const promptQuery = searchParams.get("prompt");
    if (promptQuery && currentStep === 0) {
      setCurrentStep(1);
      localStorage.setItem("st_planner_initial_prompt", promptQuery);
    }
  }, [searchParams, currentStep]);

  // MODULES 3 + 4: DYNAMIC BUDGET ESTIMATE EFFECT
  useEffect(() => {
    if (state.destinations.selected.length > 0 && state.travelers.total > 0) {
      const estimate = estimateTripBudget({
        duration: state.duration,
        travelers: state.travelers,
        destinations: state.destinations.selected,
        travelStyle: state.travelStyle,
        budgetLevel: state.budget.level,
        accommodationTypes: state.accommodation.types,
        transportModes: state.transportation.preferredModes
      });

      const analysis = analyzeBudgetMatch({
        targetMin: state.budget.targetMin,
        targetMax: state.budget.targetMax,
        estimatedRange: estimate.estimatedRange
      });

      setState((prev) => ({
        ...prev,
        budgetIntelligence: {
          ...estimate,
          match: analysis
        }
      }));
    } else {
      setState((prev) => ({
        ...prev,
        budgetIntelligence: null
      }));
    }
  }, [
    state.duration,
    state.travelers.adults,
    state.travelers.children,
    state.travelers.seniors,
    state.travelStyle,
    state.budget.level,
    state.budget.targetMin,
    state.budget.targetMax,
    state.destinations.selected,
    state.accommodation.types,
    state.accommodation.comfort,
    state.transportation.preferredModes,
    state.transportation.comfort
  ]);

  // MODULE 4: TRAVEL PREFERENCE INTELLIGENCE EFFECT
  useEffect(() => {
    const prefs = getTravelPreferenceRecommendations({
      travelers: state.travelers,
      travelStyle: state.travelStyle,
      budget: state.budget,
      destinations: state.destinations.selected,
      accommodation: state.accommodation,
      transportation: state.transportation
    });

    setState((prev) => ({
      ...prev,
      travelPreferences: {
        ...prev.travelPreferences,
        notes: prefs.notes,
        accommodationSuggestions: prefs.accommodationSuggestions,
        transportSuggestions: prefs.transportSuggestions
      }
    }));
  }, [
    state.travelers.type,
    state.travelers.adults,
    state.travelers.children,
    state.travelers.seniors,
    state.travelStyle,
    state.budget.level,
    state.destinations.selected,
    state.accommodation.types,
    state.accommodation.comfort,
    state.transportation.preferredModes,
    state.transportation.comfort,
    state.transportation.longDriveTolerance
  ]);

  const startPlanning = () => {
    setCurrentStep(1);
  };

  const setDates = (dates) => {
    setState((prev) => ({
      ...prev,
      dates: { ...prev.dates, ...dates },
      itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
    }));
  };

  const setDuration = (duration) => {
    setState((prev) => {
      const analysis = validateDestinationCombination({
        selectedSlugs: prev.destinations.selected,
        duration
      });
      return {
        ...prev,
        duration,
        destinations: {
          ...prev.destinations,
          routeAnalysis: analysis
        },
        itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
      };
    });
  };

  const toggleInterest = (interestId) => {
    setState((prev) => {
      const interests = prev.interests.includes(interestId)
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId];
      return { ...prev, interests };
    });
  };

  const setDestinationMode = (mode) => {
    setState((prev) => {
      let recommendations = prev.destinations.recommendations;
      let selected = prev.destinations.selected;
      let analysis = prev.destinations.routeAnalysis;

      if (mode === "ai") {
        const recommendedDests = getRecommendedDestinations({
          duration: prev.duration,
          interests: prev.interests,
          travelIntelligence: prev.travelIntelligence
        });
        recommendations = recommendedDests;
        selected = recommendedDests.map((d) => d.slug);
        
        analysis = validateDestinationCombination({
          selectedSlugs: selected,
          duration: prev.duration
        });
      } else if (mode === "manual" && prev.destinations.mode === "ai") {
        selected = prev.destinations.recommendations.map((d) => d.slug);
        analysis = validateDestinationCombination({
          selectedSlugs: selected,
          duration: prev.duration
        });
      }

      return {
        ...prev,
        destinations: {
          ...prev.destinations,
          mode,
          selected,
          recommendations,
          routeAnalysis: analysis
        },
        itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
      };
    });
  };

  const toggleDestination = (slug) => {
    setState((prev) => {
      const isSelected = prev.destinations.selected.includes(slug);
      const selected = isSelected
        ? prev.destinations.selected.filter((s) => s !== slug)
        : [...prev.destinations.selected, slug];

      const analysis = validateDestinationCombination({
        selectedSlugs: selected,
        duration: prev.duration
      });

      return {
        ...prev,
        destinations: {
          ...prev.destinations,
          selected,
          routeAnalysis: analysis
        },
        itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
      };
    });
  };

  const optimizeRoute = () => {
    setState((prev) => {
      const { optimizedSlugs } = optimizeDestinationRoute({
        selectedSlugs: prev.destinations.selected,
        duration: prev.duration,
        interests: prev.interests,
        travelIntelligence: prev.travelIntelligence
      });

      const analysis = validateDestinationCombination({
        selectedSlugs: optimizedSlugs,
        duration: prev.duration
      });

      return {
        ...prev,
        destinations: {
          ...prev.destinations,
          selected: optimizedSlugs,
          routeAnalysis: analysis
        },
        itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
      };
    });
  };

  const resetDestinations = () => {
    setState((prev) => ({
      ...prev,
      destinations: {
        mode: null,
        selected: [],
        recommendations: [],
        routeAnalysis: {
          isValid: true,
          score: 100,
          warnings: []
        }
      }
    }));
  };

  const setTravelers = (travelerData) => {
    setState((prev) => {
      const updatedTravelers = { ...prev.travelers, ...travelerData };
      updatedTravelers.total =
        (parseInt(updatedTravelers.adults, 10) || 0) +
        (parseInt(updatedTravelers.children, 10) || 0) +
        (parseInt(updatedTravelers.seniors, 10) || 0);
      
      return {
        ...prev,
        travelers: updatedTravelers
      };
    });
  };

  const setTravelStyle = (style) => {
    setState((prev) => ({
      ...prev,
      travelStyle: style,
      itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
    }));
  };

  const setBudget = (budgetData) => {
    setState((prev) => ({
      ...prev,
      budget: { ...prev.budget, ...budgetData },
      itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
    }));
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const runIntelligenceCalculation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = getBestTravelWindow({
        dates: state.dates,
        duration: state.duration,
        destinations: state.destinations.selected,
        interests: state.interests
      });

      setState((prev) => ({
        ...prev,
        travelIntelligence: result
      }));
      setIsCalculating(false);
      setCurrentStep(4);
    }, 1200);
  };

  // Explicit ordered step sequence — matches WIZARD_STEPS rendering array in TripPlanner.jsx
  // Steps 8 and steps beyond 11 (except 12) are not wizard steps, so we must never land on them.
  const WIZARD_STEP_ORDER = [1, 2, 3, 5, 6, 7, 9, 10, 11];

  // Build forward/backward lookup tables from the ordered sequence
  const NEXT_STEP = {}; // current step → next wizard step
  const PREV_STEP = {}; // current step → previous wizard step
  for (let i = 0; i < WIZARD_STEP_ORDER.length - 1; i++) {
    NEXT_STEP[WIZARD_STEP_ORDER[i]] = WIZARD_STEP_ORDER[i + 1];
    PREV_STEP[WIZARD_STEP_ORDER[i + 1]] = WIZARD_STEP_ORDER[i];
  }
  // Special cases: step 4 (Insights) comes between 3 and 5
  // nextStep from 3 is handled by runIntelligenceCalculation → setCurrentStep(4)
  // nextStep from 4 is handled by BestTimeInsight's onNext prop → nextStep()
  // So step 4 needs its own forward entry:
  NEXT_STEP[4] = 5;
  PREV_STEP[5] = 4;
  // Itinerary result (step 12) goes back to Summary (step 11)
  PREV_STEP[12] = 11;

  const nextStep = () => {
    if (currentStep === 3) {
      // Step 3 → run intelligence calculation → lands on step 4 (set inside runIntelligenceCalculation)
      runIntelligenceCalculation();
    } else {
      const next = NEXT_STEP[currentStep];
      if (next !== undefined) {
        setCurrentStep(next);
      }
      // If no next mapping exists (e.g. step 11 Summary), do nothing — Summary manages its own CTA
    }
  };

  const prevStep = () => {
    const prev = PREV_STEP[currentStep];
    if (prev !== undefined) {
      setCurrentStep(prev);
    } else if (currentStep > 0) {
      // Fallback safety: go to 0 if somehow outside the map
      setCurrentStep(0);
    }
  };

  const resetPlanner = () => {
    const destinationQuery = searchParams.get("destination");
    let initialSelected = [];
    let initialMode = null;
    
    if (destinationQuery) {
      const match = allDests.find((d) => d.slug === destinationQuery);
      if (match) {
        initialSelected = [match.slug];
        initialMode = "manual";
      }
    }

    setState({
      ...DEFAULT_STATE,
      destinations: {
        ...DEFAULT_STATE.destinations,
        mode: initialMode,
        selected: initialSelected
      }
    });
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasSavedDraft(false);
      setSavedDraftInfo(null);
    } catch (_) {}
    setCurrentStep(0);
  };

  // MODULE 7: REAL-TIME INTELLIGENCE FETCH
  const fetchRealtimeIntelligenceAction = async (targetItinerary = null) => {
    const it = targetItinerary || state.itinerary.current;
    if (!it) return;

    setState((prev) => ({
      ...prev,
      realtimeIntelligence: { ...prev.realtimeIntelligence, isRefreshing: true }
    }));

    const res = await checkTripRealtimeIntelligence(it, state);

    setState((prev) => ({
      ...prev,
      realtimeIntelligence: {
        status: res.status,
        isCurrent: res.isCurrent,
        data: res.data,
        impact: res.impact,
        lastChecked: res.lastChecked,
        isRefreshing: false
      }
    }));
  };

  // MODULE 5: GENERATE INITIAL ITINERARY + AUTOMATIC PRE-TRIP CHECK
  const generateTripItinerary = async (regenerationPreference = null) => {
    setState((prev) => ({
      ...prev,
      itinerary: { ...prev.itinerary, status: "generating" }
    }));
    setIsCalculating(true);

    try {
      const result = await generateItinerary(state, regenerationPreference);
      setState((prev) => {
        const historyStack = prev.itinerary.current ? [prev.itinerary.current, ...(prev.itinerary.history || [])].slice(0, 5) : [];
        return {
          ...prev,
          itinerary: {
            status: result.source === "ai" ? "success" : "fallback",
            previous: prev.itinerary.current,
            current: result.itinerary,
            history: historyStack,
            isStale: false,
            generatedAt: new Date().toISOString(),
            source: result.source,
            explanation: null,
            tradeoffNotice: null,
            error: null,
            regenerationPreference
          }
        };
      });
      setIsCalculating(false);
      setCurrentStep(12);

      fetchRealtimeIntelligenceAction(result.itinerary);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        itinerary: {
          ...prev.itinerary,
          status: "error",
          error: err.message
        }
      }));
      setIsCalculating(false);
    }
  };

  // MODULE 6 & MODULE C: REFINE ITINERARY & MUTATE PLANNER ACTION
  const refineItineraryAction = async (requestInput) => {
    const changes = typeof requestInput === "object" ? requestInput?.changes || {} : {};

    // 1. Synchronize underlying planner preferences if provided in mutation changes
    setState((prev) => {
      let updated = { ...prev };

      if (changes.duration) {
        updated.duration = Number(changes.duration);
      }
      if (changes.budgetLevel || changes.budgetCap) {
        updated.budget = {
          ...updated.budget,
          level: changes.budgetLevel || updated.budget.level,
          targetMax: changes.budgetCap || updated.budget.targetMax
        };
      }
      if (changes.transportMode) {
        updated.transportation = {
          ...updated.transportation,
          preferredModes: [changes.transportMode]
        };
      }
      if (changes.accommodationType) {
        updated.accommodation = {
          ...updated.accommodation,
          types: [changes.accommodationType]
        };
      }
      if (changes.addDestination) {
        const destSlug = String(changes.addDestination).toLowerCase();
        if (!updated.destinations.selected.includes(destSlug)) {
          updated.destinations = {
            ...updated.destinations,
            selected: [...updated.destinations.selected, destSlug]
          };
        }
      }
      if (changes.removeDestination) {
        const destSlug = String(changes.removeDestination).toLowerCase();
        updated.destinations = {
          ...updated.destinations,
          selected: updated.destinations.selected.filter((s) => s !== destSlug)
        };
      }
      if (changes.replaceDestination) {
        const oldSlug = String(changes.replaceDestination.oldDestination || "").toLowerCase();
        const newSlug = String(changes.replaceDestination.newDestination || "").toLowerCase();
        if (oldSlug && newSlug) {
          updated.destinations = {
            ...updated.destinations,
            selected: updated.destinations.selected.map((s) => (s === oldSlug ? newSlug : s))
          };
          if (!updated.destinations.selected.includes(newSlug)) {
            updated.destinations.selected.push(newSlug);
          }
        }
      }

      return updated;
    });

    // 2. If an itinerary has already been generated, refine it
    if (state.itinerary.current) {
      setState((prev) => ({
        ...prev,
        itinerary: { ...prev.itinerary, status: "generating" }
      }));
      setIsCalculating(true);

      try {
        const result = await refineTripItinerary(state, state.itinerary.current, requestInput);
        setState((prev) => {
          const historyStack = [prev.itinerary.current, ...(prev.itinerary.history || [])].slice(0, 5);
          return {
            ...prev,
            itinerary: {
              ...prev.itinerary,
              status: result.source === "ai" ? "success" : "fallback",
              previous: prev.itinerary.current,
              current: result.updatedItinerary,
              history: historyStack,
              isStale: false,
              source: result.source,
              explanation: result.explanation,
              tradeoffNotice: result.tradeoffNotice,
              error: null
            }
          };
        });
        setIsCalculating(false);

        fetchRealtimeIntelligenceAction(result.updatedItinerary);
        return { success: true, updatedItinerary: result.updatedItinerary };
      } catch (err) {
        setState((prev) => ({
          ...prev,
          itinerary: {
            ...prev.itinerary,
            status: "error",
            error: err.message
          }
        }));
        setIsCalculating(false);
        return { success: false, error: err.message };
      }
    }

    return { success: true, updatedItinerary: null };
  };

  // MODULE 6: UNDO ITINERARY CHANGE
  const undoItineraryAction = () => {
    setState((prev) => {
      if (!prev.itinerary.history || prev.itinerary.history.length === 0) return prev;

      const previousItinerary = prev.itinerary.history[0];
      const remainingHistory = prev.itinerary.history.slice(1);

      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
          current: previousItinerary,
          previous: null,
          history: remainingHistory,
          explanation: "Undid last itinerary change.",
          tradeoffNotice: null
        }
      };
    });
  };

  // MODULE 6: GRANULAR DAY EDITING ACTION
  const updateDayAction = (dayNumber, dayChanges) => {
    setState((prev) => {
      if (!prev.itinerary.current) return prev;

      const updated = applyItineraryPatch(prev.itinerary.current, {
        operation: "update_day_pace",
        targetDay: dayNumber,
        changes: dayChanges
      });

      const historyStack = [prev.itinerary.current, ...(prev.itinerary.history || [])].slice(0, 5);

      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
          current: updated,
          history: historyStack,
          explanation: `Day ${dayNumber} preferences updated.`
        }
      };
    });
  };

  // MODULE 8: PROCESS COPILOT MESSAGE
  const sendCopilotMessageAction = async (userMsgText) => {
    setState((prev) => ({
      ...prev,
      copilot: { ...prev.copilot, status: "processing" }
    }));

    try {
      const res = await processCopilotMessage(userMsgText, state);
      setState((prev) => ({
        ...prev,
        copilot: {
          status: "idle",
          lastMessage: res.message,
          error: null
        }
      }));
      return res;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        copilot: {
          status: "error",
          error: err.message
        }
      }));
    }
  };

  const setAccommodation = (data) => {
    setState((prev) => ({
      ...prev,
      accommodation: { ...prev.accommodation, ...data },
      itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
    }));
  };

  const setTransportation = (data) => {
    setState((prev) => ({
      ...prev,
      transportation: { ...prev.transportation, ...data },
      itinerary: { ...prev.itinerary, isStale: markItineraryStaleIfGenerated(prev) }
    }));
  };

  const setTravelPreferences = (data) => {
    setState((prev) => ({
      ...prev,
      travelPreferences: { ...prev.travelPreferences, ...data }
    }));
  };

  const isDateStepValid = () => {
    const { mode, start, end } = state.dates;
    if (mode === "flexible") return true;
    if (!start || !end) return false;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
    if (startDate < today) return false;
    if (endDate < startDate) return false;

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 90) return false;

    return true;
  };

  const canContinue = () => {
    if (currentStep === 1) return isDateStepValid();
    if (currentStep === 2) return state.duration > 0;
    if (currentStep === 3) return state.interests.length >= 1;
    if (currentStep === 5) return state.destinations.mode && state.destinations.selected.length >= 1;
    if (currentStep === 6) return state.travelers.type !== "" && state.travelers.total > 0;
    if (currentStep === 7) return state.budget.mode !== null;
    return true;
  };

  return {
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
    setTravelPreferences,
    generateTripItinerary,
    refineItineraryAction,
    undoItineraryAction,
    updateDayAction,
    fetchRealtimeIntelligenceAction,
    sendCopilotMessageAction,
    goToStep,
    nextStep,
    prevStep,
    resetPlanner,
    canContinue,
    hasSavedDraft,
    savedDraftInfo,
    resumeDraft,
    discardDraft
  };
}
