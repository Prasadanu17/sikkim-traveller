/**
 * Copilot Safety & Sanitization Guard.
 * Defends against prompt injection attempts, sanitizes user inputs, and ensures non-hallucination rules.
 */

const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /system prompt/i,
  /secret api key/i,
  /override safety/i,
  /print env/i,
  /vite_/i
];

export function sanitizeUserInput(input) {
  if (typeof input !== "string") return "";

  const trimmed = input.trim().slice(0, 500); // 500 chars limit
  const isInjection = INJECTION_PATTERNS.some((pattern) => pattern.test(trimmed));

  if (isInjection) {
    return {
      sanitizedText: "Explain my trip preferences.",
      wasSanitized: true,
      reason: "Prompt injection pattern detected and neutralized."
    };
  }

  return {
    sanitizedText: trimmed,
    wasSanitized: false
  };
}

export function validateCopilotResponse(response) {
  if (!response || typeof response !== "object") {
    return { isValid: false, message: "Invalid Copilot response structure." };
  }

  // Ensure response does not contain fabricated secret keys or fake approvals
  const text = (response.text || response.message || "").toLowerCase();
  if (text.includes("permit is approved") || text.includes("hotel room is booked") || text.includes("vite_")) {
    return {
      isValid: false,
      message: "Response violated non-hallucination or safety rules."
    };
  }

  return { isValid: true };
}
