/**
 * Booking Validation and Sanitization Service.
 * Protects client inputs from XSS, SQL/script injection, and validates form constraints.
 */

/**
 * Sanitizes a single string input to strip HTML tags and escape HTML special characters.
 */
export function sanitizeString(val) {
  if (typeof val !== "string") return val;
  return val
    .replace(/<[^>]*>/g, "") // Strip HTML tags completely
    .replace(/[&<>"'/]/g, (match) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;"
      };
      return map[match];
    })
    .trim();
}

/**
 * Deep sanitizes all text fields in the booking request form data.
 */
export function sanitizeBookingForm(form) {
  if (!form) return null;

  const sanitize = (val) => (typeof val === "string" ? sanitizeString(val) : val);

  return {
    ...form,
    primaryTraveler: form.primaryTraveler ? {
      fullName: sanitize(form.primaryTraveler.fullName),
      email: sanitize(form.primaryTraveler.email),
      phone: sanitize(form.primaryTraveler.phone),
      location: sanitize(form.primaryTraveler.location)
    } : null,
    additionalTravelers: form.additionalTravelers?.map(name => sanitize(name)) || [],
    specialRequirements: form.specialRequirements ? {
      ...form.specialRequirements,
      otherDetails: sanitize(form.specialRequirements.otherDetails)
    } : null,
    contactPreference: form.contactPreference ? {
      method: sanitize(form.contactPreference.method),
      timeOfDay: sanitize(form.contactPreference.timeOfDay)
    } : null
  };
}

/**
 * Validates form fields and returns an object containing validation status and error messages.
 */
export function validateBookingForm(form) {
  const errors = {};

  if (!form) {
    return { isValid: false, errors: { form: "Form data is empty." } };
  }

  const name = (form.primaryTraveler?.fullName || "").trim();
  const email = (form.primaryTraveler?.email || "").trim();
  const phone = (form.primaryTraveler?.phone || "").trim();
  const contactMethod = form.contactPreference?.method;

  // Name check
  if (!name) {
    errors.fullName = "Please enter your name.";
  }

  // Email check
  if (!email) {
    errors.email = "Please enter your email address.";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
  }

  // Phone check
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else {
    // Basic phone validation (allowing digits, spaces, plus, dashes, parentheses)
    const phoneClean = phone.replace(/[\s\-()+]/g, "");
    if (!/^\d{7,15}$/.test(phoneClean)) {
      errors.phone = "Please enter a valid phone number.";
    }
  }

  // Contact preference check
  if (!contactMethod) {
    errors.contactMethod = "Please select a contact preference.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
