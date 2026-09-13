import { useState } from "react";
import { motion } from "framer-motion";
import SourceFreshnessBadge from "./SourceFreshnessBadge";
import {
  CloudSun,
  ShieldAlert,
  FileCheck,
  MapPin,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink
} from "lucide-react";

export default function TravelIntelligencePanel({
  realtimeState,
  onRefresh,
  isRefreshing = false
}) {
  const [activeTab, setActiveTab] = useState("weather");

  if (!realtimeState) return null;

  const { data, impact, lastChecked, isCurrent } = realtimeState;
  const weather = data?.weather || {};
  const advisories = data?.advisories || [];
  const permits = data?.permits || [];
  const statuses = data?.statuses || {};
  const sources = data?.sources || [];

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-premium space-y-6 text-left print:hidden">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-dark bg-gold/10 px-2.5 py-0.5 rounded inline-block mb-1">
            Real-Time Intelligence
          </span>
          <h3 className="font-display text-lg sm:text-xl text-ink font-bold">
            Sikkim Travel Conditions
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-[10px] text-neutral-400 font-mono">
              Last checked: {lastChecked}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pine bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition"
          >
            <RotateCcw size={12} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Checking..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* OVERALL STATUS BANNER */}
      {impact && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {impact.riskLevel === "HIGH" ? "🔴" : impact.riskLevel === "MODERATE" ? "🟡" : "🟢"}
            </span>
            <div>
              <span className="text-xs font-bold text-ink font-display block">{impact.overallStatus}</span>
              <span className="text-[11px] text-neutral-500">
                {impact.exposurePercentage > 0 ? `${impact.exposurePercentage}% itinerary days flagged` : "No current disruptions detected"}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-neutral-200 text-neutral-700">
            {isCurrent ? "LIVE VERIFIED" : "GENERAL"}
          </span>
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="flex border-b border-neutral-200 text-xs font-semibold">
        {[
          { id: "weather", label: "🌦️ Weather" },
          { id: "advisories", label: "🚗 Road Advisories" },
          { id: "permits", label: "📋 Permit Rules" },
          { id: "sources", label: "🔗 Verified Sources" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-4 transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-pine text-pine font-bold"
                : "border-transparent text-neutral-400 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="space-y-4 pt-1">

        {/* WEATHER TAB */}
        {activeTab === "weather" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(weather).length === 0 ? (
              <p className="text-xs text-neutral-400">No destination weather data fetched.</p>
            ) : (
              Object.entries(weather).map(([slug, w]) => (
                <div key={slug} className="bg-cream/40 border border-gold/20 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-ink">{slug.replace(/-/g, " ")}</span>
                    <span className="text-sm">{w.icon}</span>
                  </div>
                  <div className="text-xs font-semibold text-pine">
                    {w.temperature.min}°C – {w.temperature.max}°C • {w.condition}
                  </div>
                  <p className="text-[11px] text-neutral-600">{w.summary}</p>
                  <SourceFreshnessBadge source={w.source} confidence={w.confidence} />
                </div>
              ))
            )}
          </div>
        )}

        {/* ADVISORIES TAB */}
        {activeTab === "advisories" && (
          <div className="space-y-3">
            {advisories.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} /> No active road or travel advisories reported.
              </div>
            ) : (
              advisories.map((adv, idx) => (
                <div key={idx} className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-600" /> {adv.title}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">
                      {adv.severity}
                    </span>
                  </div>
                  <p className="text-amber-850 leading-relaxed">{adv.message}</p>
                  <SourceFreshnessBadge source={{ name: adv.sourceName, url: adv.sourceUrl }} />
                </div>
              ))
            )}
          </div>
        )}

        {/* PERMITS TAB */}
        {activeTab === "permits" && (
          <div className="space-y-3">
            {permits.map((p, idx) => (
              <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{p.region} — {p.permitType}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Lead Time: {p.leadTimeHours}h
                  </span>
                </div>
                <p className="text-neutral-600 text-[11px]">{p.restrictions}</p>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Docs required: {p.documentsNeeded.join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === "sources" && (
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">
              Verified Information Sources
            </span>
            {sources.map((s, idx) => (
              <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-ink block">{s?.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Type: {s?.type}</span>
                </div>
                {s?.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-dark hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    Portal <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
