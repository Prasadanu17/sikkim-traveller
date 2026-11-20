import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CopilotMessage from "./CopilotMessage";
import CopilotQuickActions from "./CopilotQuickActions";
import CopilotConfirmationModal from "./CopilotConfirmationModal";
import { processCopilotMessage } from "../../services/copilot/copilotService";
import { streamCopilotMessage } from "../../services/copilot/copilotStreamService";
import {
  getConversationHistory,
  clearCopilotMemory,
  addMessageToHistory,
  recordAppliedRefinement,
  getSessionConstraints,
  getPreferredLanguage,
  setPreferredLanguage
} from "../../services/copilot/copilotMemoryService";
import {
  startVoiceRecognition,
  isSpeechRecognitionSupported
} from "../../services/voice/speechService";
import { getMultilingualTemplates } from "../../services/i18n/multilingualTemplates";
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  Bot,
  Check,
  AlertCircle,
  Square,
  Mic,
  MicOff,
  Globe
} from "lucide-react";

export default function TripCopilot({ plannerState, onRefineItinerary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(() => getPreferredLanguage() || "en");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [messages, setMessages] = useState(() => getConversationHistory());
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [appliedProposalIds, setAppliedProposalIds] = useState(() => new Set());
  const [isApplyingProposal, setIsApplyingProposal] = useState(false);

  const chatFeedRef = useRef(null);
  const abortControllerRef = useRef(null);
  const activeVoiceRecRef = useRef(null);

  // Custom listener to allow external components to trigger Copilot open
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-copilot", handleOpen);
    return () => window.removeEventListener("open-copilot", handleOpen);
  }, []);

  // Auto scroll chat feed to bottom on message updates
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages, isProcessing, streamingText]);

  // Initial welcome message if conversation is empty
  useEffect(() => {
    const history = getConversationHistory();
    if (history.length === 0) {
      const t = getMultilingualTemplates(selectedLanguage);
      const welcome = addMessageToHistory(
        "assistant",
        t.welcome(plannerState?.duration || 5),
        { language: selectedLanguage }
      );
      if (welcome) {
        setMessages([welcome]);
      }
    } else {
      setMessages(history);
    }
  }, [selectedLanguage]);

  const handleLanguageChange = (newLang) => {
    setPreferredLanguage(newLang);
    setSelectedLanguage(newLang);
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsProcessing(false);
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (activeVoiceRecRef.current) {
        activeVoiceRecRef.current.stop();
        activeVoiceRecRef.current = null;
      }
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    const rec = startVoiceRecognition({
      language: selectedLanguage,
      onStart: () => setIsListening(true),
      onResult: ({ transcript }) => {
        setInputText(transcript);
      },
      onError: (err) => {
        setIsListening(false);
        if (err.message === "PERMISSION_DENIED") {
          setVoiceError("Microphone permission denied. Please allow microphone access or type your message.");
        } else if (err.message === "SPEECH_NOT_SUPPORTED") {
          setVoiceError("Voice input is not supported in this browser.");
        } else {
          setVoiceError("Could not recognize voice. Please try again or type.");
        }
        setTimeout(() => setVoiceError(null), 4000);
      },
      onEnd: () => {
        setIsListening(false);
        activeVoiceRecRef.current = null;
      }
    });

    if (rec) {
      activeVoiceRecRef.current = rec;
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (typeof textToSend === "string" ? textToSend : inputText).trim();
    if (!query || isProcessing || isStreaming) return;

    if (isListening && activeVoiceRecRef.current) {
      activeVoiceRecRef.current.stop();
      setIsListening(false);
    }

    setInputText("");
    setIsProcessing(true);
    setIsStreaming(true);
    setStreamingText("");

    // Optimistically render user message
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      let latestCard = null;

      await streamCopilotMessage(query, plannerState, {
        language: selectedLanguage,
        signal: abortCtrl.signal,
        onChunk: (chunk) => {
          setStreamingText((prev) => prev + chunk);
        },
        onActionCard: (card) => {
          latestCard = card;
        },
        onDone: (summary) => {
          setMessages(getConversationHistory());
          setStreamingText("");
          setIsStreaming(false);
          setIsProcessing(false);

          if (latestCard || summary.actionCard) {
            const cardToPrompt = latestCard || summary.actionCard;
            setPendingConfirmation({
              id: cardToPrompt.id,
              instruction: cardToPrompt.refinementInstruction || query,
              title: cardToPrompt.title,
              description: cardToPrompt.description,
              expectedImpact: cardToPrompt.expectedImpact,
              estimatedSavings: cardToPrompt.estimatedSavings,
              actionLabel: cardToPrompt.actionLabel,
              proposedChanges: cardToPrompt.proposedChanges
            });
          }
        },
        onError: (err) => {
          console.warn("Copilot stream error:", err);
          setMessages(getConversationHistory());
          setStreamingText("");
          setIsStreaming(false);
          setIsProcessing(false);
        }
      });
    } catch (err) {
      if (!abortCtrl.signal.aborted) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "I ran into a temporary issue understanding that request, but your itinerary remains completely safe.",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setIsStreaming(false);
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  // Check for auto-loaded prompt from dashboard hero
  useEffect(() => {
    const initialPrompt = localStorage.getItem("st_planner_initial_prompt");
    if (initialPrompt) {
      localStorage.removeItem("st_planner_initial_prompt");
      setIsOpen(true);
      handleSendMessage(initialPrompt);
    }
  }, []);

  const handleApplyAction = async (target) => {
    const card = typeof target === "object" ? target : { refinementInstruction: target };
    const instruction = card.refinementInstruction || card.instruction || (typeof target === "string" ? target : "Apply trip change");
    const proposalId = card.id || card.proposalId;

    if (instruction === "LAUNCH_BOOKING_WIZARD") {
      setPendingConfirmation(null);
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent("open-booking-wizard"));
      return;
    }

    // Prevent duplicate execution if already applied or applying
    if (proposalId && appliedProposalIds.has(proposalId)) {
      return;
    }
    if (isApplyingProposal) return;

    setIsApplyingProposal(true);

    try {
      if (proposalId) {
        setAppliedProposalIds((prev) => new Set(prev).add(proposalId));
      }

      if (onRefineItinerary) {
        recordAppliedRefinement(instruction);
        await onRefineItinerary({
          instruction,
          changes: card.proposedChanges || {}
        });
      }

      // Mark card as applied in message history state
      setMessages((prev) =>
        prev.map((m) => {
          if (m.metadata?.actionCard && (m.metadata.actionCard.id === proposalId || m.metadata.actionCard.refinementInstruction === instruction)) {
            return {
              ...m,
              metadata: {
                ...m.metadata,
                actionCard: {
                  ...m.metadata.actionCard,
                  status: "applied"
                }
              }
            };
          }
          return m;
        })
      );

      setPendingConfirmation(null);
      addMessageToHistory(
        "assistant",
        `✓ Applied your request: "${instruction}". Your itinerary and planner preferences have been updated!`
      );
      setMessages(getConversationHistory());
    } catch (err) {
      console.warn("[TripCopilot] Error applying modification:", err);
    } finally {
      setIsApplyingProposal(false);
    }
  };

  const handleCancelAction = (target) => {
    const cardId = typeof target === "object" ? target.id : target;
    setPendingConfirmation(null);

    // Mark proposal as cancelled in message state
    setMessages((prev) =>
      prev.map((m) => {
        if (m.metadata?.actionCard && (m.metadata.actionCard.id === cardId || !cardId)) {
          return {
            ...m,
            metadata: {
              ...m.metadata,
              actionCard: {
                ...m.metadata.actionCard,
                status: "cancelled"
              }
            }
          };
        }
        return m;
      })
    );

    addMessageToHistory("assistant", "Understood, I've kept your current itinerary unchanged.");
    setMessages(getConversationHistory());
  };

  const handleClearChat = () => {
    clearCopilotMemory();
    const welcome = addMessageToHistory(
      "assistant",
      "New conversation started. I still remember your trip context! How can I help you next?"
    );
    setMessages([welcome]);
    setShowResetConfirm(false);
  };

  return (
    <>
      {/* FLOATING COPILOT TRIGGER BUTTON (FIXED BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-pine text-gold font-bold text-xs px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-gold/40 hover:bg-gold hover:text-pine transition-all duration-300"
          aria-label="Open AI Trip Copilot"
        >
          <Sparkles size={16} className="fill-current animate-pulse" />
          <span>✨ Ask Trip Copilot</span>
        </motion.button>
      </div>

      {/* COPILOT PANEL / DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end p-0 sm:p-4 bg-pine/40 backdrop-blur-xs print:hidden overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-white w-full sm:max-w-md h-full sm:h-[85vh] sm:rounded-3xl shadow-2xl flex flex-col border border-gold/30 relative text-left overflow-hidden my-auto"
            >
              {/* HEADER */}
              <div className="p-4 bg-pine text-parchment flex items-center justify-between border-b border-neutral-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-parchment leading-tight">
                      Sikkim Trip Copilot
                    </h3>
                    <span className="text-[10px] text-gold/80 block">
                      Connected to your {plannerState?.duration || 5}-Day Itinerary
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* LANGUAGE SELECTOR */}
                  <div className="bg-white/10 p-0.5 rounded-full flex items-center text-[10px] mr-1">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("en")}
                      className={`px-2 py-0.5 rounded-full font-semibold transition ${
                        selectedLanguage === "en" ? "bg-gold text-pine" : "text-neutral-300 hover:text-white"
                      }`}
                      title="English"
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("hi")}
                      className={`px-2 py-0.5 rounded-full font-semibold transition ${
                        selectedLanguage === "hi" ? "bg-gold text-pine" : "text-neutral-300 hover:text-white"
                      }`}
                      title="हिन्दी (Hindi)"
                    >
                      हिन्दी
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("ne")}
                      className={`px-2 py-0.5 rounded-full font-semibold transition ${
                        selectedLanguage === "ne" ? "bg-gold text-pine" : "text-neutral-300 hover:text-white"
                      }`}
                      title="नेपाली (Nepali)"
                    >
                      नेपाली
                    </button>
                  </div>

                  <button
                    onClick={() => setShowResetConfirm(!showResetConfirm)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-parchment hover:bg-white/10 transition"
                    title="New Conversation"
                    aria-label="New Conversation"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-parchment hover:bg-white/10 transition"
                    aria-label="Close Copilot"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* RESET CONFIRMATION BAR */}
              {showResetConfirm && (
                <div className="bg-pine-dark text-parchment p-2.5 px-4 text-xs flex items-center justify-between gap-2 border-b border-gold/30">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-gold shrink-0" />
                    <span>Clear conversation history?</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-0.5 rounded text-[11px] text-neutral-300 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearChat}
                      className="px-2.5 py-0.5 rounded bg-gold text-pine font-bold text-[11px] hover:bg-gold-light"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* CHAT MESSAGES FEED */}
              <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream/30">
                {messages.map((msg) => (
                  <CopilotMessage
                    key={msg.id}
                    message={msg}
                    activeLanguage={selectedLanguage}
                    isApplying={isApplyingProposal}
                    onApplyAction={handleApplyAction}
                    onCancelAction={handleCancelAction}
                  />
                ))}

                {/* PROGRESSIVE STREAMING RESPONSE BUBBLE */}
                {isStreaming && streamingText && (
                  <div className="flex gap-3 text-left justify-start">
                    <div className="w-7 h-7 rounded-full bg-pine text-gold flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Sparkles size={13} className="animate-spin text-gold" />
                    </div>
                    <div className="max-w-[85%] bg-white text-ink border border-neutral-200 rounded-2xl rounded-tl-none p-3.5 text-xs leading-relaxed shadow-sm">
                      <span>{streamingText}</span>
                      <span className="inline-block w-1.5 h-3.5 bg-pine ml-1 animate-pulse align-middle" />
                    </div>
                  </div>
                )}

                {isProcessing && !streamingText && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 italic pl-2">
                    <Sparkles size={12} className="animate-spin text-gold-dark" />
                    <span>Copilot is analyzing your trip...</span>
                  </div>
                )}
              </div>

              {/* FOOTER & INPUT */}
              <div className="p-3 bg-white border-t border-neutral-100 space-y-3">
                {/* VOICE ERROR BANNER */}
                {voiceError && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] p-2 rounded-xl flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-amber-600 shrink-0" />
                    <span>{voiceError}</span>
                  </div>
                )}

                {/* VOICE LISTENING BANNER */}
                {isListening && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-2 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      <span>Listening ({selectedLanguage === "hi" ? "हिन्दी" : selectedLanguage === "ne" ? "नेपाली" : "English"})... speak now</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className="text-[10px] font-bold text-rose-700 underline"
                    >
                      Done
                    </button>
                  </div>
                )}

                {/* QUICK SUGGESTIONS */}
                <CopilotQuickActions
                  plannerState={plannerState}
                  onSelectAction={(prompt) => handleSendMessage(prompt)}
                  disabled={isProcessing || isStreaming}
                />

                {/* INPUT BAR */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center gap-1.5"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      aria-label="Ask Trip Copilot"
                      placeholder={
                        selectedLanguage === "hi"
                          ? "मौसम, खर्च या बदलाव के बारे में पूछें..."
                          : selectedLanguage === "ne"
                          ? "मौसम, बजेट वा परिमार्जन बारे सोध्नुहोस्..."
                          : "Ask about weather, costs, or changes..."
                      }
                      className="w-full text-xs p-3 pr-8 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-gold bg-neutral-50 text-ink"
                      disabled={isProcessing && !isStreaming}
                    />

                    {/* MICROPHONE BUTTON */}
                    {isSpeechRecognitionSupported() && (
                      <button
                        type="button"
                        onClick={handleToggleVoiceInput}
                        aria-label={isListening ? "Stop voice listening" : "Start voice input"}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition ${
                          isListening
                            ? "text-rose-600 bg-rose-100"
                            : "text-neutral-400 hover:text-pine"
                        }`}
                        title={isListening ? "Stop listening" : "Voice input (Speak your request)"}
                      >
                        {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>
                    )}
                  </div>

                  {/* STOP GENERATION OR SEND BUTTON */}
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopStreaming}
                      aria-label="Stop generating response"
                      className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center transition hover:bg-rose-700 shrink-0 shadow-sm"
                      title="Stop generating response"
                    >
                      <Square size={12} className="fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessing || !inputText.trim()}
                      aria-label="Send message to Trip Copilot"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 ${
                        inputText.trim()
                          ? "bg-pine text-gold hover:bg-gold hover:text-pine shadow-sm cursor-pointer"
                          : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={13} />
                    </button>
                  )}
                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL */}
      <CopilotConfirmationModal
        isOpen={Boolean(pendingConfirmation)}
        title={pendingConfirmation?.title}
        description={pendingConfirmation?.description}
        expectedImpact={pendingConfirmation?.expectedImpact}
        estimatedSavings={pendingConfirmation?.estimatedSavings}
        actionLabel={pendingConfirmation?.actionLabel}
        isApplying={isApplyingProposal}
        onConfirm={() => handleApplyAction(pendingConfirmation)}
        onCancel={() => handleCancelAction(pendingConfirmation?.id)}
      />
    </>
  );
}
