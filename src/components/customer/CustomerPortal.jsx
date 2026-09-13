import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  FileText,
  MessageSquare,
  Compass,
  Bot,
  Layers,
  CreditCard,
  Bell,
  SlidersHorizontal
} from "lucide-react";

import { verifyTrackingAccess, clearTrackingSession, getActiveTrackingSession } from "../../services/customer/customerAccessService";
import { getDemoTokens } from "../../services/customer/customerPortalFallbackService";

import CustomerAccessForm from "./CustomerAccessForm";
import CustomerTripHeader from "./CustomerTripHeader";
import CustomerStatusTimeline from "./CustomerStatusTimeline";
import CustomerTripOverview from "./CustomerTripOverview";
import CustomerNextSteps from "./CustomerNextSteps";
import CustomerSupportCard from "./CustomerSupportCard";
import CustomerSecurityNotice from "./CustomerSecurityNotice";

// Lazy-loaded components
const CustomerItinerary = lazy(() => import("./CustomerItinerary"));
const CustomerProposal = lazy(() => import("./CustomerProposal"));
const CustomerApprovalModal = lazy(() => import("./CustomerApprovalModal"));
const CustomerChangeRequest = lazy(() => import("./CustomerChangeRequest"));
const CustomerDocuments = lazy(() => import("./CustomerDocuments"));
const CustomerRealtimePanel = lazy(() => import("./CustomerRealtimePanel"));
const CustomerMessages = lazy(() => import("./CustomerMessages"));
const CustomerPortalAI = lazy(() => import("./CustomerPortalAI"));
const CustomerPayments = lazy(() => import("./CustomerPayments"));
const NotificationCenter = lazy(() => import("../notifications/NotificationCenter"));
const NotificationPreferences = lazy(() => import("../notifications/NotificationPreferences"));
const CustomerPermitCenter = lazy(() => import("./CustomerPermitCenter"));
const CustomerChangeRequestHub = lazy(() => import("./CustomerChangeRequestHub"));

function TabLoader() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-medium">Loading portal section...</p>
    </div>
  );
}

const TABS = [
  { key: "overview", label: "Overview", icon: Layers },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "itinerary", label: "Itinerary", icon: MapPin },
  { key: "proposal", label: "Proposal", icon: FileText },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "permits", label: "Permits", icon: Compass },
  { key: "change-requests", label: "Trip Changes", icon: FileText },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "realtime", label: "Travel Alerts", icon: Compass },
  { key: "messages", label: "Message Us", icon: MessageSquare },
  { key: "ai", label: "Travel Assistant", icon: Bot },
  { key: "preferences", label: "Settings", icon: SlidersHorizontal }
];

