import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft } from "lucide-react";
import { getDistrictBySlug } from "../data/districts";
import { rooms } from "../data/rooms";

export default function DistrictPage({ onOpenBooking }) {
  const { slug } = useParams();
  const district = getDistrictBySlug(slug);
  const relatedRooms = rooms.filter((r) => r.district === slug);

  if (!district) {
    return (
      <div className="pt-40 pb-28 text-center">
        <p className="font-display text-2xl">District not found</p>
        <Link to="/" className="text-marigold underline">Back home</Link>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={district.cover} alt={district.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-end px-6 pb-14 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="elevation-tag text-parchment/80 mb-3 flex items-center gap-2">
              <MapPin size={12} /> {district.elevation} average elevation
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-parchment">{district.name} District</h1>
            <p className="text-parchment/70 mt-3 max-w-lg">{district.tagline}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-crimson mb-10">
          <ArrowLeft size={15} /> Back to all districts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl text-ink mb-4">About this district</h2>
            <p className="text-ink/70 leading-relaxed mb-10">{district.description}</p>

            <h3 className="font-display text-xl text-ink mb-4">Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {district.highlights.map((h) => (
                <div key={h} className="rounded-xl bg-marigold/8 border border-marigold/15 px-5 py-4 text-sm text-ink/75">
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-pine rounded-2xl p-7 h-fit sticky top-28">
            <p className="elevation-tag mb-2">Plan This District</p>
            <h3 className="font-display text-xl text-parchment mb-4">Ready when you are</h3>
            <p className="text-sm text-parchment/60 mb-6">
              Tell us your dates and we'll build an itinerary around {district.name}.
            </p>
            <button
              onClick={() => onOpenBooking(`${district.name} District`)}
              className="w-full rounded-full bg-marigold text-pine font-semibold py-3 hover:bg-marigold2 transition-colors text-sm"
            >
              Enquire About {district.name}
            </button>
            <Link
              to={`/plan-your-trip?destination=${district.slug}`}
              className="w-full text-center block rounded-full border border-marigold/40 text-marigold font-semibold py-3 hover:bg-marigold hover:text-pine hover:border-marigold transition-colors mt-3 text-sm"
            >
              ✨ Plan Trip with AI
            </Link>

            {relatedRooms.length > 0 && (
              <div className="mt-8 pt-6 border-t border-parchment/10">
                <p className="text-xs uppercase tracking-wide text-parchment/50 mb-3">Stay options here</p>
                {relatedRooms.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/stay/${r.slug}`}
                    className="block text-sm text-parchment/80 hover:text-marigold py-1.5"
                  >
                    {r.name} — {r.price}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
