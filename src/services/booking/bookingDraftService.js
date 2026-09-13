/**
 * Booking Draft Service.
 * Manages persisting and loading in-progress booking forms so traveler inputs are not lost.
 */

const STORAGE_KEY = "st_booking_draft";

/**
 * Saves the current state of the booking form to local storage.
 */
export function saveBookingDraft(formData) {
  try {
    if (!formData) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData,
      savedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.error("[BookingDraftService] Failed to write draft to storage:", err);
  }
}

/**
 * Loads a saved booking draft from local storage.
 * Discards drafts older than 24 hours to prevent stale inputs.
 */
export function loadBookingDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.formData) return null;

    // Optional expiration check (e.g., 24 hours)
    const savedTime = new Date(parsed.savedAt).getTime();
    const now = Date.now();
    if (now - savedTime > 24 * 60 * 60 * 1000) {
      clearBookingDraft();
      return null;
    }

    return parsed.formData;
  } catch (err) {
    console.warn("[BookingDraftService] Failed to read draft from storage:", err);
    return null;
  }
}

/**
 * Clears the persisted booking draft.
 */
export function clearBookingDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("[BookingDraftService] Failed to clear draft from storage:", err);
  }
}
