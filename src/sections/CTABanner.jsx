import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function CTABanner({ onOpenBooking }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={ref} className="relative h-[420px] overflow-hidden">
      <motion.img
        style={{ y }}
        src="https://picsum.photos/seed/cta-mountains/1600/900"
        alt="Sikkim mountains at dusk"
        className="absolute inset-0 w-full h-[130%] object-cover"
      />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl sm:text-4xl text-parchment max-w-xl"
        >
          Plan your Sikkim trip today
        </motion.h2>
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          onClick={onOpenBooking}
          className="mt-7 rounded-full bg-marigold text-pine font-semibold px-8 py-3.5 hover:bg-marigold2 transition-colors"
        >
          Get a Custom Itinerary
        </motion.button>
      </div>
    </section>
  );
}
