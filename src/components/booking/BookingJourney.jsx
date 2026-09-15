import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Printer } from "lucide-react";
import BookingTripReview from "./BookingTripReview";
import BookingTravelerDetails from "./BookingTravelerDetails";
import BookingPreferences from "./BookingPreferences";
import BookingContactDetails from "./BookingContactDetails";
import BookingFinalReview from "./BookingFinalReview";
import BookingSuccess from "./BookingSuccess";
import BookingStatus from "./BookingStatus";

import { buildBookingContext } from "../../services/booking/bookingContextService";
import { getPlannerSnapshotHash } from "../../services/booking/bookingReadinessService";
import { validateBookingForm, sanitizeBookingForm } from "../../services/booking/bookingValidationService";
import { submitBookingRequest } from "../../services/booking/bookingRequestService";
import { saveBookingDraft, loadBookingDraft, clearBookingDraft } from "../../services/booking/bookingDraftService";
import { saveBookingStatus, getBookingStatus, simulateOperationsStatusUpdate } from "../../services/booking/bookingStatusService";
import { sendWeb3FormsFallback } from "../../services/booking/bookingFallbackService";
import { createCustomerJourney } from "../../services/customer/customerJourneyCreationService";

export default function BookingJourney({ plannerState, onClose, onToggleCopilot, onJourneyCreated }) {
  const [bookingContext, setBookingContext] = useState(() => buildBookingContext(plannerState));
  const [initialHash, setInitialHash] = useState(() => getPlannerSnapshotHash(plannerState));
  const [isStale, setIsStale] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Steps 1 to 5, Step 6 (Success), Step 7 (Tracker)
  
  // Form State
  const [formData, setFormData] = useState({
    primaryTraveler: {
      fullName: "",
      email: "",
      phone: "",
      location: ""
    },
    additionalTravelers: [],
    specialRequirements: {
      vegetarianFood: false,
      nonVegetarianFood: false,
      childFriendly: false,
      seniorFriendly: false,
      roomPreference: false,
      groundFloor: false,
      reducedWalking: false,
      moreRestPeriods: false,
      extraLuggage: false,
      photographyPace: false,
      flexibleDates: false,
      specialOccasion: false,
      otherDetails: ""
    },
    contactPreference: {
      method: "", // WhatsApp | Phone | Email
      timeOfDay: "" // Morning | Afternoon | Evening | Anytime
    }
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [idempotencyKey] = useState(() => `idemp-${Math.random().toString(36).slice(2, 15)}-${Date.now()}`);
  const [offlineError, setOfflineError] = useState(false);

  // Sync draft and monitor state freshness on mount/update
  useEffect(() => {
    // Load local draft if exists
    const draft = loadBookingDraft();
    if (draft) {
      setFormData(draft);
    }
  }, []);

  // Monitor stale state
  useEffect(() => {
    const currentHash = getPlannerSnapshotHash(plannerState);
    if (currentHash !== initialHash) {
      setIsStale(true);
    } else {
      setIsStale(false);
    }
  }, [plannerState, initialHash]);

  const updateFormData = (section, data) => {
    const updated = {
      ...formData,
      [section]: data
    };
    setFormData(updated);
    saveBookingDraft(updated);
  };

  const handleNextStep = () => {
    // Step 2 validation (Traveler Details)
    if (currentStep === 2) {
      const { isValid, errors } = validateBookingForm(formData, 2);
      if (!isValid) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors({});
    }

    // Step 4 validation (Contact Preference)
    if (currentStep === 4) {
      const { isValid, errors } = validateBookingForm(formData, 4);
      if (!isValid) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors({});
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleRefreshBookingReview = () => {
    setBookingContext(buildBookingContext(plannerState));
    setInitialHash(getPlannerSnapshotHash(plannerState));
    setIsStale(false);
  };

  // Submission handler
  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    setOfflineError(false);

    // Sanitize values
    const sanitizedForm = sanitizeBookingForm(formData);
    const payload = {
      trip: bookingContext.trip,
      traveler: bookingContext.traveler,
      destinations: bookingContext.destinations,
      itinerary: bookingContext.itinerary,
      budget: bookingContext.budget,
      accommodation: bookingContext.accommodation,
      transportation: bookingContext.transportation,
      preferences: bookingContext.preferences,
      realtimeSnapshot: bookingContext.realtimeSnapshot,
      itineraryVersion: bookingContext.itineraryVersion,
      contact: sanitizedForm.primaryTraveler,
      additionalTravelers: sanitizedForm.additionalTravelers,
      specialRequests: sanitizedForm.specialRequirements,
      contactPreference: sanitizedForm.contactPreference,
      idempotencyKey
    };

    try {
      const response = await submitBookingRequest(payload, idempotencyKey);
      
      if (response && response.success) {
        // Create persistent customer journey record with secure token
        const journeyRes = createCustomerJourney({
          plannerState,
          travelerInfo: formData.primaryTraveler,
          preferences: formData.specialRequirements
        });

        // Save status details locally
        saveBookingStatus(response.requestId, {
          status: response.status,
          history: [
            { status: "RECEIVED", timestamp: response.submittedAt, message: "Booking inquiry details received by Sikkim Traveller operations." }
          ]
        });

        setSubmissionResult({
          ...response,
          accessToken: journeyRes.accessToken,
          accessUrl: journeyRes.accessUrl
        });
        clearBookingDraft();

        setCurrentStep(6); // Success Step inside wizard

        if (onJourneyCreated) {
          onJourneyCreated(journeyRes, false);
        }
      } else {
        throw new Error("Invalid response received from submit.");
      }
    } catch (err) {
      console.error("[BookingJourney] Submission failed:", err.message);
      setOfflineError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback submit handler
  const handleFallbackSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await sendWeb3FormsFallback(bookingContext, formData, `ST-REQ-FB-${Date.now()}`);
      if (result && result.success) {
        saveBookingStatus(result.requestId, {
          status: result.status,
          history: [
            { status: "RECEIVED", timestamp: result.submittedAt, message: "Booking request transmitted via fallback contact route." }
          ]
        });
        setSubmissionResult(result);
        clearBookingDraft();
        setOfflineError(false);
        setCurrentStep(6);
      }
    } catch (_err) {
      alert("We are unable to transmit your booking details even through fallback. Please check your network or try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintRequest = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm print:relative print:inset-auto print:bg-transparent print:p-0 print:backdrop-blur-none">
      {/* Printable template - hidden in screen */}
      <div className="hidden print:block text-left text-ink p-8 space-y-6 text-xs max-w-4xl mx-auto">
        <div className="border-b-2 border-pine pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-pine">SIKKIM TRAVELLER</h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-gold-dark mt-1">BOOKING REQUEST — NOT A CONFIRMED RESERVATION</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold border-b border-neutral-350 pb-1">Traveler Details</h3>
            <p className="mt-2 font-medium">Primary Name: <span className="font-normal">{formData.primaryTraveler?.fullName}</span></p>
            <p>Email: {formData.primaryTraveler?.email}</p>
            <p>Phone: {formData.primaryTraveler?.phone}</p>
            <p>Location: {formData.primaryTraveler?.location || "N/A"}</p>
          </div>
          <div>
            <h3 className="font-bold border-b border-neutral-350 pb-1">Trip Settings</h3>
            <p className="mt-2">Duration: {bookingContext.trip.duration} Days</p>
            <p>Travelers: {bookingContext.traveler.total} ({bookingContext.traveler.type})</p>
            <p>Itinerary Version: {bookingContext.itineraryVersion}</p>
            <p>Request Status: {submissionResult?.requestId ? "SUBMITTED / RECEIVED" : "DRAFT REQUEST"}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold border-b border-neutral-350 pb-1">Route & Locations</h3>
          <p className="mt-2 font-medium leading-relaxed">{bookingContext.destinations.join(" → ")}</p>
        </div>

        <div>
          <h3 className="font-bold border-b border-neutral-350 pb-1">Stay & Transport Preferences</h3>
          <p className="mt-2">Stay Comfort: {bookingContext.accommodation.comfort} ({bookingContext.accommodation.types.join("/")})</p>
          <p>Transport Style: {bookingContext.transportation.preferredModes.join("/")}</p>
        </div>

        <div>
          <h3 className="font-bold border-b border-neutral-350 pb-1">Budget Inclusions</h3>
          <p className="mt-2 font-semibold">
            Estimated Range: ₹{(bookingContext.budget.estimatedRange?.min || 0).toLocaleString()} – ₹{(bookingContext.budget.estimatedRange?.max || 0).toLocaleString()} (INR)
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 italic">
            * Final pricing will be confirmed by the Sikkim Traveller team based on availability, dates, accommodation, transportation, permits, and applicable travel conditions.
          </p>
        </div>

        <div className="border-t-2 border-neutral-300 pt-4 text-center text-[10px] text-neutral-400">
          This document represents an AI-generated trip itinerary submitted as a reservation inquiry. It does not certify hotel bookings, permit approvals, or payment completions.
        </div>
      </div>

      {/* Screen Wizard view */}
      <div className="relative bg-parchment rounded-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-gold/20 print:hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-ink/50 hover:text-ink transition"
          aria-label="Close Booking Wizard"
        >
          <X size={20} />
        </button>

        {/* Stale Trip Parameters Warning Overlay */}
        {isStale && currentStep < 6 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 mb-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={20} className="text-amber-600 shrink-0" />
              <div className="text-left">
                <h5 className="font-bold text-xs">Trip Settings Changed</h5>
                <p className="text-[10px] text-amber-800">Your planner details have changed since this booking review was generated.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleRefreshBookingReview}
                className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3.5 py-2 transition"
              >
                Refresh Review
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-ink text-[10px] font-bold px-3 py-2 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Offline API submission failure screen */}
        {offlineError && currentStep === 5 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3 text-left mb-6 text-rose-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs">Connection Problem</h5>
                <p className="text-[11px] text-rose-800 leading-normal">
                  Your booking request could not be sent to our server right now. Your draft inputs have been saved locally.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] px-4 py-2 transition disabled:opacity-50"
              >
                Try Again
              </button>
              <button
                onClick={handleFallbackSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-white border border-rose-350 hover:bg-rose-100/50 text-rose-800 font-semibold text-[10px] px-4 py-2 transition disabled:opacity-50"
              >
                Send via Quick Enquiry
              </button>
              <button
                onClick={() => { saveBookingDraft(formData); onClose(); }}
                className="rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-ink font-semibold text-[10px] px-4 py-2 transition"
              >
                Save Draft & Exit
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step Views */}
        {currentStep === 1 && (
          <BookingTripReview
            bookingContext={bookingContext}
            onNext={handleNextStep}
            onClose={onClose}
          />
        )}

        {currentStep === 2 && (
          <BookingTravelerDetails
            bookingContext={bookingContext}
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            validationErrors={validationErrors}
          />
        )}

        {currentStep === 3 && (
          <BookingPreferences
            bookingContext={bookingContext}
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )}

        {currentStep === 4 && (
          <BookingContactDetails
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            validationErrors={validationErrors}
          />
        )}

        {currentStep === 5 && (
          <BookingFinalReview
            bookingContext={bookingContext}
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitRequest}
            onPrev={handlePrevStep}
          />
        )}

        {currentStep === 6 && (
          <BookingSuccess
            bookingContext={bookingContext}
            submissionResult={submissionResult}
            onViewTrip={() => setCurrentStep(7)} // Navigate to Status tracker
            onTalkCopilot={() => { onClose(); onToggleCopilot(); }} // Closes modal and fires Copilot open
            onBackHome={() => window.location.href = "/"}
          />
        )}

        {currentStep === 7 && (
          <div className="space-y-6">
            <BookingStatus
              bookingStatus={getBookingStatus(submissionResult?.requestId)}
              onSimulateUpdate={() => {
                simulateOperationsStatusUpdate(submissionResult?.requestId);
                // force reload by incrementing step or updating context state triggers
                setSubmissionResult({ ...submissionResult });
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100">
              <button
                onClick={handlePrintRequest}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 hover:border-gold hover:text-gold-dark bg-white text-ink text-xs font-semibold px-4 py-2.5 transition"
              >
                <Printer size={13} /> Print Booking Request
              </button>

              <button
                onClick={() => { onClose(); }}
                className="rounded-full bg-pine text-parchment font-semibold text-xs px-8 py-2.5 hover:bg-gold hover:text-pine transition"
              >
                Close Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
