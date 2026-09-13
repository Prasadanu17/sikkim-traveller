import { motion } from "framer-motion";
import About from "../sections/About";
import Features from "../sections/Features";
import Accommodation from "../sections/Accommodation";
import Amenities from "../sections/Amenities";
import FarmToTable from "../sections/FarmToTable";
import WorkAndUnwind from "../sections/WorkAndUnwind";
import Testimonials from "../sections/Testimonials";

const team = [
  { name: "Tenzin Bhutia", role: "Lead Guide, North Sikkim", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&q=80" },
  { name: "Pema Lepcha", role: "Operations, Gangtok", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&q=80" },
  { name: "Karma Sherpa", role: "Trek Lead, Dzongri route", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&q=80" },
];

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="relative h-[42vh] min-h-[300px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1600&h=700&fit=crop&q=80" alt="Sikkim Himalayan landscape" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative h-full flex flex-col justify-end px-6 pb-12 max-w-7xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">About Sikkim Traveller</h1>
        </div>
      </section>

      <About />

      <section id="team" className="py-24 bg-pine">
        <div className="max-w-7xl mx-auto px-6">
          <p className="elevation-tag mb-4">Guides & Team</p>
          <h2 className="font-display text-3xl text-parchment mb-12 max-w-md">
            People who've actually walked the routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden"
              >
                <img src={t.img} alt={t.name} className="w-full h-64 object-cover" />
                <div className="p-4 bg-pine2">
                  <p className="font-display text-parchment">{t.name}</p>
                  <p className="text-xs text-marigold mt-1">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Features />

      <Accommodation />
      <Amenities />
      <FarmToTable />
      <WorkAndUnwind />
      <Testimonials />
    </div>
  );
}
