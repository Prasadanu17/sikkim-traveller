import { motion } from "framer-motion";

export default function WorkAndUnwind() {
  return (
    <section id="workstation" className="relative py-24 md:py-32 bg-neutral-900 text-cream overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop&q=80"
          alt="Workstation and Lounge with Mountain Views"
          loading="lazy"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span className="text-gold text-xs tracking-[0.25em] uppercase font-semibold block mb-4">
            Where Productivity Meets Comfort
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight mb-8 font-serif text-white">
            Work & Unwind
          </h2>
          <p className="text-neutral-300 text-sm md:text-base font-light leading-relaxed mb-6">
            Designed for the modern digital nomad and business traveler, our dedicated workstations offer high-speed connectivity, ergonomic seating, and inspiring views to keep your productivity flowing.
          </p>
          <p className="text-neutral-300 text-sm md:text-base font-light leading-relaxed mb-10">
            When it's time to disconnect, seamlessly transition to our plush lounge area. Enjoy artisan coffee, curated cocktails, and an ambient atmosphere perfect for networking or quiet reflection.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-10 border-t border-white/10 pt-8">
            <div>
              <h4 className="text-white text-lg mb-2 font-serif">Connectivity</h4>
              <p className="text-neutral-400 text-sm font-light">Gigabit Wi-Fi & Power Backup</p>
            </div>
            <div>
              <h4 className="text-white text-lg mb-2 font-serif">Ambience</h4>
              <p className="text-neutral-400 text-sm font-light">Quiet Zones & Social Spaces</p>
            </div>
          </div>
          
          <button className="btn-gold">
            Discover Spaces
          </button>
        </motion.div>
      </div>
    </section>
  );
}
