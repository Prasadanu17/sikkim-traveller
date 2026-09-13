import { Sparkles } from "lucide-react";

const QUICK_ACTIONS = [
  { id: "cheaper",     label: "💰 Reduce Cost",            prompt: "Make my trip cheaper." },
  { id: "relaxed",     label: "🌿 Make It More Relaxed",   prompt: "Make Day 3 more relaxed." },
  { id: "drives",      label: "🚗 Reduce Long Drives",     prompt: "I don't want long drives." },
  { id: "photo",       label: "📸 More Photography",       prompt: "Add more photography spots." },
  { id: "weather",     label: "🌦️ Check Weather",          prompt: "What's the weather in Gangtok?" },
  { id: "packing",     label: "🧳 Packing List",           prompt: "What should I pack?" },
  { id: "explain",     label: "❓ Explain Itinerary",      prompt: "Explain my itinerary." }
];

export default function CopilotQuickActions({ onSelectAction, disabled = false }) {
  return (
    <div className="space-y-1.5 text-left">
      <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 block px-1">
        Copilot Suggestions
      </span>
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
        {QUICK_ACTIONS.map((act) => (
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
