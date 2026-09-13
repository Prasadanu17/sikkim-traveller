import { motion } from "framer-motion";

const activities = [
  { icon: "🥾", label: "Trekking" },
  { icon: "📋", label: "Permits" },
  { icon: "🏡", label: "Homestays" },
];

export default function About() {
  return (
    <section id="story" className="section-pad bg-cream overflow-hidden">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 text-center lg:text-left"
          >
            {/* Italic Headline */}
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl italic leading-tight text-neutral-900">
              Experience the{" "}
              <span className="text-gold">untouched</span>
              {" "}beauty of Sikkim…
            </h2>

            <p className="text-neutral-600 text-sm md:text-base font-light leading-relaxed max-w-md mx-auto lg:mx-0">
              Sikkim is a pristine paradise nestled in the northeastern Himalayas of India. With breathtaking trails, ancient monasteries, and rare Himalayan flora — it's the destination for those who seek nature in its purest form. With its crystal-clear rivers and majestic mountain peaks, Sikkim is a true treasure waiting to be discovered.
            </p>

            {/* Activity Icons */}
            <motion.div
              className="flex gap-8 justify-center lg:justify-start pt-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              {activities.map((act, idx) => (
                <motion.div
                  key={act.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-white border border-gold/20 shadow-md flex items-center justify-center text-2xl group-hover:border-gold group-hover:shadow-gold/20 group-hover:shadow-lg transition-all duration-300">
                    {act.icon}
                  </div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                    {act.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <button className="btn-outline-gold !text-neutral-900 hover:!text-white border-neutral-800 bg-transparent">
                Explore Our Journeys
              </button>
            </motion.div>
          </motion.div>

          {/* Right — Overlapping Circles */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative flex items-center justify-center h-[500px] md:h-[580px]"
          >
            {/* Floating dot top-left */}
            <motion.div
              animate={{ y: [-8, 8, -8], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 left-8 w-3 h-3 rounded-full bg-gold/60 z-30"
            />
            {/* Floating dot bottom-right */}
            <motion.div
              animate={{ y: [8, -8, 8], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 right-6 w-4 h-4 rounded-full bg-gold/40 z-30"
            />
            {/* Floating small dot mid-right */}
            <motion.div
              animate={{ x: [-6, 6, -6], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-gold z-30"
            />

            {/* Wavy decoration — top right */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-2 text-gold/50 text-5xl select-none font-thin z-30"
            >
              ≈
            </motion.div>

            {/* Wavy decoration — bottom left */}
            <motion.div
              animate={{ rotate: [0, -5, 5, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-6 left-2 text-gold/40 text-4xl select-none font-thin z-30"
            >
              ≈
            </motion.div>

            {/* Pulsing outer ring — large circle */}
            <motion.div
              animate={{ scale: [1, 1.07, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 right-0 md:right-2 w-[380px] h-[380px] rounded-full border border-gold/30 z-0"
            />
            {/* Rotating dashed ring — large circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 right-0 md:right-2 w-[360px] h-[360px] rounded-full border border-dashed border-gold/20 z-0"
            />

            {/* Large circle — top right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="absolute top-0 right-0 md:right-2 w-[320px] h-[320px] md:w-[350px] md:h-[350px] rounded-full overflow-hidden border-[6px] border-white shadow-2xl z-10"
            >
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=700&fit=crop&q=80"
                alt="Himalayan mountain lake Sikkim"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>

            {/* Pulsing outer ring — small circle */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.12, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute bottom-0 left-0 md:left-6 w-[285px] h-[285px] rounded-full border border-gold/30 z-0"
            />
            {/* Rotating dashed ring — small circle (counter) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-0 left-0 md:left-6 w-[265px] h-[265px] rounded-full border border-dashed border-gold/20 z-0"
            />

            {/* Small circle — bottom left overlapping */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-0 left-0 md:left-6 w-[240px] h-[240px] md:w-[265px] md:h-[265px] rounded-full overflow-hidden border-[6px] border-white shadow-2xl z-20"
            >
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop&q=80"
                alt="Sikkim Himalayan peaks"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>

            {/* Small accent circle — top left floating */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-16 left-4 w-10 h-10 rounded-full bg-gold/10 border border-gold/30 z-5"
            />
            {/* Tiny accent circle — mid */}
            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute top-1/2 left-1/3 w-5 h-5 rounded-full bg-gold/20 z-5"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
