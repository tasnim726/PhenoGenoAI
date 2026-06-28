import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Filter, Search } from "lucide-react";
import axios from "axios";
import { historyEntries, phenotypeImageMap } from "../data/historyData.js";

function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [analysisEntries, setAnalysisEntries] = useState([]);

  useEffect(() => {
    let isActive = true;
    axios
      .get("/api/analyses/")
      .then((response) => {
        if (!isActive) {
          return;
        }
        const mapped = (response.data || []).map((entry) => {
          const phenotypes = (entry.phenotypes || []).map((label, index) => {
            const fromUpload = entry.phenotype_images?.[index];
            const image = fromUpload || phenotypeImageMap[label] || "";
            return { label, image };
          });

          return {
            id: entry.case_id || `AN-${entry.id}`,
            title: entry.case_id
              ? `${entry.case_id} analysis`
              : `Analysis ${entry.id}`,
            status: "Saved",
            updated: new Date(entry.created_at).toLocaleDateString(),
            genes: entry.genes || [],
            phenotypes,
            genotypes: entry.genotypes || [],
            summary: entry.notes || entry.symptoms || "",
            imageAccent: "from-sky-400/30 via-cyan-500/10 to-blue-600/30",
            qualityStatus: entry.quality_status,
            qualityNotes: entry.quality_notes || [],
            coherenceScore: entry.coherence_score || 0,
            coherenceFactors: entry.coherence_factors || [],
            timeline: entry.phenotype_timeline || [],
            raw: entry,
          };
        });
        setAnalysisEntries(mapped);
      })
      .catch(() => {
        if (isActive) {
          setAnalysisEntries([]);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const combinedEntries = useMemo(
    () => [...analysisEntries, ...historyEntries],
    [analysisEntries]
  );

  const filteredHistory = combinedEntries.filter((entry) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.id.toLowerCase().includes(query) ||
      entry.genes.some((gene) => gene.toLowerCase().includes(query)) ||
      entry.phenotypes.some((phenotype) => phenotype.label.toLowerCase().includes(query))
    );
  });

  const handleExportReport = (entry) => {
    const phenotypeList = entry.phenotypes.map((item) => item.label).join(", ");
    const genotypeList = entry.genotypes.join(", ");
    const geneList = entry.genes.join(", ");
    const timelineList = (entry.timeline || [])
      .map((item) => `${item.date} - ${item.label} (${item.severity})`)
      .join("; ");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>PhenoGenoAI Study Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            .label { color: #475569; font-size: 12px; text-transform: uppercase; }
            .block { margin-bottom: 14px; }
          </style>
        </head>
        <body>
          <h1>${entry.title}</h1>
          <div class="block"><span class="label">Case</span><div>${entry.id}</div></div>
          <div class="block"><span class="label">Status</span><div>${entry.status}</div></div>
          <div class="block"><span class="label">Genes</span><div>${geneList}</div></div>
          <div class="block"><span class="label">Phenotypes</span><div>${phenotypeList}</div></div>
          <div class="block"><span class="label">Genotypes</span><div>${genotypeList}</div></div>
          <div class="block"><span class="label">Quality</span><div>${entry.qualityStatus || "-"}</div></div>
          <div class="block"><span class="label">Coherence</span><div>${entry.coherenceScore || 0}</div></div>
          <div class="block"><span class="label">Timeline</span><div>${timelineList || "-"}</div></div>
          <div class="block"><span class="label">Summary</span><div>${entry.summary}</div></div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownloadSummary = (entry) => {
    const payload = [
      `Title: ${entry.title}`,
      `Case: ${entry.id}`,
      `Status: ${entry.status}`,
      `Genes: ${entry.genes.join(", ")}`,
      `Phenotypes: ${entry.phenotypes.map((item) => item.label).join(", ")}`,
      `Genotypes: ${entry.genotypes.join(", ")}`,
      `Summary: ${entry.summary}`,
    ].join("\n");
    const blob = new Blob([payload], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${entry.id}-summary.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("historyTitle")}
            </p>
            <h1 className="mt-2 font-display text-3xl text-white light:text-slate-900">
              {t("historySubtitle")}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-electric">
            <BadgeCheck className="h-4 w-4" />
            {t("historySignal")}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-electric" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("historySearchPlaceholder")}
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
            />
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl border border-electric/30 bg-electric/10 px-5 py-3 text-xs text-electric"
          >
            <Filter className="h-4 w-4" />
            {t("historyFilters")}
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredHistory.map((entry) => (
          <article
            key={entry.id}
            className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900"
          >
            <div className={`h-36 w-full bg-gradient-to-r ${entry.imageAccent}`}>
              <div className="flex h-full items-end justify-between p-4">
                <div>
                  <p className="text-xs uppercase text-slate-200/80">{entry.id}</p>
                  <h2 className="text-lg font-semibold">{entry.title}</h2>
                </div>
                <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs text-white">
                  {entry.status}
                </span>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between text-xs text-slate-300 light:text-slate-600">
                <span>{t("historyUpdated")}</span>
                <span className="text-electric">{entry.updated}</span>
              </div>
              {(entry.qualityStatus || entry.coherenceScore) && (
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-300 light:text-slate-600">
                  <span className="rounded-full border border-electric/30 bg-electric/10 px-2 py-1 text-electric">
                    {t("historyQuality")}: {entry.qualityStatus || "-"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                    {t("historyCoherence")}: {entry.coherenceScore || 0}
                  </span>
                </div>
              )}
              <div className="grid gap-3">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                    {t("historyGenes")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.genes.map((gene) => (
                      <span
                        key={gene}
                        className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs text-electric"
                      >
                        {gene}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                    {t("historyPhenotypes")}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {entry.phenotypes.map((phenotype) => (
                      <div
                        key={phenotype.label}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                      >
                        {phenotype.image ? (
                          <img
                            src={phenotype.image}
                            alt={phenotype.label}
                            className="h-12 w-16 rounded-xl border border-white/10 bg-black/40 object-cover"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded-xl border border-white/10 bg-black/40" />
                        )}
                        <span>{phenotype.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                    {t("historyGenotypes")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.genotypes.map((genotype) => (
                      <span
                        key={genotype}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                      >
                        {genotype}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(entry)}
                className="w-full rounded-2xl border border-electric/40 bg-electric/10 px-4 py-3 text-xs text-electric"
              >
                {t("historyViewCase")}
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/80 p-6 text-white shadow-2xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-slate-400 light:text-slate-500">
                  {selectedEntry.id}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{selectedEntry.title}</h2>
                <p className="mt-2 text-sm text-slate-300 light:text-slate-600">
                  {selectedEntry.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 light:border-slate-200 light:text-slate-700"
              >
                {t("historyClose")}
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                  {t("historyGenes")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedEntry.genes.map((gene) => (
                    <span
                      key={gene}
                      className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs text-electric"
                    >
                      {gene}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                  {t("historyGenotypes")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedEntry.genotypes.map((genotype) => (
                    <span
                      key={genotype}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                    >
                      {genotype}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                {t("historyPhenotypes")}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {selectedEntry.phenotypes.map((phenotype) => (
                  <div
                    key={phenotype.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                  >
                    {phenotype.image ? (
                      <img
                        src={phenotype.image}
                        alt={phenotype.label}
                        className="h-12 w-16 rounded-xl border border-white/10 bg-black/40 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-xl border border-white/10 bg-black/40" />
                    )}
                    <span>{phenotype.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {(selectedEntry.qualityStatus || selectedEntry.coherenceScore) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                  <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                    {t("historyQuality")}
                  </p>
                  <p className="mt-2 text-electric">
                    {selectedEntry.qualityStatus || "-"}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {(selectedEntry.qualityNotes || []).map((note) => (
                      <span key={note}>{note}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                  <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                    {t("historyCoherence")}
                  </p>
                  <p className="mt-2 text-electric">
                    {selectedEntry.coherenceScore || 0}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {(selectedEntry.coherenceFactors || []).map((factor) => (
                      <span key={factor}>{factor}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {selectedEntry.timeline?.length ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                  {t("historyTimeline")}
                </p>
                <div className="mt-2 grid gap-2">
                  {selectedEntry.timeline.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex items-center justify-between">
                      <span>{item.date}</span>
                      <span>{item.label}</span>
                      <span className="text-electric">{item.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleDownloadSummary(selectedEntry)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
              >
                {t("historyDownloadSummary")}
              </button>
              <button
                type="button"
                onClick={() => handleExportReport(selectedEntry)}
                className="rounded-2xl border border-electric/40 bg-electric/10 px-4 py-2 text-xs text-electric"
              >
                {t("historyExportReport")}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate(`/history/${selectedEntry.id}`);
                  setSelectedEntry(null);
                }}
                className="rounded-2xl bg-electric px-4 py-2 text-xs font-semibold text-midnight"
              >
                {t("historyOpenDetail")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HistoryPage;
