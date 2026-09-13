import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { destinations } from "../data/destinations";

function DestCard({ d, tall }) {
  return (
    <Link to={`/travel/${d.district}`} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl ${
          tall ? "h-[520px]" : "h-[250px]"
        }`}
      >
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          whileInView={{ clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={d.image}
            alt={d.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute top-4 left-4 elevation-tag text-parchment/90">
          {d.elevation}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
          <h3 className="font-display text-xl text-parchment">{d.name}</h3>
          <ArrowUpRight
            size={20}
            className="text-parchment opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
          />
        </div>
      </div>
    </Link>
  );
}

export default function Destinations() {
  return (
    <section className="py-28 bg-parchment">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="elevation-tag mb-4 text-crimson">Where You'll Go</p>
            <h2 className="font-display text-3xl sm:text-4xl text-ink max-w-lg">
              Eight places worth the altitude
            </h2>
          </div>
          <p className="text-sm text-ink/50 max-w-xs">
            Every card is tagged by elevation, not popularity — know what
            you're walking into before you book.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="lg:row-span-2">
            <DestCard d={destinations[0]} tall />
          </div>
          <DestCard d={destinations[1]} />
          <DestCard d={destinations[2]} />
          <div className="lg:row-span-2">
            <DestCard d={destinations[3]} tall />
          </div>
          <DestCard d={destinations[4]} />
          <DestCard d={destinations[5]} />
          <div className="lg:row-span-2">
            <DestCard d={destinations[6]} tall />
          </div>
          <DestCard d={destinations[7]} />
        </div>
      </div>
    </section>
  );
}
