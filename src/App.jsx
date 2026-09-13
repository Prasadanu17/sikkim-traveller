import { useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import ScrollPeak from "./components/ScrollPeak";
import ScrollBehavior from "./components/ScrollBehavior";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import DistrictPage from "./pages/DistrictPage";
import RoomPage from "./pages/RoomPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";

// Route-level code splitting
const TripPlanner = lazy(() => import("./pages/TripPlanner"));
const OperationsPage = lazy(() => import("./pages/OperationsPage"));
const CustomerPortalPage = lazy(() => import("./pages/CustomerPortalPage"));
const TripPlannerDashboardPage = lazy(() => import("./pages/TripPlannerDashboardPage"));

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-400 space-y-4 bg-slate-950">
      <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-widest font-semibold text-neutral-500 font-mono">
        Loading Sikkim Journey...
      </p>
    </div>
  );
}

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [presetSubject, setPresetSubject] = useState("");
  const location = useLocation();

  const openBooking = (subject = "") => {
    setPresetSubject(subject);
    setModalOpen(true);
  };

  const isOperations = location.pathname.startsWith("/operations");

  if (isOperations) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <ScrollBehavior />
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/operations/*" element={<OperationsPage />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollBehavior />
      <ScrollPeak />
      <Navbar onBookNow={() => openBooking("")} />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1"
        >
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location}>
              <Route path="/" element={<Home onOpenBooking={openBooking} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/travel/:slug" element={<DistrictPage onOpenBooking={openBooking} />} />
              <Route path="/stay/:slug" element={<RoomPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/plan-your-trip" element={<TripPlanner onOpenBooking={openBooking} />} />
              <Route path="/trip-planner/dashboard" element={<TripPlannerDashboardPage onOpenBooking={openBooking} />} />
              <Route path="/track-booking" element={<CustomerPortalPage />} />
              <Route path="/track-booking/:trackingToken" element={<CustomerPortalPage />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      <Footer />
      <BookingModal open={modalOpen} onClose={() => setModalOpen(false)} presetSubject={presetSubject} />
    </div>
  );
}

