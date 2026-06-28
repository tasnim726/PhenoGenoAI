import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_COLORS = {
  A: { text: "text-green-400", bg: "bg-green-400", hex: "#4ade80" },
  T: { text: "text-red-400", bg: "bg-red-400", hex: "#f87171" },
  C: { text: "text-blue-400", bg: "bg-blue-400", hex: "#60a5fa" },
  G: { text: "text-yellow-400", bg: "bg-yellow-400", hex: "#facc15" },
};

const STATUS_COLORS = {
  sequencing: "text-cyan-400 border-cyan-400/40",
  aligned: "text-emerald-400 border-emerald-400/40",
  variant_call: "text-amber-400 border-amber-400/40",
  mapping: "text-purple-400 border-purple-400/40",
};

const STATUS_LABELS = {
  sequencing: "SEQ",
  aligned: "ALN",
  variant_call: "VAR",
  mapping: "MAP",
};

function SequenceBar({ sequence, animate }) {
  return (
    <div className="flex gap-[1px] overflow-hidden">
      {sequence.split("").map((base, i) => {
        const color = BASE_COLORS[base] || BASE_COLORS.A;
        return (
          <motion.span
            key={i} // Use just index to prevent remounting when the sequence changes
            initial={animate ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.012, duration: 0.2 }}
            className={`font-mono text-[10px] font-bold ${color.text}`}
            style={{ textShadow: `0 0 6px ${color.hex}40` }}
          >
            {base}
          </motion.span>
        );
      })}
    </div>
  );
}

