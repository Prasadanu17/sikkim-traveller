import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, BedDouble, Mountain as MountainIcon } from "lucide-react";
import { getRoomBySlug, rooms } from "../data/rooms";
import { getDistrictBySlug } from "../data/districts";
import EnquiryForm from "../components/EnquiryForm";

export default function RoomPage() {
  const { slug } = useParams();
  const room = getRoomBySlug(slug);

  if (!room) {
    return (
      <div className="pt-40 pb-28 text-center">
        <p className="font-display text-2xl">Room type not found</p>
        <Link to="/" className="text-marigold underline">Back home</Link>
      </div>
    );
  }

  const district = getDistrictBySlug(room.district);
  const similar = rooms.filter((r) => r.slug !== room.slug).slice(0, 5);

  return (
    <div className="pt-24">
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img src={room.cover} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
        <div className="relative h-full flex flex-col justify-end px-6 pb-12 max-w-7xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="elevation-tag text-parchment/80 mb-3">{room.elevation}</p>
              <h1 className="font-display text-4xl sm:text-5xl text-parchment">{room.name}</h1>
            </div>
            <span className="font-mono text-sm text-marigold bg-ink/40 px-4 py-2 rounded-full">
              {room.price}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-crimson mb-10">
          <ArrowLeft size={15} /> Back home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-4 mb-8 text-sm text-ink/70">
              <div className="flex items-center gap-2"><Users size={16} className="text-crimson" /> {room.occupancy}</div>
              <div className="flex items-center gap-2"><BedDouble size={16} className="text-crimson" /> {room.bed}</div>
              <div className="flex items-center gap-2"><MountainIcon size={16} className="text-crimson" /> {room.view}</div>
            </div>

            <p className="text-ink/70 leading-relaxed mb-10">{room.description}</p>

            <h3 className="font-display text-xl text-ink mb-4">Gallery</h3>
            <div className="grid grid-cols-3 gap-3 mb-10">
              {room.gallery.map((src, i) => (
                <motion.img
                  key={i}
                  initial={{ clipPath: "inset(0 0 100% 0)" }}
                  whileInView={{ clipPath: "inset(0 0 0% 0)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  src={src}
                  alt={`${room.name} ${i + 1}`}
                  className="w-full h-40 object-cover rounded-xl"
                />
              ))}
            </div>

            <h3 className="font-display text-xl text-ink mb-4">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {room.amenities.map((a) => (
                <div key={a} className="rounded-xl bg-marigold/8 border border-marigold/15 px-4 py-3 text-sm text-ink/75">
                  {a}
                </div>
              ))}
            </div>

            {district && (
              <p className="text-sm text-ink/60">
                Available in{" "}
                <Link to={`/travel/${district.slug}`} className="text-crimson underline underline-offset-4">
                  {district.name} District
                </Link>
              </p>
            )}

            <h3 className="font-display text-xl text-ink mt-12 mb-5">Other stay categories</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {similar.map((r) => (
                <Link
                  key={r.slug}
                  to={`/stay/${r.slug}`}
                  className="min-w-[220px] rounded-xl overflow-hidden bg-white/50 border border-ink/10 hover:border-marigold/50 transition-colors"
                >
                  <img src={r.cover} alt={r.name} className="h-28 w-full object-cover" />
                  <div className="p-3">
                    <p className="font-display text-sm text-ink">{r.name}</p>
                    <p className="text-xs text-ink/50">{r.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-pine rounded-2xl p-7 h-fit sticky top-28">
            <p className="elevation-tag mb-2">Book This Room</p>
            <h3 className="font-display text-xl text-parchment mb-6">{room.name}</h3>
            <div className="[&_label]:text-parchment/60 [&_input]:bg-parchment/10 [&_input]:text-parchment [&_input]:border-parchment/20 [&_textarea]:bg-parchment/10 [&_textarea]:text-parchment [&_textarea]:border-parchment/20 [&_h3]:text-parchment [&_p]:text-parchment/70">
              <EnquiryForm presetSubject={room.name} compact />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
