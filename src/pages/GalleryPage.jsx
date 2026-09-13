import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { destinations } from "../data/destinations";

const filters = ["All", "Gangtok", "Mangan", "Gyalshing", "Pakyong", "Namchi"];

const galleryImages = Array.from({ length: 15 }).map((_, i) => ({
  src: `https://picsum.photos/seed/full-gal-${i}/700/${i % 3 === 0 ? 900 : 550}`,
  district: destinations[i % destinations.length].district,
  label: destinations[i % destinations.length].name,
}));

export default function GalleryPage() {
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const filtered =
    active === "All"
      ? galleryImages
      : galleryImages.filter(
          (img) => img.district === active.toLowerCase()
        );

  return (
    <div className="pt-32 pb-24 bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <p className="elevation-tag mb-4 text-crimson">Gallery</p>
        <h1 className="font-display text-4xl text-ink mb-8">
          Frames from the field
        </h1>

        <div className="flex flex-wrap gap-2 mb-12">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active === f
                  ? "bg-crimson text-parchment border-crimson"
                  : "border-ink/15 text-ink/60 hover:border-crimson/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
          {filtered.map((img, i) => (
            <motion.button
              key={img.src}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              onClick={() => setLightbox(img)}
              className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl"
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink/90 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-parchment">
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              src={lightbox.src}
              alt={lightbox.label}
              className="max-h-[85vh] max-w-full rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
