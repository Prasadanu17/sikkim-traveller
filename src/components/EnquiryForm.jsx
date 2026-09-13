import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export default function EnquiryForm({ presetSubject, compact = false }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    destination: presetSubject || "",
    dates: "",
    message: "",
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          subject: `New enquiry — ${form.destination || "Sikkim Traveller"}`,
          from_name: "Sikkim Traveller website",
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", destination: presetSubject || "", dates: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-10 gap-3">
        <motion.svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="#E8A33D"
            strokeWidth="2.5"
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1, transition: { duration: 0.6, ease: "easeInOut" } },
            }}
          />
          <motion.path
            d="M17 29 L24 36 L39 20"
            fill="none"
            stroke="#E8A33D"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeInOut" } },
            }}
          />
        </motion.svg>
        <h3 className="font-display text-xl text-ink">Enquiry sent</h3>
        <p className="text-sm text-ink/60 max-w-xs">
          We'll write back within a day, usually sooner during trekking season.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-medium text-crimson underline underline-offset-4 mt-2"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`grid ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"} gap-4`}>
      <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink/60">Full name</label>
        <input
          required
          value={form.name}
          onChange={update("name")}
          className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-sm outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition"
          placeholder="Your name"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink/60">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={update("email")}
          className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-sm outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition"
          placeholder="you@email.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink/60">Phone</label>
        <input
          value={form.phone}
          onChange={update("phone")}
          className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-sm outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition"
          placeholder="+91"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink/60">Destination / package</label>
        <input
          value={form.destination}
          onChange={update("destination")}
          className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-sm outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition"
          placeholder="e.g. Yumthang Valley"
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-ink/60">Travel dates</label>
        <input
          value={form.dates}
          onChange={update("dates")}
          className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-sm outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition"
          placeholder="e.g. 12–18 Oct, or flexible"
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-ink/60">Message</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={update("message")}
          className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-sm outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition resize-none"
          placeholder="Number of travelers, anything else we should know"
        />
      </div>

      <div className="sm:col-span-2 flex items-center gap-4 mt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-full bg-crimson text-parchment font-semibold text-sm px-7 py-3 hover:bg-crimson/90 transition-colors disabled:opacity-60"
        >
          {status === "loading" && <Loader2 size={16} className="animate-spin" />}
          {status === "loading" ? "Sending…" : "Send Enquiry"}
        </button>
        <AnimatePresence>
          {status === "error" && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-crimson"
            >
              <AlertCircle size={14} /> Something went wrong — try again.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
