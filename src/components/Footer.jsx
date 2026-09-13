import { Link } from "react-router-dom";
import { Mountain } from "lucide-react";
import { districts } from "../data/districts";

const socialIcon = "w-[18px] h-[18px] hover:text-marigold cursor-pointer transition-colors";

const Instagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={socialIcon}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const Facebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={socialIcon}>
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Youtube = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={socialIcon}>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-pine text-parchment/80 pt-20 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-contour bg-repeat opacity-[0.15] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-parchment/10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mountain size={20} className="text-marigold" />
              <span className="font-display text-lg text-parchment">
                Sikkim Traveller
              </span>
            </div>
            <p className="text-sm leading-relaxed text-parchment/60 max-w-xs">
              Small-group Himalayan journeys — permits handled, homestays
              curated, guides local to every valley we take you into.
            </p>
            <div className="flex gap-4 mt-5">
              <Instagram />
              <Facebook />
              <Youtube />
            </div>
          </div>

          <div>
            <p className="elevation-tag mb-4">Travel</p>
            <ul className="space-y-2.5 text-sm">
              {districts.map((d) => (
                <li key={d.slug}>
                  <Link to={`/travel/${d.slug}`} className="hover:text-marigold transition-colors">
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="elevation-tag mb-4">Site</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-marigold transition-colors">About Us</Link></li>
              <li><Link to="/plan-your-trip" className="hover:text-marigold transition-colors text-gold">AI Trip Planner</Link></li>
              <li><Link to="/track-booking" className="hover:text-marigold transition-colors text-amber-300">Track Booking</Link></li>
              <li><Link to="/gallery" className="hover:text-marigold transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-marigold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="elevation-tag mb-4">Stay in the loop</p>
            <p className="text-sm text-parchment/60 mb-3">
              Season openings, permit changes, new homestays.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-0 rounded-full bg-parchment/10 p-1 border border-parchment/15"
            >
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent px-3.5 py-2 text-sm outline-none flex-1 placeholder:text-parchment/40"
              />
              <button className="rounded-full bg-marigold text-pine text-xs font-semibold px-4 py-2 hover:bg-marigold2 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs text-parchment/40">
          <p>© {new Date().getFullYear()} Sikkim Traveller. Registered tour operator, Gangtok.</p>
          <p>Safe-travel certified · Inner-line permits handled for every guest</p>
        </div>
      </div>
    </footer>
  );
}
