/**
 * Customer Quote Breakdown — Module 11
 * Displays verified pricing breakdown, discounts, and estimates.
 * Hides internal costing calculations, margins, or private vendor fees.
 */
import { Wallet } from "lucide-react";

export default function CustomerQuote({ quote, aiEstimate, status }) {
  const isFinal = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(status);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
          <Wallet className="w-4 h-4 text-indigo-400" /> Cost & Pricing
        </h2>
        <span className="text-[10px] text-slate-500 font-semibold uppercase">INR (₹)</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Quote details */}
        {quote ? (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs text-slate-500 uppercase tracking-wider">
              <span>Verified Quote Breakdown</span>
              <span>{quote.versionLabel || "Latest"}</span>
            </div>

            <div className="divide-y divide-slate-805/40 text-xs">
              {Object.entries(quote.breakdown || {}).map(([key, val]) => {
                if (Number(val) <= 0) return null;
                return (
                  <div key={key} className="flex justify-between py-1.5 first:pt-0">
                    <span className="text-slate-500 capitalize">{key}</span>
                    <span className="text-slate-300 font-medium">₹{Number(val).toLocaleString("en-IN")}</span>
                  </div>
                );
              })}

              {quote.discount > 0 && (
                <div className="flex justify-between py-1.5 text-emerald-400 font-semibold">
                  <span>Loyalty Discount</span>
                  <span>-₹{Number(quote.discount).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-sm">
              <span className="text-slate-400 font-semibold">{isFinal ? "Final Confirmed Price" : "Curated Proposal Price"}</span>
              <span className="text-white font-bold text-lg">₹{Number(quote.total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        ) : (
          /* fallback to AI Estimate if quote not generated yet */
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex gap-3 text-slate-450 leading-relaxed">
              <div>
                <p className="font-semibold text-slate-300">Operations Pricing Pending</p>
                <p className="mt-0.5">
                  Our operations experts are checking live rates for your selected stays and vehicle paths. A detailed quote will be sent to you shortly.
                </p>
              </div>
            </div>

            {aiEstimate && (
              <div className="space-y-2">
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">AI Planning Estimate</p>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Estimated Range</span>
                  <span className="text-slate-200 font-medium">
                    ₹{Number(aiEstimate.min).toLocaleString("en-IN")} – ₹{Number(aiEstimate.max).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 italic">
                  Note: AI estimates are calculated based on average seasonal rates. Live price confirmations are subject to final operations vouchers.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
