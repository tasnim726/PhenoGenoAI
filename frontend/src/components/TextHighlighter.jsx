import React from "react";

export default function TextHighlighter({ text, attentionMap }) {
  if (!text) return null;
  if (!attentionMap || attentionMap.length === 0) {
    return <p className="text-sm leading-relaxed text-slate-300">{text}</p>;
  }

  // Create a map of lowercase terms to their importance
  const importanceMap = new Map();
  attentionMap.forEach((item) => {
    importanceMap.set(item.term.toLowerCase(), item.importance);
  });

  // Split text by words and punctuation, preserving whitespace
  const tokens = text.split(/(\b|\s+)/);

  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">
        Explainable AI (Attention Map)
      </p>
      <p className="text-sm leading-relaxed text-slate-300">
        {tokens.map((token, idx) => {
          const lowerToken = token.toLowerCase();
          const importance = importanceMap.get(lowerToken);

          if (importance && importance > 0.1) {
            // Calculate color based on importance (yellow -> red)
            // high importance = red (hue 0), mid importance = orange (hue 30), low = yellow (hue 60)
            const hue = Math.max(0, 60 - importance * 60);
            const alpha = 0.2 + importance * 0.6;
            
            return (
              <span
                key={idx}
                className="relative inline-block cursor-help rounded px-0.5 font-medium text-white transition-colors hover:bg-white/20"
                style={{
                  backgroundColor: `hsla(${hue}, 100%, 50%, ${alpha})`,
                }}
                title={`ML Feature Weight: ${(importance * 100).toFixed(0)}%`}
              >
                {token}
              </span>
            );
          }
          
          return <span key={idx}>{token}</span>;
        })}
      </p>
    </div>
  );
}
