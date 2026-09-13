import { motion } from "framer-motion";

export default function FarmToTable() {
  return (
    <section id="dining" className="section-pad bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1 relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-sm overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=1000&fit=crop&q=80"
              alt="Organic Farm Fresh Cuisine Sikkim"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="order-1 lg:order-2 space-y-6 text-center lg:text-left"
          >
            <span className="elevation-tag">Organic Farm Fresh Cuisine</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight text-neutral-900 font-serif">
              Farm to Table
            </h2>
            <div className="w-12 h-[1.5px] bg-gold mx-auto lg:mx-0" />
            <p className="text-neutral-700 text-sm md:text-base font-light leading-relaxed">
              Experience the true taste of Sikkim with our farm-to-table culinary philosophy. We source the freshest organic ingredients directly from local farmers and our own kitchen garden, ensuring every dish is a celebration of regional flavors.
            </p>
            <p className="text-neutral-700 text-sm md:text-base font-light leading-relaxed">
              From traditional Sikkimese thalis to contemporary fusion cuisine, our master chefs craft seasonal menus that nourish both body and soul, served in an elegant dining space with panoramic mountain views.
            </p>
            
            <div className="pt-6">
              <button className="btn-outline-gold !text-neutral-900 hover:!text-white border-neutral-300">
                Explore Menu
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
