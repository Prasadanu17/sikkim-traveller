import { motion } from "framer-motion";

const stories = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop&q=80",
    caption: "Morning views of Kanchenjunga from the balcony #SikkimDiaries",
    span: "md:col-span-1 md:row-span-2",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop&q=80",
    caption: "Traditional Sikkimese thali at the farm-to-table kitchen.",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=400&fit=crop&q=80",
    caption: "Prayer flags dancing at Rumtek Monastery.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop&q=80",
    caption: "Golden hour on the Dzongri trail.",
    span: "md:col-span-1 md:row-span-1",
  },
];

export default function StoriesMoments() {
  return (
    <section id="stories" className="section-pad bg-cream">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="elevation-tag">#SikkimTraveller</span>
          <h2 className="text-3xl md:text-5xl font-medium mt-3 mb-6 font-serif">
            Stories & Moments
          </h2>
          <div className="w-12 h-[1.5px] bg-gold mx-auto" />
          <p className="text-neutral-600 mt-6 max-w-2xl mx-auto text-sm md:text-base font-light">
            Glimpses of unforgettable experiences shared by our guests.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-[250px] gap-4">
          {stories.map((story, idx) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              className={`relative rounded-sm overflow-hidden group ${story.span}`}
            >
              <img
                src={story.image}
                alt={story.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-light leading-snug translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {story.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="btn-outline-gold !text-neutral-900 hover:!text-white border-neutral-300">
            View Instagram
          </button>
        </motion.div>
      </div>
    </section>
  );
}
