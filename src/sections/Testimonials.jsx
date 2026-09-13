import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Ananya R.",
    initials: "AR",
    trip: "Kanchenjunga Classic · 8 days",
    rating: 5,
    quote:
      "Our guide rerouted us around a landslide without missing a single planned stop. Never felt like we were on a fixed package — it felt like travelling with a friend who just happened to know every trail.",
  },
  {
    name: "Marcus T.",
    initials: "MT",
    trip: "Old Silk Route Explorer · 6 days",
    rating: 5,
    quote:
      "Booking the Nathula permit ourselves last year was a nightmare. This time it was just handled — no paperwork, no stress. I didn't even realise we'd crossed into a restricted zone until I looked at the map.",
  },
  {
    name: "Priya & Rohan",
    initials: "PR",
    trip: "Honeymoon in the Clouds · 7 days",
    rating: 5,
    quote:
      "The homestay in Yumthang was the highlight — not the five-star room in Gangtok. The family cooked us dinner over a wood fire and the silence outside was unreal. Glad they pushed us toward it.",
  },
  {
    name: "David K.",
    initials: "DK",
    trip: "Dzongri High-Altitude Trek · 10 days",
    rating: 5,
    quote:
      "Acclimatisation days were built in without us even asking. Small thing, massive difference — nobody in our group got sick. I've done other Himalayan trips where they just push you and you pay for it later.",
  },
  {
    name: "Shreya M.",
    initials: "SM",
    trip: "Hidden Monasteries · 5 days",
    rating: 5,
    quote:
      "We stumbled into a morning prayer ceremony at Rumtek because our guide knew the monks. No tourist groups, no ticket counter. Just us sitting on the floor drinking butter tea. Completely unplanned.",
  },
  {
    name: "James & Claire",
    initials: "JC",
    trip: "North Sikkim Wilderness · 9 days",
    rating: 5,
    quote:
      "The roads are rough and the weather changes every twenty minutes. But that's Sikkim. What we didn't expect was how calm and organised every detail was on the ground. Worth every rupee.",
  },
];

// Duplicate for seamless loop
const ITEMS = [...TESTIMONIALS, ...TESTIMONIALS];

const CARD_W = 400;  // px
const GAP    = 24;   // px
const SPEED  = 0.6;  // px per frame

export default function Testimonials() {
  const x          = useMotionValue(0);
  const isDragging = useRef(false);
  const isHovered  = useRef(false);
  const loopW      = TESTIMONIALS.length * (CARD_W + GAP);

  // Auto-scroll loop — pauses on hover or drag
  useAnimationFrame(() => {
    if (isDragging.current || isHovered.current) return;
    const next = x.get() - SPEED;
    x.set(next < -loopW ? next + loopW : next);
  });

  function handleDragEnd() {
    isDragging.current = false;
    let val = x.get();
    if (val < -loopW) x.set(val + loopW);
    if (val > 0)      x.set(val - loopW);
  }

  return (
    <section className="py-28 bg-parchment overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <div className="max-w-lg">
          <p className="elevation-tag mb-4 text-crimson">Traveler Notes</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink">
            Drag through a few honest ones
          </h2>
          <p className="mt-3 text-neutral-500 text-sm">
            Real trips. Real people. No copy-paste five-stars.
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
      >
        {/* Left fade edge */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-parchment to-transparent" />
        {/* Right fade edge */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-parchment to-transparent" />

        <motion.div
          style={{ x, gap: GAP, paddingLeft: 24, paddingRight: 24, width: "max-content" }}
          drag="x"
          dragConstraints={{ left: -loopW * 2, right: loopW }}
          dragElastic={0.08}
          dragMomentum={true}
          onDragStart={() => { isDragging.current = true; }}
          onDragEnd={handleDragEnd}
          className="flex cursor-grab active:cursor-grabbing select-none"
        >
          {ITEMS.map((t, idx) => (
            <div
              key={idx}
              style={{ minWidth: CARD_W, maxWidth: CARD_W }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-marigold fill-marigold" strokeWidth={0} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-neutral-700 text-[15px] leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
                <div className="w-9 h-9 rounded-full bg-pine2 flex items-center justify-center text-xs font-semibold text-parchment tracking-wide flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-display text-ink text-sm">{t.name}</p>
                  <p className="text-[11px] text-crimson mt-0.5">{t.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Drag hint */}
      <p className="text-center text-xs text-neutral-400 mt-8 tracking-wide">
        ← drag to explore →
      </p>
    </section>
  );
}

