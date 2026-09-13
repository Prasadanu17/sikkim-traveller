import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const images = [
  { src: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&h=500&fit=crop&q=80", alt: "Rumtek Monastery Sikkim" },
  { src: "https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=500&h=500&fit=crop&q=80", alt: "Rhododendron forests Sikkim" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop&q=80", alt: "Kanchenjunga peak Sikkim" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&h=500&fit=crop&q=80", alt: "Himalayan mountain trail Sikkim" },
  { src: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=500&h=500&fit=crop&q=80", alt: "Teesta river valley Sikkim" },
];

export default function GalleryPreview() {
  return (
    <section className="py-12 md:py-16 bg-pine overflow-hidden">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 text-center md:text-left">
          <div>
            <span className="elevation-tag">In the Field</span>
            <h2 className="text-2xl md:text-3xl font-medium font-serif mt-2 text-parchment">
              A few frames from recent trips
            </h2>
          </div>
          <Link
            to="/gallery"
            className="text-xs font-medium text-marigold hover:text-white uppercase tracking-widest transition-colors"
          >
            View Full Gallery →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex-shrink-0 w-64 h-64 md:w-72 md:h-72 rounded-sm overflow-hidden snap-center"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
