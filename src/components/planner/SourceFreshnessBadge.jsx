import { Info, ExternalLink } from "lucide-react";

export default function SourceFreshnessBadge({ source, confidence = "HIGH", retrievedAt }) {
  if (!source) return null;

  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1">
      <span className="font-semibold text-neutral-700">Source: {source.name || "Verified Data"}</span>
      <span className="text-neutral-300">•</span>
      <span className="font-mono text-neutral-400">Confidence: {confidence}</span>
      {source.url && (
        <a
          href={source.url}
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
