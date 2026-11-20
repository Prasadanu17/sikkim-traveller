import { Sparkles } from "lucide-react";

/**
 * Suggestions presented to the user.
 * Dynamically switches between onboarding suggestions (when no itinerary exists)
 * and active itinerary modification actions (when an itinerary is loaded).
 */
export default function CopilotQuickActions({ plannerState, onSelectAction, disabled = false }) {
  const currentItinerary = plannerState?.itinerary?.current;
  const daysCount = currentItinerary?.days?.length || plannerState?.duration || 0;
  const hasItinerary = Boolean(currentItinerary && daysCount > 0);

  let actions = [];

  if (!hasItinerary) {
    // Helpful onboarding actions for first-time planning
    actions = [
      { id: "recommend", label: "🗺️ Suggest 5-Day Route", prompt: "Suggest a 5-day Sikkim route." },
      { id: "north-best", label: "🏔️ North Sikkim Best Time", prompt: "Best time to visit North Sikkim." },
      { id: "permits", label: "📄 Permit Requirements", prompt: "What are the permit requirements for Sikkim and foreign nationals?" },
      { id: "planning-guide", label: "💡 Planning Advice", prompt: "What should I know before planning my trip?" },
      { id: "altitude", label: "🩺 Altitude Sickness Tips", prompt: "What precautions should I take for high altitude sickness (AMS)?" }
    ];
  } else {
    // Dynamic itinerary-specific actions based on actual itinerary days
    const targetDay = daysCount >= 2 ? 2 : 1;
    actions = [
      { id: "cheaper", label: "💰 Reduce Cost", prompt: "Make my trip cheaper." },
      { id: "relaxed", label: `🌿 Relax Day ${targetDay}`, prompt: `Make Day ${targetDay} more relaxed.` },
      { id: "stays", label: `🏨 Day ${targetDay} Hotel Info`, prompt: `Where are we staying on Day ${targetDay}?` },
      { id: "drives", label: "🚗 Reduce Long Drives", prompt: "I don't want long drives." },
      { id: "weather", label: "🌦️ Check Weather", prompt: "What's the weather across our route?" },
      { id: "packing", label: "🧳 Packing Advice", prompt: "What should I pack for high altitude?" },
      { id: "explain", label: "❓ Explain Itinerary", prompt: "Explain my itinerary." }
    ];
  }

  return (
    <div className="space-y-1.5 text-left">
      <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 block px-1">
        {hasItinerary ? "Itinerary Suggestions" : "Trip Planning Suggestions"}
      </span>
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAction(act.prompt)}
            className="px-2.5 py-1 rounded-full bg-cream border border-gold/30 text-ink text-[11px] font-semibold hover:bg-pine hover:text-gold hover:border-pine transition shrink-0 disabled:opacity-50"
          >
            {act.label}
          </button>
        ))}
      </div>
    </div>
  );
}