function SignalMeter({ value, max = 1, label }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-[9px] uppercase text-slate-500">{label}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-electric"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function GeneStream({ stream, index }) {
  const statusColor = STATUS_COLORS[stream.status] || STATUS_COLORS.sequencing;
  const statusLabel = STATUS_LABELS[stream.status] || "SEQ";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group rounded-xl border border-cyan-500/20 bg-slate-950/80 p-3 transition-all hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(0,229,255,0.15)]"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-electric">
            {stream.gene}
          </span>
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase ${statusColor}`}
          >
            {statusLabel}
          </span>
          <span className="text-[9px] text-slate-500">
            {stream.strand} strand
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500">
            pos:{stream.position}
          </span>
          <span className="text-[9px] text-slate-500">
            Q{stream.read_quality}
          </span>
          <span className="text-[9px] text-slate-500">
            {stream.coverage}x
          </span>
        </div>
      </div>

      {/* Sequence display */}
      <div className="mt-2 overflow-hidden rounded-lg bg-slate-900/80 px-2 py-1.5">
        <SequenceBar sequence={stream.sequence} animate={true} />
      </div>

      {/* Full sequence (faded) */}
      <div className="mt-1 overflow-hidden rounded-lg bg-slate-900/40 px-2 py-1">
        <div className="flex gap-[1px] opacity-30">
          {stream.full_sequence.split("").map((base, i) => {
            const color = BASE_COLORS[base] || BASE_COLORS.A;
            return (
              <span
                key={`full-${base}-${i}`}
                className={`font-mono text-[8px] ${color.text}`}
              >
                {base}
              </span>
            );
          })}
        </div>
      </div>

      {/* Signal + features row */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex-1">
          <SignalMeter
            value={stream.signal_strength}
            max={0.5}
            label="Signal"
          />
        </div>
        {stream.associated_features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {stream.associated_features.map((feat) => (
              <span
                key={feat}
                className="rounded-full bg-electric/10 px-1.5 py-0.5 text-[8px] text-electric"
              >
                {feat}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DNASignal({ compact = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const [selectedGene, setSelectedGene] = useState(null);
  const intervalRef = useRef(null);

  const fetchSignal = async () => {
    try {
      const res = await axios.get("/api/genomic-signal/");
      setData(res.data);
      setError(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchSignal();
    intervalRef.current = setInterval(() => {
      fetchSignal();
      setTick((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Determine how many streams to show
  const displayStreams = compact && data?.active_streams 
    ? data.active_streams.slice(0, 3) 
    : data?.active_streams;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-500/60 bg-slate-900 p-5 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] flex flex-col h-full">
      {/* Animated background glow */}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-20">
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,229,255,0.4) 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-wrap gap-2 items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
            Genomic Signal Activity
          </p>
          {data && (
            <p className="mt-0.5 text-[9px] text-slate-500">
              {data.total_genes} genes · {data.total_features} features
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {data && !compact && (
            <div className="flex items-center gap-2 text-[9px] text-slate-400 hidden sm:flex">
              <span>{data.reads_processed?.toLocaleString()} reads</span>
              <span className="text-slate-600">|</span>
              <span>{data.variants_detected} variants</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            LIVE
          </div>
        </div>
      </div>

      {/* Base pair legend */}
      <div className="relative z-10 mt-3 flex items-center gap-3 text-[9px]">
        {Object.entries(BASE_COLORS).map(([base, color]) => (
          <div key={base} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-sm ${color.bg}`} />
            <span className="text-slate-400">{base}</span>
          </div>
        ))}
        <span className="ml-auto text-slate-600">
          #{tick}
        </span>
      </div>

      {/* Active gene streams */}
      <div className="relative z-10 mt-3 space-y-2 flex-1">
        {error && !data && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-xs text-red-400">
            Pipeline offline — waiting for connection...
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {displayStreams?.map((stream, index) => (
            <GeneStream key={stream.gene} stream={stream} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Top features bar */}
      {!compact && data?.top_features?.length > 0 && (
        <div className="relative z-10 mt-4 rounded-xl border border-cyan-500/20 bg-slate-950/60 p-3">
          <p className="text-[9px] uppercase tracking-wider text-slate-500">
            Top ML features (TF-IDF weights)
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {data.top_features.map((feat) => (
              <div
                key={feat.term}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate font-mono text-[9px] text-cyan-300">
                  {feat.term}
                </span>
                <div className="flex items-center gap-1">
                  <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-electric/60"
                      style={{
                        width: `${Math.min(
                          100,
                          (feat.weight / (data.top_features[0]?.weight || 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-slate-500">
                    {feat.weight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All gene labels ticker */}
      {!compact && data?.gene_labels?.length > 0 && (
        <div className="relative z-10 mt-3 overflow-hidden group">
          <div className="flex animate-scroll-x gap-3 group-hover:[animation-play-state:paused]">
            {[...data.gene_labels, ...data.gene_labels].map((gene, i) => (
              <button
                key={`${gene}-${i}`}
                onClick={() => setSelectedGene(gene)}
                className="whitespace-nowrap rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[9px] font-medium text-cyan-400/80 transition-colors hover:bg-cyan-500/20 hover:text-cyan-300"
              >
                {gene}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Gene Modal */}
      <AnimatePresence>
        {selectedGene && data?.all_sequences && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedGene(null)}
          >
            <div 
              className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-slate-900 shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col max-h-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-5 py-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-bold text-electric">{selectedGene}</h4>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] text-cyan-400 uppercase tracking-widest">
                    Reference Sequence
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedGene(null)} 
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto p-5">
                <div className="break-all rounded-xl bg-black/60 p-4 font-mono text-[11px] leading-relaxed shadow-inner">
                  {data.all_sequences[selectedGene]?.split("").map((base, i) => {
                    const color = BASE_COLORS[base] || BASE_COLORS.A;
                    return (
                      <span key={i} className={`${color.text} font-bold opacity-90 hover:opacity-100 transition-opacity`} style={{ textShadow: `0 0 8px ${color.hex}30` }}>
                        {base}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-[10px] text-slate-500">
                  {data.all_sequences[selectedGene]?.length || 0} base pairs
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.35; }
        }
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 20s linear infinite;
        }
      `}</style>
    </section>
  );
}

export default DNASignal;
