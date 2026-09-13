/**
 * Trip Planner Dashboard Page — Route Host Component
 * Route: /trip-planner/dashboard
 * Hosting the central "MY SIKKIM JOURNEY" AI Trip Planner Dashboard.
 */

import { useEffect } from "react";
import TripPlannerDashboard from "../components/plannerDashboard/TripPlannerDashboard";

export default function TripPlannerDashboardPage({ onOpenBooking }) {
  useEffect(() => {
    document.title = "My Sikkim Journey — Central AI Trip Planner Dashboard";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <TripPlannerDashboard onOpenBooking={onOpenBooking} />
    </div>
  );
}
