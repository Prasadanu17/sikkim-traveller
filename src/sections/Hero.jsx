import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, Compass, Bed } from "lucide-react";
import { Link } from "react-router-dom";
import slider from "../assets/homepage/slider.mp4";
import slider1 from "../assets/homepage/slider1.mp4";
import slider2 from "../assets/homepage/slider2.mp4";
import slider4 from "../assets/homepage/slider4.mp4";

const VIDEOS = [slider, slider1, slider2, slider4];

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % VIDEOS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
      {/* Background Video Carousel */}
      <div className="absolute inset-0 z-0">
        {VIDEOS.map((src, idx) => (
          <motion.div
            key={src}
            animate={{ 
              opacity: currentVideo === idx ? 1 : 0,
              scale: currentVideo === idx ? 1 : 1.05 
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <video
              src={src}
              autoPlay={currentVideo === idx}
              muted
              loop
              playsInline
              preload={currentVideo === idx ? "auto" : "none"}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Modern Vignette & Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-marigold/15 border border-marigold/30 backdrop-blur-md text-marigold text-xs font-semibold uppercase tracking-widest mb-6"
        >
          <Sparkles size={13} className="fill-marigold" />
          <span>Himalayan AI Travel Assistant</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-display text-white text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.1] drop-shadow-2xl"
        >
          Your Sikkim Journey, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-marigold via-amber-300 to-amber-100 font-serif italic">
            Planned by AI.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-6 text-neutral-200 max-w-xl mx-auto text-base sm:text-lg leading-relaxed font-light drop-shadow-md"
        >
          Tell us your dates, interests, and budget. We'll instantly create a personalized Himalayan itinerary crafted for you.
        </motion.p>

        {/* Primary & Secondary Action Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Dominant Primary CTA */}
          <Link
            to="/plan-your-trip"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-marigold to-amber-400 text-pine font-bold uppercase tracking-widest text-xs px-9 py-4 hover:shadow-xl hover:shadow-marigold/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles size={16} className="fill-pine" />
            <span>Plan My Trip</span>
          </Link>

          {/* Secondary Exploration Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/travel/east-sikkim"
              className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-parchment text-xs font-medium backdrop-blur-sm border border-white/15 transition-all"
            >
              <Compass size={14} className="text-marigold" />
              <span>Explore Sikkim</span>
            </Link>
            <Link
              to="/stay/heritage-suite"
              className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-parchment text-xs font-medium backdrop-blur-sm border border-white/15 transition-all"
            >
              <Bed size={14} className="text-marigold" />
              <span>Find a Stay</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Minimal Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/40 flex flex-col items-center gap-1"
      >
        <span className="text-[9px] uppercase tracking-widest font-mono">Scroll</span>
        <ChevronDown size={18} />
      </motion.div>
    </section>
  );
}

