import { motion } from "framer-motion";
import { Compass, ShieldCheck, Home, Users, Clock3 } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Local expert guides",
    desc: "Every trip lead has grown up in the district you're visiting — not a rotating agency roster.",
  },
  {
    icon: ShieldCheck,
    title: "Permits handled",
    desc: "Inner-line and protected-area permits filed before you land, for Nathula, Zuluk, and the North.",
  },
  {
    icon: Home,
    title: "Curated homestays",
    desc: "We vet every homestay ourselves — hygiene, hospitality, and how honestly they price it.",
  },
  {
    icon: Users,
    title: "Small-group travel",
    desc: "Groups capped at 8 travelers, so the mountain roads stay quiet and the guide stays useful.",
  },
  {
    icon: Clock3,
    title: "24/7 on-ground support",
    desc: "A real phone number, answered by someone in Sikkim, for the entire length of your trip.",
  },
];

export default function Features() {
  return (
    <section className="py-28 bg-parchment">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-lg mb-16">
          <p className="elevation-tag mb-4 text-crimson">Why Travel With Us</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink">
            The parts that don't show up in the photos
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-ink/10 rounded-2xl overflow-hidden">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-parchment p-7 hover:bg-marigold/5 transition-colors"
            >
              <f.icon size={22} className="text-crimson mb-5" strokeWidth={1.75} />
              <h3 className="font-display text-lg text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
