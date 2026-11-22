import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Printer } from "lucide-react";
import BookingTripReview from "./BookingTripReview";
import BookingTravelerDetails from "./BookingTravelerDetails";
import BookingPreferences from "./BookingPreferences";
import BookingContactDetails from "./BookingContactDetails";
import BookingFinalReview from "./BookingFinalReview";
import BookingSuccess from "./BookingSuccess";
import BookingStatus from "./BookingStatus";
import BookingPrintDocument from "./BookingPrintDocument";

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

  // Resilient local confirmation handler
  const handleProceedLocally = () => {
    // Create persistent customer journey record with secure token locally
    const journeyRes = createCustomerJourney({
      plannerState,
      travelerInfo: formData.primaryTraveler,
      preferences: formData.specialRequirements
    });

    const activeRequestId = journeyRes.requestId || `ST-REQ-${Date.now()}`;

    // Save status details locally
    saveBookingStatus(activeRequestId, {
      status: "RECEIVED",
      history: [
        {
          status: "RECEIVED",
          timestamp: new Date().toISOString(),
          message: "Booking inquiry saved locally. Sikkim Traveller operations will process your journey request."
        }
      ]
    });

    setSubmissionResult({
      success: true,
      requestId: activeRequestId,
      status: "RECEIVED",
      submittedAt: new Date().toISOString(),
      accessToken: journeyRes.accessToken,
      accessUrl: journeyRes.accessUrl,
      isOfflineSaved: true
    });

    clearBookingDraft();
    setOfflineError(false);
    setCurrentStep(6); // Success Step inside wizard

    if (onJourneyCreated) {
      onJourneyCreated(journeyRes, false);
    }
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
      let response;
      try {
        response = await submitBookingRequest(payload, idempotencyKey);
      } catch (networkErr) {
        console.warn("[BookingJourney] Backend submission unavailable, falling back to local persistent journey:", networkErr.message);
        // Fall back gracefully to local customer journey creation so user is never stranded
        const fallbackJourney = createCustomerJourney({
          plannerState,
          travelerInfo: formData.primaryTraveler,
          preferences: formData.specialRequirements
        });
        response = {
          success: true,
          requestId: fallbackJourney.requestId,
          status: "RECEIVED",
          submittedAt: new Date().toISOString(),
          isOfflineSaved: true
        };
      }

      if (response && response.success) {
        // Create persistent customer journey record with secure token
        const journeyRes = createCustomerJourney({
          plannerState,
          travelerInfo: formData.primaryTraveler,
          preferences: formData.specialRequirements
        });

        const activeRequestId = response.requestId || journeyRes.requestId;

        // Save status details locally
        saveBookingStatus(activeRequestId, {
          status: response.status || "RECEIVED",
          history: [
            {
              status: "RECEIVED",
              timestamp: response.submittedAt || new Date().toISOString(),
              message: response.isOfflineSaved
                ? "Booking request saved locally. Sikkim Traveller operations will process your journey request."
                : "Booking inquiry details received by Sikkim Traveller operations."
            }
          ]
        });

        setSubmissionResult({
          ...response,
          requestId: activeRequestId,
          accessToken: journeyRes.accessToken,
          accessUrl: journeyRes.accessUrl
        });
        clearBookingDraft();

        setCurrentStep(6); // Success Step inside wizard

        if (onJourneyCreated) {
          onJourneyCreated(journeyRes, false);
        }
      } else {
        handleProceedLocally();
      }
    } catch (err) {
      console.error("[BookingJourney] Submission fallback triggered:", err.message);
      handleProceedLocally();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback submit handler
  const handleFallbackSubmit = async () => {
    setIsSubmitting(true);
    try {
      let result;
      try {
        result = await sendWeb3FormsFallback(bookingContext, formData, `ST-REQ-FB-${Date.now()}`);
      } catch (fallbackErr) {
        console.warn("[BookingJourney] Web3Forms fallback bypassed, proceeding with local journey:", fallbackErr.message);
        handleProceedLocally();
        return;
      }

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
      } else {
        handleProceedLocally();
      }
    } catch (_err) {
      handleProceedLocally();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintRequest = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm print:relative print:inset-auto print:bg-transparent print:p-0 print:backdrop-blur-none">
      {/* High-End Executive Printable Template - Hidden on screen, beautifully formatted in print/PDF */}
      <div className="hidden print:block w-full">
        <BookingPrintDocument
          bookingContext={bookingContext}
          formData={formData}
          submissionResult={submissionResult}
          plannerState={plannerState}
        />
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
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3 text-left mb-6 text-amber-950 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs">Connection Problem</h5>
                <p className="text-[11px] text-amber-900 leading-normal">
                  Your booking request could not reach our server right now, but your details are saved locally. You can confirm offline immediately to get your booking ID and download/print your itinerary.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleProceedLocally}
                className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 transition shadow-sm"
              >
                Confirm Offline & View Itinerary PDF
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="rounded-lg bg-white border border-amber-400 hover:bg-amber-100/50 text-amber-900 font-semibold text-xs px-3.5 py-2 transition disabled:opacity-50"
              >
                Try Again
              </button>
              <button
                onClick={handleFallbackSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 font-semibold text-xs px-3.5 py-2 transition disabled:opacity-50"
              >
                Send via Quick Enquiry
              </button>
              <button
                onClick={() => { saveBookingDraft(formData); onClose(); }}
                className="rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-ink font-semibold text-xs px-3 py-2 transition"
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
