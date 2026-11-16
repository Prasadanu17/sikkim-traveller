/**
 * src/services/voice/speechService.js
 * Browser-supported Speech Recognition (Input) and Speech Synthesis (Output).
 * Supports English ('en-IN'), Hindi ('hi-IN'), and Nepali ('ne-NP').
 * Pure browser Web Speech API implementation without paid external dependencies.
 */

import { LANGUAGE_LABELS } from "../i18n/languageService";

/**
 * Checks if browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Checks if browser supports Speech Synthesis
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
}

/**
 * Creates and starts a SpeechRecognition instance.
 * Returns an object with `.stop()` method.
 */
export function startVoiceRecognition({
  language = "en",
  onResult,
  onError,
  onEnd,
  onStart
}) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError(new Error("SPEECH_NOT_SUPPORTED"));
    return null;
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();

  // Map language to BCP 47 voice locale
  const langConfig = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.en;
  recognition.lang = langConfig.voiceLang;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) {
      onResult({
        transcript,
        isFinal: event.results[event.results.length - 1].isFinal
      });
    }
  };

  recognition.onerror = (event) => {
    let code = "UNKNOWN_VOICE_ERROR";
    if (event.error === "not-allowed" || event.error === "permission-denied") {
      code = "PERMISSION_DENIED";
    } else if (event.error === "no-speech") {
      code = "NO_SPEECH_DETECTED";
    } else if (event.error === "network") {
      code = "NETWORK_ERROR";
    }
    if (onError) onError(new Error(code));
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch (_) {}
      },
      abort: () => {
        try {
          recognition.abort();
        } catch (_) {}
      }
    };
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}

/**
 * Speaks text using SpeechSynthesis with controls.
 */
export function speakText(text, { language = "en", onStart, onEnd, onError } = {}) {
  if (!isSpeechSynthesisSupported() || !text) return null;

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Strip markdown formatting symbols before speaking
    const cleanSpeechText = text
      .replace(/[#*_~`]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/₹(\d+)/g, "$1 rupees")
      .trim();

    const utterance = new window.SpeechSynthesisUtterance(cleanSpeechText);
    const langConfig = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.en;
    utterance.lang = langConfig.voiceLang;

    // Pick best matching system voice
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    if (voices.length > 0) {
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(language.toLowerCase())) ||
                    voices.find((v) => v.lang.toLowerCase().includes("in"));
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);

    return {
      pause: () => window.speechSynthesis.pause(),
      resume: () => window.speechSynthesis.resume(),
      stop: () => window.speechSynthesis.cancel()
    };
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}

/**
 * Stops all active speech synthesis playback.
 */
export function stopAllSpeech() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}
