/**
 * Master Trip Planner Dashboard Component — "MY SIKKIM JOURNEY"
 * Orchestration presentation layer connecting Modules 7, 8, 9, 10, 12, 13, 14, and 16.
 * 
 * Module 16 Passwordless Journey Access:
 * - Scopes view to the single authorized customer journey based on token.
 * - Handles URL ?token= parameter & sessionStorage validation.
 * - Provides CustomerJourneyAccessCard when unauthenticated.
 * - Enforces single-journey data isolation.
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAuthenticatedCustomerJourney, getCustomerTrips, isTripCurrentlyActive } from "../../services/planner/plannerDashboardService";
import {
  getActiveJourneySession,
  saveActiveJourneySession,
  generateCustomerJourneyToken
} from "../../services/customer/customerSecurityService";
import { revokeCustomerSession } from "../../services/customer/customerAPIGateway";

import DashboardHero from "./DashboardHero";
import MyTripsCards from "./MyTripsCards";
import TripJourneyProgress from "./TripJourneyProgress";
import ItineraryWorkspace from "./ItineraryWorkspace";
import TripReadinessScore from "./TripReadinessScore";
import ThingsToDoChecklist from "./ThingsToDoChecklist";
import ActiveTripView from "./ActiveTripView";
import CustomerJourneyAccessCard from "./CustomerJourneyAccessCard";
import JourneyShareModal from "./JourneyShareModal";
import NotificationBell from "../notifications/NotificationBell";

import { Calendar, MapPin, User, Loader2, Sparkles, AlertTriangle, ShieldCheck, Share2, LogOut, Copy } from "lucide-react";

// Code splitting (React.lazy + Suspense) for heavy sub-components
const CustomerRealtimePanel = lazy(() => import("../customer/CustomerRealtimePanel"));
const CustomerPermitCenter = lazy(() => import("../customer/CustomerPermitCenter"));
const CustomerChangeRequestHub = lazy(() => import("../customer/CustomerChangeRequestHub"));
const CustomerPortalAI = lazy(() => import("../customer/CustomerPortalAI"));
const CustomerPayments = lazy(() => import("../customer/CustomerPayments"));
const NotificationCenter = lazy(() => import("../notifications/NotificationCenter"));
const CustomerDocuments = lazy(() => import("../customer/CustomerDocuments"));

function TabLoader() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      <p className="text-xs font-medium">Loading workspace module...</p>
    </div>
  );
}

export default function TripPlannerDashboard({ onOpenBooking }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authenticatedJourney, setAuthenticatedJourney] = useState(null);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("workspace");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const handlePlanTripPrompt = (prompt) => {
    if (!prompt.trim()) return;
    navigate(`/plan-your-trip?prompt=${encodeURIComponent(prompt)}`);
  };

  // Validate token from URL parameter or sessionStorage on mount
  useEffect(() => {
    const urlToken = searchParams.get("token");
    const activeSession = getActiveJourneySession();

    const targetToken = urlToken || activeSession?.token;

    if (targetToken) {
      const result = getAuthenticatedCustomerJourney(targetToken);
      if (result.success && result.trip) {
        setAuthenticatedJourney(result.trip);
        saveActiveJourneySession(targetToken, result.trip.requestId, result.trip.customer?.firstName);
        setAuthError("");
        return;
      } else {
        setAuthError(result.error || "Journey access could not be verified.");
      }
    }

    // Fallback: If no token in URL/session, load mock trips for multi-trip view or access card
    const allTrips = getCustomerTrips();
    setTrips(allTrips);
    if (allTrips.length > 0) {
      setSelectedTripId(allTrips[0].id || allTrips[0].requestId);
    }
  }, [searchParams]);

  // Handler to authenticate via access token input card
  const handleAuthenticateToken = (inputToken) => {
    const result = getAuthenticatedCustomerJourney(inputToken);
    if (result.success && result.trip) {
      setAuthenticatedJourney(result.trip);
      saveActiveJourneySession(inputToken, result.trip.requestId, result.trip.customer?.firstName);
      setSearchParams({ token: inputToken });
      setAuthError("");
      return true;
    }
    setAuthError(result.error || "Journey access could not be verified.");
    return false;
  };

  // Exit session handler — calls server-side revocation via API Gateway
  const handleExitJourney = async () => {
    // Get token before clearing local session
    const sessionToken = authenticatedJourney?.accessToken ||
      getActiveJourneySession()?.token;

    // 1. Server-side revocation (production: marks token as REVOKED in DB)
    await revokeCustomerSession(sessionToken);

    // 2. Clear local session state
    setAuthenticatedJourney(null);
    setSearchParams({});
    setAuthError("");
  };

  const reloadJourney = () => {
    if (authenticatedJourney) {
      const token = authenticatedJourney.accessToken || generateCustomerJourneyToken(authenticatedJourney.requestId);
      const res = getAuthenticatedCustomerJourney(token);
      if (res.success) setAuthenticatedJourney(res.trip);
    } else {
      const data = getCustomerTrips();
      setTrips(data);
    }
  };

  // Determine current active booking record (authenticated single journey or selected trip)
  const currentBooking = authenticatedJourney || trips.find(t => t.id === selectedTripId || t.requestId === selectedTripId) || trips[0];

  // If no token in URL, no active session, and no authenticated journey -> Render Passwordless Access Card
  const urlToken = searchParams.get("token");
  const activeSession = getActiveJourneySession();
  if (!urlToken && !activeSession && !authenticatedJourney && !currentBooking) {
    return <CustomerJourneyAccessCard onAuthenticateToken={handleAuthenticateToken} />;
  }

  const isActiveTrip = isTripCurrentlyActive(currentBooking);
  const customerName = currentBooking?.customer?.firstName || currentBooking?.customer?.fullName || "Traveler";
  const countdown = currentBooking?.countdown;
  const requestId = currentBooking?.requestId || currentBooking?.id || "ST-REQ-20260823-1042";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-8 flex-1">

        {/* ─── Top Command Center Header Bar ─── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-400 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>My Sikkim Journey • Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Namaste, {customerName}!
              </h1>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShareModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Share Link</span>
              </button>

              <NotificationBell
                customerId={currentBooking?.customerId || "CUST-98765"}
                onOpenFullCenter={() => setActiveTab("notifications")}
              />

              <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-medium">{customerName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              {authenticatedJourney && (
                <button
                  onClick={handleExitJourney}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Exit current journey session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Journey</span>
                </button>
              )}

              {onOpenBooking && (
                <button
                  onClick={() => onOpenBooking()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  + New Trip Request
                </button>
              )}
            </div>
          </div>

          {/* Active Trip Header Summary Pill Bar */}
          {currentBooking && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {/* Journey ID */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Journey ID</span>
                <p className="font-bold text-amber-400 font-mono text-xs truncate">{requestId}</p>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copy Link
                </button>
              </div>

              {/* Destination */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> Destination
                </span>
                <p className="font-bold text-white text-xs truncate">
                  {(currentBooking.destinations || ["Gangtok"]).join(", ")}
                </p>
              </div>

              {/* Dates & Countdown */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" /> Travel Dates
                </span>
                <p className="font-bold text-white text-xs truncate">
                  {countdown?.startDate ? `${countdown.startDate}` : "Dates TBD"}
                </p>
                <p className="text-[10px] font-semibold text-amber-400 font-mono truncate">
                  {countdown?.message || "Planning in Progress"}
                </p>
              </div>

              {/* Readiness Score */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Readiness Meter
                </span>
                <p className="font-bold text-emerald-400 text-xs font-mono">
                  {currentBooking.readiness?.score || 0}% Ready
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentBooking.readiness?.label || "In Progress"}
                </p>
              </div>

              {/* Operational Status */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-cyan-400" /> Booking Status
                </span>
                <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase bg-indigo-950 text-indigo-300 border border-indigo-800/40 truncate">
                  {currentBooking.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AI Planning Prompt Hero Banner */}
        <DashboardHero onPlanTripPrompt={handlePlanTripPrompt} />

        {/* Dynamic Active Trip Banner ("Today's Journey") if traveling */}
        {isActiveTrip && <ActiveTripView booking={currentBooking} />}

        {/* My Trips Cards Switcher (only shown if not single-journey isolated) */}
        {!authenticatedJourney && trips.length > 1 && (
          <MyTripsCards
            trips={trips}
            activeTripId={currentBooking?.id || currentBooking?.requestId}
            onSelectTrip={(t) => setSelectedTripId(t.id || t.requestId)}
          />
        )}

        {currentBooking && (
          <div className="space-y-8">
            {/* Operational Journey Progress Timeline */}
            <TripJourneyProgress status={currentBooking.status} />

            {/* Main 2-Column Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 Cols) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Internal Workspace Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
                  {[
                    { key: "workspace", label: "Itinerary Workspace" },
                    { key: "permits", label: "Permit Center" },
                    { key: "change-requests", label: "Change Requests" },
                    { key: "payments", label: "Billing & Payments" },
                    { key: "documents", label: "Document Center" },
                    { key: "realtime", label: "Live Advisory" },
                    { key: "notifications", label: "Notifications" },
                    { key: "ai", label: "AI Concierge" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`text-xs px-4 py-2.5 rounded-xl font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === tab.key
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Lazy-Loaded Tab Views with Suspense fallback */}
                <Suspense fallback={<TabLoader />}>
                  {activeTab === "workspace" && (
                    <ItineraryWorkspace
                      itinerary={currentBooking.itinerary}
                      bookingStatus={currentBooking.status}
                      onRefineAI={() => reloadJourney()}
                    />
                  )}

                  {activeTab === "permits" && (
                    <CustomerPermitCenter booking={currentBooking} />
                  )}

                  {activeTab === "change-requests" && (
                    <CustomerChangeRequestHub booking={currentBooking} onSuccess={reloadJourney} />
                  )}

                  {activeTab === "payments" && (
                    <CustomerPayments booking={currentBooking} onBookingUpdated={reloadJourney} />
                  )}

                  {activeTab === "documents" && (
                    <CustomerDocuments booking={currentBooking} />
                  )}

                  {activeTab === "realtime" && (
                    <CustomerRealtimePanel booking={currentBooking} />
                  )}

                  {activeTab === "notifications" && (
                    <NotificationCenter customerId={currentBooking?.customerId || "CUST-98765"} />
                  )}

                  {activeTab === "ai" && (
                    <CustomerPortalAI
                      booking={currentBooking}
                      onOpenChangeRequests={() => setActiveTab("change-requests")}
                    />
                  )}
                </Suspense>
              </div>

              {/* Right Sidebar Column (1 Col) */}
              <div className="space-y-6">
                <TripReadinessScore
                  readiness={currentBooking.readiness}
                  onJumpToSection={(secKey) => {
                    if (secKey === "permits") setActiveTab("permits");
                    else if (secKey === "payments") setActiveTab("payments");
                    else setActiveTab("workspace");
                  }}
                />
                <ThingsToDoChecklist
                  booking={currentBooking}
                  readiness={currentBooking.readiness}
                  onJumpToSection={(secKey) => {
                    if (secKey === "permits") setActiveTab("permits");
                    else if (secKey === "payments") setActiveTab("payments");
                    else setActiveTab("workspace");
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Share Journey Link Modal */}
        <JourneyShareModal
          booking={currentBooking}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      </div>
    </div>
  );
}
