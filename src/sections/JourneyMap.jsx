import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const stops = [
  { name: "Gangtok", elevation: "1,650m", note: "Arrival, acclimatize" },
  { name: "Tsomgo Lake", elevation: "3,753m", note: "Day trip from Gangtok" },
  { name: "Nathula Pass", elevation: "4,310m", note: "Indo-China border" },
  { name: "Pelling", elevation: "2,150m", note: "Kanchenjunga views" },
  { name: "Lachung", elevation: "2,750m", note: "Overnight, riverside" },
  { name: "Yumthang Valley", elevation: "3,564m", note: "Valley of flowers" },
];

export default function JourneyMap() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.3"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="py-28 bg-parchment">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 max-w-lg">
          <p className="elevation-tag mb-4 text-crimson">Flagship Itinerary</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink">
            The Kanchenjunga Classic route
          </h2>
        </div>

        <div className="relative">
          <svg
            viewBox="0 0 1000 140"
            className="hidden md:block w-full h-32 mb-4"
            preserveAspectRatio="none"
          >
            <path
              d="M20 100 C 150 20, 280 160, 420 60 C 540 -20, 640 140, 780 50 C 850 10, 900 90, 980 40"
              fill="none"
              stroke="#22281F"
              strokeOpacity="0.1"
              strokeWidth="2"
            />
            <motion.path
              d="M20 100 C 150 20, 280 160, 420 60 C 540 -20, 640 140, 780 50 C 850 10, 900 90, 980 40"
              fill="none"
              stroke="#A6423A"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
            {stops.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-crimson mb-3" />
                <p className="font-display text-lg text-ink leading-tight">
                  {s.name}
                </p>
                <p className="font-mono text-[10px] text-marigold tracking-wide mt-1">
                  {s.elevation}
                </p>
                <p className="text-xs text-ink/50 mt-1">{s.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
