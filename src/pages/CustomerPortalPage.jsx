import { useEffect } from "react";
import CustomerPortal from "../components/customer/CustomerPortal";

export default function CustomerPortalPage() {
  useEffect(() => {
    document.title = "Track Your Booking & Trip Status | Sikkim Traveller";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <CustomerPortal />
    </div>
  );
}
