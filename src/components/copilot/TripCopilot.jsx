import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CopilotMessage from "./CopilotMessage";
import CopilotQuickActions from "./CopilotQuickActions";
import CopilotConfirmationModal from "./CopilotConfirmationModal";
import { processCopilotMessage } from "../../services/copilot/copilotService";
import {
  getConversationHistory,
  clearCopilotMemory,
  addMessageToHistory,
  recordAppliedRefinement,
  getSessionConstraints
} from "../../services/copilot/copilotMemoryService";
import { Sparkles, Send, X, RotateCcw, Bot, Check, AlertCircle } from "lucide-react";

export default function TripCopilot({ plannerState, onRefineItinerary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState(() => getConversationHistory());
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [appliedProposalIds, setAppliedProposalIds] = useState(() => new Set());
  const [isApplyingProposal, setIsApplyingProposal] = useState(false);

  const chatFeedRef = useRef(null);

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
  }, [messages, isProcessing]);

  // Initial welcome message if conversation is empty
  useEffect(() => {
    const history = getConversationHistory();
    if (history.length === 0) {
      const welcome = addMessageToHistory(
        "assistant",
        `Hi! I'm your Sikkim Trip Copilot. I understand your ${plannerState?.duration || 5}-day journey. Ask me anything about your destinations, weather, budget optimizations, or trip refinement!`
      );
      if (welcome) {
        setMessages([welcome]);
      }
    } else {
      setMessages(history);
    }
  }, []);

  const handleSendMessage = async (textToSend = null) => {
    const query = (typeof textToSend === "string" ? textToSend : inputText).trim();
    if (!query || isProcessing) return;

    setInputText("");
    setIsProcessing(true);

    // Optimistically render user message
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await processCopilotMessage(query, plannerState);
      setMessages(getConversationHistory());

      // If response includes an action proposal, handle or prompt confirmation
      if (response.actionCard && response.intent?.isMutating) {
        setPendingConfirmation({
          id: response.actionCard.id,
          instruction: response.actionCard.refinementInstruction || query,
          title: response.actionCard.title,
          description: response.actionCard.description,
          expectedImpact: response.actionCard.expectedImpact,
          estimatedSavings: response.actionCard.estimatedSavings,
          actionLabel: response.actionCard.actionLabel,
          proposedChanges: response.actionCard.proposedChanges
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "I ran into a temporary issue understanding that request, but your itinerary remains completely safe.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsProcessing(false);
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
          <div className="fixed inset-0 z-50 flex justify-end p-0 sm:p-4 bg-pine/40 backdrop-blur-xs print:hidden">
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
                  <button
                    onClick={() => setShowResetConfirm(!showResetConfirm)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-parchment hover:bg-white/10 transition"
                    title="New Conversation"
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
                    isApplying={isApplyingProposal}
                    onApplyAction={handleApplyAction}
                    onCancelAction={handleCancelAction}
                  />
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 italic pl-2">
                    <Sparkles size={12} className="animate-spin text-gold-dark" />
                    <span>Copilot is analyzing your trip...</span>
                  </div>
                )}
              </div>

              {/* FOOTER & INPUT */}
              <div className="p-3 bg-white border-t border-neutral-100 space-y-3">
                {/* QUICK SUGGESTIONS */}
                <CopilotQuickActions
                  onSelectAction={(prompt) => handleSendMessage(prompt)}
                  disabled={isProcessing}
                />

                {/* INPUT BAR */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about weather, costs, or changes..."
                    className="w-full text-xs p-3 pr-10 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-gold bg-neutral-50 text-ink"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !inputText.trim()}
                    className={`absolute right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition ${
                      inputText.trim()
                        ? "bg-pine text-gold hover:bg-gold hover:text-pine"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    <Send size={12} />
                  </button>
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
