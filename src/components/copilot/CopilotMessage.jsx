import CopilotActionCard from "./CopilotActionCard";
import SourceFreshnessBadge from "../planner/SourceFreshnessBadge";
import { Sparkles, User } from "lucide-react";

export default function CopilotMessage({ message, onApplyAction, onCancelAction, isApplying = false }) {
  if (!message) return null;

  const isUser = message.role === "user";
  const { actionCard, dataCard, sourceBadge } = message.metadata || {};

  return (
    <div className={`flex gap-3 text-left ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-pine text-gold flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Sparkles size={13} />
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
            isUser
              ? "bg-pine text-parchment font-medium rounded-tr-none"
              : "bg-white text-ink border border-neutral-200 rounded-tl-none"
          }`}
        >
          {message.content}

          {/* DATA CARD DETAILS */}
          {dataCard && (
            <div className="mt-2.5 pt-2 border-t border-neutral-100 space-y-1 text-[11px] text-neutral-600">
              <span className="font-bold text-pine block">{dataCard.title}</span>
              {dataCard.details?.map((detail, idx) => (
                <p key={idx}>{detail}</p>
              ))}
            </div>
          )}
        </div>

        {/* SOURCE BADGE */}
        {sourceBadge && (
          <SourceFreshnessBadge source={sourceBadge} confidence={sourceBadge.confidence || "HIGH"} />
        )}

        {/* ACTION CARD */}
        {actionCard && (
          <CopilotActionCard
            actionCard={actionCard}
            isApplying={isApplying}
            onApply={(card) => onApplyAction && onApplyAction(card)}
            onCancel={(cardId) => onCancelAction && onCancelAction(cardId)}
          />
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center shrink-0 mt-0.5">
          <User size={13} />
        </div>
      )}
    </div>
  );
}
