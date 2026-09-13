import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const rooms = [
  {
    title: "Deluxe Rooms",
    slug: "deluxe-rooms",
    price: "Starting from ₹3,200 / night",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=350&fit=crop&q=80",
  },
  {
    title: "Premium Mountain-View Rooms",
    slug: "premium-mountain-view",
    price: "Starting from ₹5,600 / night",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=350&fit=crop&q=80",
  },
  {
    title: "Suites",
    slug: "suites",
    price: "Starting from ₹8,900 / night",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=350&fit=crop&q=80",
  },
  {
    title: "Family Rooms",
    slug: "family-rooms",
    price: "Starting from ₹6,400 / night",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=350&fit=crop&q=80",
  },
  {
    title: "Luxury Tents / Camps",
    slug: "luxury-tents",
    price: "Starting from ₹7,200 / night",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&h=350&fit=crop&q=80",
  },
  {
    title: "Homestays",
    slug: "homestays",
    price: "Starting from ₹2,400 / night",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&h=350&fit=crop&q=80",
  },
];

export default function Accommodation() {
  return (
    <section id="accommodation" className="py-20 md:py-28 bg-cream overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-stretch">
          {/* Left Side Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:w-[35%] flex flex-col justify-center text-center lg:text-left pt-4 lg:pt-0"
          >
            <span className="elevation-tag">STAY IN LUXURY</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium mt-4 mb-6 font-serif leading-tight">
              Our Accommodation
            </h2>
            <div className="w-16 h-[1.5px] bg-gold mx-auto lg:mx-0 mb-6" />
            <p className="text-neutral-600 text-sm md:text-base font-light leading-relaxed mb-8">
              Comfort meets elegance. Choose from our range of handpicked accommodations designed to give you the perfect retreat after a day of exploration.
            </p>
            <div>
              <button className="btn-outline-gold !text-neutral-900 hover:!text-white border-neutral-800 bg-transparent">
                VIEW ALL ROOMS
              </button>
            </div>
          </motion.div>

          {/* Right Side Carousel */}
          <div className="lg:w-[65%] w-full overflow-hidden relative">
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none" />
            
            <motion.div 
              className="flex gap-6 pb-8 pt-4 px-2 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
              whileHover={{ animationPlayState: "paused" }} // Optional: pause on hover (note: requires extra state to work perfectly with framer-motion, but let's keep it simple)
            >
              {[...rooms, ...rooms].map((room, idx) => (
                <Link
                  to={`/stay/${room.slug}`}
                  key={`${room.title}-${idx}`}
                  className="flex-shrink-0 w-[280px] md:w-[320px] group cursor-pointer block"
                >
                  <div className="relative h-[200px] md:h-[220px] overflow-hidden rounded-md mb-4 shadow-sm border border-neutral-200">
                    <img
                      src={room.image}
                      alt={room.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  <div className="px-1">
                    <h3 className="text-base md:text-lg font-serif font-medium text-neutral-900 group-hover:text-gold transition-colors duration-300">
                      {room.title}
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-500 font-light mt-1">
                      {room.price}
                    </p>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