export default function CustomerPortal() {
  const { trackingToken: urlToken } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState(false);

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";
  const demoTokens = isMockMode ? getDemoTokens() : [];

  const loadBookingData = async (tokenToLoad) => {
    if (!tokenToLoad) return;
    setLoading(true);
    setError("");
    try {
      const data = await verifyTrackingAccess(tokenToLoad);
      setBooking(data);
    } catch (err) {
      setError(err.message || "Failed to retrieve booking information.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlToken) {
      loadBookingData(urlToken);
    } else {
      const existingSession = getActiveTrackingSession();
      if (existingSession?.trackingToken) {
        navigate(`/track-booking/${existingSession.trackingToken}`, { replace: true });
      }
    }
  }, [urlToken]);

  const handleAccess = async (token) => {
    navigate(`/track-booking/${token}`);
  };

  const handleResetToken = () => {
    clearTrackingSession();
    setBooking(null);
    navigate("/track-booking");
  };

  const handleRefresh = () => {
    if (booking?.trackingToken) {
      loadBookingData(booking.trackingToken);
    }
  };

  const handleBookingUpdated = (updatedBooking) => {
    setBooking(updatedBooking);
  };

  // If no booking loaded and not loading, show Access Form
  if (!booking && !loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
        <CustomerAccessForm onAccess={handleAccess} initialToken={urlToken || ""} error={error} />
      </div>
    );
  }

  // Loading Skeleton State
  if (loading && !booking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-400 space-y-4">
        <div className="w-10 h-10 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading your trip details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Dev Mode Banner with Demo Switcher */}
      {isMockMode && (
        <div className="bg-amber-950/70 border-b border-amber-800/60 px-4 py-2.5 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <strong className="font-semibold">DEVELOPMENT MODE</strong>
              <span className="text-amber-300/70 hidden sm:inline">
                • VITE_CUSTOMER_PORTAL_MOCK_MODE=true
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-amber-400/90 font-semibold mr-1">Switch Scenario:</span>
              {demoTokens.map((item) => (
                <button
                  key={item.token}
                  type="button"
                  onClick={() => navigate(`/track-booking/${item.token}`)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    booking?.trackingToken === item.token
                      ? "bg-amber-500 text-slate-950 font-bold shadow"
                      : "bg-slate-900 text-amber-300 border border-amber-800/60 hover:bg-slate-800"
                  }`}
                >
                  {item.badge}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <CustomerTripHeader
        booking={booking}
        onChangeToken={handleResetToken}
        onRefresh={handleRefresh}
        onOpenFullNotifications={() => setActiveTab("notifications")}
        onOpenPreferences={() => setActiveTab("preferences")}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Status Pipeline Timeline */}
        <CustomerStatusTimeline status={booking.status} />

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max pb-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const hasBadge = tab.key === "proposal" && (booking.status === "PROPOSAL_SENT" || booking.status === "AWAITING_CUSTOMER");

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {hasBadge && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1 ring-2 ring-slate-950 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content & 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Column (2 Cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<TabLoader />}>
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <CustomerNextSteps booking={booking} onNavigateTab={setActiveTab} />
                      <CustomerTripOverview
                        booking={booking}
                        onReviewProposal={() => setActiveTab("proposal")}
                        onRequestChanges={() => setChangeRequestModalOpen(true)}
                      />
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <NotificationCenter
                      customerId={booking?.customerId || "CUST-98765"}
                      onNavigateToSection={(n) => {
                        if (n.eventType?.includes("PROPOSAL")) setActiveTab("proposal");
                        else if (n.eventType?.includes("PAYMENT")) setActiveTab("payments");
                        else setActiveTab("overview");
                      }}
                      onOpenPreferences={() => setActiveTab("preferences")}
                    />
                  )}

                  {activeTab === "preferences" && (
                    <NotificationPreferences
                      customerId={booking?.customerId || "CUST-98765"}
                      onClose={() => setActiveTab("notifications")}
                    />
                  )}

                  {activeTab === "itinerary" && (
                    <CustomerItinerary itinerary={booking.itinerary} />
                  )}

                  {activeTab === "proposal" && (
                    <CustomerProposal
                      booking={booking}
                      onOpenApprovalModal={() => setApprovalModalOpen(true)}
                      onOpenChangeRequestModal={() => setChangeRequestModalOpen(true)}
                    />
                  )}

                  {activeTab === "payments" && (
                    <CustomerPayments
                      booking={booking}
                      onBookingUpdated={handleBookingUpdated}
                    />
                  )}

                  {activeTab === "permits" && (
                    <CustomerPermitCenter booking={booking} />
                  )}

                  {activeTab === "change-requests" && (
                    <CustomerChangeRequestHub
                      booking={booking}
                      onSuccess={handleRefresh}
                    />
                  )}

                  {activeTab === "documents" && (
                    <CustomerDocuments booking={booking} />
                  )}

                  {activeTab === "realtime" && (
                    <CustomerRealtimePanel booking={booking} />
                  )}

                  {activeTab === "messages" && (
                    <CustomerMessages booking={booking} onMessageSent={handleBookingUpdated} />
                  )}

                  {activeTab === "ai" && (
                    <CustomerPortalAI booking={booking} />
                  )}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar Column (1 Col on desktop) */}
          <div className="space-y-6">
            <CustomerSupportCard />
            <CustomerSecurityNotice />
          </div>
        </div>
      </main>

      {/* Modals */}
      <Suspense fallback={null}>
        <CustomerApprovalModal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          booking={booking}
          onSuccess={handleBookingUpdated}
        />

        <CustomerChangeRequest
          isOpen={changeRequestModalOpen}
          onClose={() => setChangeRequestModalOpen(false)}
          booking={booking}
          onSuccess={handleBookingUpdated}
        />
      </Suspense>
    </div>
  );
}
