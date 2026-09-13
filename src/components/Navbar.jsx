import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Mountain, Sparkles, Search, Image, Mail } from "lucide-react";
import { districts } from "../data/districts";
import { rooms } from "../data/rooms";

const NAV_LINK_BASE = "text-sm font-medium tracking-wide transition-colors py-2 px-1 flex items-center gap-1.5";
const NAV_LINK_INACTIVE = `${NAV_LINK_BASE} text-parchment/80 hover:text-marigold`;
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} text-marigold font-semibold`;

export default function Navbar({ onBookNow }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [stayOpen, setStayOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState(districts[0]);
  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setTravelOpen(false);
    setStayOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-pine/95 backdrop-blur-md py-3 shadow-lg shadow-black/25 border-b border-parchment/10"
          : "bg-gradient-to-b from-pine/90 via-pine/40 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-marigold/10 border border-marigold/30 flex items-center justify-center text-marigold group-hover:bg-marigold group-hover:text-pine transition-all duration-300 shadow-sm">
            <Mountain size={20} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg text-parchment tracking-wide leading-none">
              Sikkim <span className="text-marigold italic font-serif">Traveller</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-parchment/60 font-mono mt-0.5">
              Himalayan AI Journeys
            </span>
          </div>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {/* Explore Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setTravelOpen(true)}
            onMouseLeave={() => setTravelOpen(false)}
          >
            <button className={`${travelOpen ? "text-marigold" : "text-parchment/80 hover:text-marigold"} ${NAV_LINK_BASE}`}>
              Explore
              <ChevronDown size={13} className={`transition-transform duration-200 ${travelOpen ? "rotate-180 text-marigold" : ""}`} />
            </button>

            <AnimatePresence>
              {travelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[480px]"
                >
                  <div className="bg-pine border border-parchment/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex h-[260px]">
                    <div className="w-[180px] py-2 border-r border-parchment/10 overflow-y-auto shrink-0 bg-pine/60">
                      <div className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-parchment/50 font-mono font-semibold">
                        Districts
                      </div>
                      {districts.map((d) => (
                        <Link
                          key={d.slug}
                          to={`/travel/${d.slug}`}
                          onMouseEnter={() => setActiveDistrict(d)}
                          className={`block px-4 py-2 text-xs transition-colors ${
                            activeDistrict.slug === d.slug
                              ? "bg-marigold/20 text-marigold font-medium"
                              : "text-parchment/80 hover:text-marigold hover:bg-white/5"
                          }`}
                        >
                          {d.name}
                        </Link>
                      ))}
                    </div>
                    <div className="flex-1 relative bg-black/40 overflow-hidden flex flex-col justify-end p-4">
                      {activeDistrict?.cover && (
                        <img
                          src={activeDistrict.cover}
                          alt={activeDistrict.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/30 to-transparent" />
                      <div className="relative z-10">
                        <span className="text-[10px] text-marigold font-mono font-bold uppercase">
                          {activeDistrict?.elevation}
                        </span>
                        <h4 className="font-display text-sm text-parchment font-semibold">
                          {activeDistrict?.name}
                        </h4>
                        <p className="text-[11px] text-parchment/70 line-clamp-2 mt-0.5">
                          {activeDistrict?.tagline}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stay Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setStayOpen(true)}
            onMouseLeave={() => setStayOpen(false)}
          >
            <button className={`${stayOpen ? "text-marigold" : "text-parchment/80 hover:text-marigold"} ${NAV_LINK_BASE}`}>
              Stay
              <ChevronDown size={13} className={`transition-transform duration-200 ${stayOpen ? "rotate-180 text-marigold" : ""}`} />
            </button>

            <AnimatePresence>
              {stayOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[480px]"
                >
                  <div className="bg-pine border border-parchment/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex h-[260px]">
                    <div className="w-[180px] py-2 border-r border-parchment/10 overflow-y-auto shrink-0 bg-pine/60">
                      <div className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-parchment/50 font-mono font-semibold">
                        Lodges & Stays
                      </div>
                      {rooms.map((r) => (
                        <Link
                          key={r.slug}
                          to={`/stay/${r.slug}`}
                          onMouseEnter={() => setActiveRoom(r)}
                          className={`block px-4 py-2 text-xs transition-colors ${
                            activeRoom.slug === r.slug
                              ? "bg-marigold/20 text-marigold font-medium"
                              : "text-parchment/80 hover:text-marigold hover:bg-white/5"
                          }`}
                        >
                          {r.name}
                        </Link>
                      ))}
                    </div>
                    <div className="flex-1 relative bg-black/40 overflow-hidden flex flex-col justify-end p-4">
                      {activeRoom?.cover && (
                        <img
                          src={activeRoom.cover}
                          alt={activeRoom.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/30 to-transparent" />
                      <div className="relative z-10">
                        <span className="text-[10px] text-marigold font-mono font-bold">
                          {activeRoom?.price}
                        </span>
                        <h4 className="font-display text-sm text-parchment font-semibold">
                          {activeRoom?.name}
                        </h4>
                        <p className="text-[11px] text-parchment/70 line-clamp-2 mt-0.5">
                          {activeRoom?.view}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE)}
          >
            About
          </NavLink>

          {/* More Menu (Cleanly groups secondary items) */}
          <div
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button className={`${moreOpen ? "text-marigold" : "text-parchment/80 hover:text-marigold"} ${NAV_LINK_BASE}`}>
              More
              <ChevronDown size={13} className={`transition-transform duration-200 ${moreOpen ? "rotate-180 text-marigold" : ""}`} />
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-52"
                >
                  <div className="bg-pine border border-parchment/15 rounded-2xl shadow-2xl p-2 backdrop-blur-xl flex flex-col space-y-1">
                    <Link
                      to="/gallery"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-parchment/85 hover:text-marigold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Image size={14} className="text-marigold/70" />
                      Gallery
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-parchment/85 hover:text-marigold hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Mail size={14} className="text-marigold/70" />
                      Contact Us
                    </Link>
                    <div className="border-t border-parchment/10 my-1" />
                    <Link
                      to="/track-booking"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400 font-medium hover:bg-amber-400/10 rounded-lg transition-colors"
                    >
                      <Search size={14} className="text-amber-400" />
                      Track My Journey
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right Action: Single Prominent CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/plan-your-trip"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-marigold to-amber-400 text-pine font-bold text-xs uppercase tracking-wider px-5 py-2.5 hover:shadow-lg hover:shadow-marigold/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles size={14} className="text-pine fill-pine" />
            <span>Plan Your Trip</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-parchment hover:bg-white/10 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Slide-over Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-pine z-50 flex flex-col shadow-2xl border-l border-parchment/10 lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-parchment/10">
                <div className="flex items-center gap-2">
                  <Mountain size={18} className="text-marigold" />
                  <span className="font-display text-base text-parchment font-semibold">
                    Sikkim <span className="text-marigold italic">Traveller</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-parchment/70 hover:text-parchment hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Primary Action Card */}
                <Link
                  to="/plan-your-trip"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-marigold text-pine font-bold text-sm shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} /> Plan Your Sikkim Trip
                  </span>
                  <span className="text-xs uppercase tracking-wider bg-pine/10 px-2 py-0.5 rounded-full">
                    AI Planner
                  </span>
                </Link>

                <div className="pt-2 space-y-1">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-base font-medium text-parchment hover:text-marigold hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Home
                  </Link>

                  <div className="py-2 border-y border-parchment/10">
                    <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-parchment/50">
                      Explore Sikkim
                    </div>
                    {districts.map((d) => (
                      <Link
                        key={d.slug}
                        to={`/travel/${d.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-parchment/80 hover:text-marigold hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {d.name} <span className="text-[10px] text-parchment/40">({d.elevation})</span>
                      </Link>
                    ))}
                  </div>

                  <div className="py-2 border-b border-parchment/10">
                    <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-parchment/50">
                      Where to Stay
                    </div>
                    {rooms.map((r) => (
                      <Link
                        key={r.slug}
                        to={`/stay/${r.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-parchment/80 hover:text-marigold hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {r.name}
                      </Link>
                    ))}
                  </div>

                  <Link
                    to="/about"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-base font-medium text-parchment hover:text-marigold hover:bg-white/5 rounded-xl transition-colors"
                  >
                    About Sikkim Traveller
                  </Link>

                  <Link
                    to="/gallery"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-base font-medium text-parchment hover:text-marigold hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Photo Gallery
                  </Link>

                  <Link
                    to="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-base font-medium text-parchment hover:text-marigold hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Contact Us
                  </Link>

                  <Link
                    to="/track-booking"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-base font-medium text-amber-400 hover:bg-amber-400/10 rounded-xl transition-colors"
                  >
                    <Search size={16} /> Track My Journey
                  </Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-parchment/10 bg-pine/80">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onBookNow();
                  }}
                  className="w-full py-3 rounded-full border border-marigold/40 text-marigold font-semibold text-xs uppercase tracking-wider hover:bg-marigold/10 transition-colors"
                >
                  Quick Inquiry
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

