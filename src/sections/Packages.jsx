import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { packages } from "../data/packages";

export default function Packages({ onEnquire }) {
  const [active, setActive] = useState(packages[0]);

  return (
    <section className="section-pad relative overflow-hidden bg-[#0a0f0d]">
      {/* Animated gradient orbs — mesh background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Large green orb — top left */}
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#1a4731]/60 blur-[100px]"
        />
        {/* Gold orb — top right */}
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#c9a84c]/20 blur-[90px]"
        />
        {/* Teal orb — bottom center */}
        <motion.div
          animate={{ x: [0, 40, -40, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#0d3d2a]/70 blur-[120px]"
        />
        {/* Small gold orb — mid left */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 -left-10 w-[250px] h-[250px] rounded-full bg-[#c9a84c]/15 blur-[80px]"
        />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #c9a84c 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-gold text-xs tracking-[0.25em] uppercase font-semibold block mb-3">
            Tour Packages
          </span>
          <h2 className="text-3xl md:text-5xl font-medium font-serif text-white">
            Pick a pace, we'll build the route
          </h2>
          <div className="w-12 h-[1.5px] bg-gold mx-auto mt-5" />
        </motion.div>

        {/* Tab Switcher Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border border-white/10 rounded-sm overflow-hidden min-h-[500px]">

          {/* Left — Package List */}
          <div className="lg:col-span-2 border-r border-white/10">
            {packages.map((pkg, idx) => (
              <motion.button
                key={pkg.id}
                onClick={() => setActive(pkg)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className={`w-full text-left px-6 py-5 border-b border-white/10 transition-all duration-300 group relative ${
                  active.id === pkg.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Active indicator bar */}
                {active.id === pkg.id && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold"
                  />
                )}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] uppercase tracking-widest mb-1 ${active.id === pkg.id ? "text-gold" : "text-neutral-500 group-hover:text-gold/70"} transition-colors`}>
                      {pkg.category}
                    </p>
                    <h3 className={`text-sm md:text-base font-medium truncate ${active.id === pkg.id ? "text-white" : "text-neutral-400 group-hover:text-white"} transition-colors`}>
                      {pkg.name}
                    </h3>
                    <p className="text-[11px] text-neutral-600 mt-1">{pkg.duration}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className={`shrink-0 transition-all duration-300 ${active.id === pkg.id ? "text-gold translate-x-1" : "text-neutral-700 group-hover:text-neutral-400"}`}
                  />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right — Package Detail */}
          <div className="lg:col-span-3 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full flex flex-col"
              >
                {/* Image */}
                <div className="relative h-64 lg:h-72 overflow-hidden shrink-0">
                  <img
                    src={active.cover}
                    alt={active.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-black/10 to-transparent" />
                </div>

                {/* Details */}
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  <span className="text-gold text-[10px] uppercase tracking-widest mb-2 block">
                    {active.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-serif font-medium text-white mb-4">
                    {active.name}
                  </h3>

                  <div className="flex items-center gap-5 mb-5 text-neutral-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> {active.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} /> Sikkim, India
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {active.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2.5 text-sm text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/10">
                    <div>
                      <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-0.5">Starting from</p>
                      <p className="text-white font-medium text-base">{active.price}</p>
                    </div>
                    <button
                      onClick={() => onEnquire(active.name)}
                      className="btn-gold text-[11px]"
                    >
                      Enquire Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
