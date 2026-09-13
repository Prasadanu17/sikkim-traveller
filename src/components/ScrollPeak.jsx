import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollPeak() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });

  return (
    <div className="fixed left-0 top-0 bottom-0 w-1 z-[60] hidden md:block">
      <div className="absolute inset-0 bg-ink/5" />
      <motion.div
        style={{ scaleY: smooth, transformOrigin: "top" }}
        className="absolute inset-0 bg-marigold"
      />
    </div>
  );
}
