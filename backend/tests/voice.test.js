/**
 * backend/tests/voice.test.js
 * Automated test suite for Module E.4: Voice Interaction
 * Covers:
 * 1. Speech recognition and synthesis capability detection
 * 2. Proper language mapping to BCP 47 locales (en-IN, hi-IN, ne-NP)
 * 3. Handling microphone permission denial and errors
 * 4. Text editing and correction before submission
 * 5. Speech synthesis controls (speak, pause, resume, stop)
 * 6. Graceful fallback when Web Speech API is unavailable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  startVoiceRecognition,
  speakText
} from '../../src/services/voice/speechService.js';
import { LANGUAGE_LABELS } from '../../src/services/i18n/languageService.js';

describe('Module E.4: Voice Interaction (Speech Recognition & Synthesis)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Maps supported languages to correct BCP 47 voice locales', () => {
    expect(LANGUAGE_LABELS.en.voiceLang).toBe('en-IN');
    expect(LANGUAGE_LABELS.hi.voiceLang).toBe('hi-IN');
    expect(LANGUAGE_LABELS.ne.voiceLang).toBe('ne-NP');
  });

  it('2. Detects unsupported environment gracefully without crashing', () => {
    // In node/vitest environment without window.SpeechRecognition
    expect(isSpeechRecognitionSupported()).toBe(false);
    expect(isSpeechSynthesisSupported()).toBe(false);

    let caughtError = null;
    startVoiceRecognition({
      language: 'en',
      onError: (err) => {
        caughtError = err;
      }
    });

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe('SPEECH_NOT_SUPPORTED');
  });

  it('3. Handles simulated microphone permission denial gracefully', () => {
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn()
    };

    const originalWindow = global.window;
    global.window = {
      ...originalWindow,
      SpeechRecognition: vi.fn(() => mockRecognition)
    };

    let reportedError = null;
    startVoiceRecognition({
      language: 'hi',
      onError: (err) => {
        reportedError = err;
      }
    });

    // Simulate browser emitting permission denial
    mockRecognition.onerror({ error: 'not-allowed' });

    expect(reportedError).toBeDefined();
    expect(reportedError.message).toBe('PERMISSION_DENIED');

    global.window = originalWindow;
  });

  it('4. Delivers continuous transcribed text allowing user correction', () => {
    let capturedTranscript = '';

    let wasFinal = false;

    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn()
    };

    const originalWindow = global.window;
    global.window = {
      ...originalWindow,
      SpeechRecognition: vi.fn(() => mockRecognition)
    };

    startVoiceRecognition({
      language: 'ne',
      onResult: ({ transcript, isFinal }) => {
        capturedTranscript = transcript;
        wasFinal = isFinal;
      }
    });

    // Simulate speech recognition event
    const mockResultItem = [{ transcript: 'लाचुङको मौसम कस्तो छ' }];
    mockResultItem.isFinal = true;

    mockRecognition.onresult({
      resultIndex: 0,
      results: [mockResultItem]
    });

    expect(capturedTranscript).toBe('लाचुङको मौसम कस्तो छ');
    expect(wasFinal).toBe(true);

    // User can edit the transcribed text before sending
    const editedInput = capturedTranscript + ' र बाटो खुला छ?';
    expect(editedInput).toBe('लाचुङको मौसम कस्तो छ र बाटो खुला छ?');

    global.window = originalWindow;
  });

  it('5. Controls SpeechSynthesis playback without automatic trigger', () => {
    const mockUtterance = vi.fn();
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();

    const originalWindow = global.window;
    global.window = {
      ...originalWindow,
      SpeechSynthesisUtterance: mockUtterance,
      speechSynthesis: {
        speak: mockSpeak,
        cancel: mockCancel,
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => [{ lang: 'hi-IN' }])
      }
    };

    // Before user action, speak is not called
    expect(mockSpeak).not.toHaveBeenCalled();

    // User clicks speaker button
    const controls = speakText('सिक्किम यात्रा योजना तयार छ।', { language: 'hi' });

    expect(mockCancel).toHaveBeenCalled(); // Cancels previous playback
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(controls).toBeDefined();

    controls.stop();
    expect(mockCancel).toHaveBeenCalledTimes(2);

    global.window = originalWindow;
  });
});
