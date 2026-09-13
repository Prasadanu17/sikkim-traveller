import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import EnquiryForm from "./EnquiryForm";

export default function BookingModal({ open, onClose, presetSubject }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative bg-parchment rounded-2xl w-full max-w-xl p-7 sm:p-9 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-ink/50 hover:text-ink"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <p className="elevation-tag mb-2">Quick Enquiry</p>
            <h3 className="font-display text-2xl mb-1">Let's plan your trip</h3>
            <p className="text-sm text-ink/60 mb-6">
              Tell us roughly what you have in mind — we'll follow up with real options and pricing.
            </p>
            <EnquiryForm presetSubject={presetSubject} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
