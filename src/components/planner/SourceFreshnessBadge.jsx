import { Info, ExternalLink } from "lucide-react";

export default function SourceFreshnessBadge({ source, confidence = "HIGH", retrievedAt }) {
  if (!source) return null;

  // Support both object { name, confidence, url } and legacy string source names
  const sourceName = typeof source === "object" ? (source.name || "Verified Data") : source;
  const sourceConfidence = typeof source === "object" ? (source.confidence || confidence) : confidence;
  const sourceUrl = typeof source === "object" ? source.url : null;

  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1">
      <span className="font-semibold text-neutral-700">Source: {sourceName}</span>
      <span className="text-neutral-300">•</span>
      <span className="font-mono text-neutral-400">Confidence: {sourceConfidence}</span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-dark hover:underline inline-flex items-center gap-0.5 ml-1 font-medium"
        >
          View <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}
