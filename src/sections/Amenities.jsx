import { motion } from "framer-motion";

const amenities = [
  { title: "Wellness Spa", icon: "💆‍♀️", desc: "Rejuvenate with traditional Himalayan therapies." },
  { title: "Infinity Pool", icon: "🏊‍♂️", desc: "Heated pool overlooking the majestic valleys." },
  { title: "Concierge", icon: "🛎️", desc: "24/7 personalized assistance for your needs." },
  { title: "Fitness Center", icon: "🏋️‍♂️", desc: "State-of-art equipment with panoramic views." },
  { title: "Library Lounge", icon: "📚", desc: "Curated collection of regional literature." },
  { title: "High-Speed WiFi", icon: "📶", desc: "Seamless connectivity throughout the property." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Amenities() {
  return (
    <section id="amenities" className="section-pad bg-cream">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:w-1/3 space-y-5 text-center lg:text-left"
          >
            <span className="elevation-tag">Hotel Facilities</span>
            <h2 className="text-3xl md:text-5xl font-medium leading-tight">
              Our Amenities
            </h2>
            <div className="w-12 h-[1.5px] bg-gold mx-auto lg:mx-0" />
            <p className="text-neutral-700 text-sm md:text-base font-light leading-relaxed">
              Every aspect of your stay is designed to provide unparalleled comfort and luxury. Immerse yourself in a world of refined elegance and personalized service, surrounded by the breathtaking beauty of Sikkim.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          >
            {amenities.map((amenity) => (
              <motion.div
                key={amenity.title}
                variants={itemVariants}
                className="bg-white p-6 rounded-sm border border-neutral-100 hover:border-gold/30 hover:shadow-premium transition-all duration-300 text-center flex flex-col items-center justify-center group"
              >
                <span className="text-3xl mb-4 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  {amenity.icon}
                </span>
                <h3 className="font-serif text-lg text-neutral-900 mb-2">{amenity.title}</h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  {amenity.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
