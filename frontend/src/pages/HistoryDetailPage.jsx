import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { historyEntries, phenotypeImageMap } from "../data/historyData.js";

function HistoryDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const staticEntry = useMemo(
    () => historyEntries.find((item) => item.id === id),
    [id]
  );
  const [entry, setEntry] = useState(staticEntry || null);

  useEffect(() => {
    if (staticEntry) {
      return;
    }
    let isActive = true;
    axios
      .get("/api/analyses/")
      .then((response) => {
        if (!isActive) {
          return;
        }
        const match = (response.data || []).find(
          (item) => item.case_id === id || `AN-${item.id}` === id
        );
        if (!match) {
          setEntry(null);
          return;
        }
        const phenotypes = (match.phenotypes || []).map((label, index) => {
          const image = match.phenotype_images?.[index] || phenotypeImageMap[label] || "";
          return { label, image };
        });
        setEntry({
          id: match.case_id || `AN-${match.id}`,
          title: match.case_id ? `${match.case_id} analysis` : `Analysis ${match.id}`,
          status: "Saved",
          updated: new Date(match.created_at).toLocaleDateString(),
          genes: match.genes || [],
          phenotypes,
          genotypes: match.genotypes || [],
          summary: match.notes || match.symptoms || "",
          qualityStatus: match.quality_status,
          qualityNotes: match.quality_notes || [],
          coherenceScore: match.coherence_score || 0,
          coherenceFactors: match.coherence_factors || [],
          timeline: match.phenotype_timeline || [],
        });
      })
      .catch(() => {
        if (isActive) {
          setEntry(null);
        }
      });
    return () => {
      isActive = false;
    };
  }, [id, staticEntry]);

  const handleExportReport = () => {
    if (!entry) {
      return;
    }
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

  if (!entry) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700">
        {t("historyNotFound")}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
        <p className="text-xs uppercase text-slate-400 light:text-slate-500">{entry.id}</p>
        <h1 className="mt-2 font-display text-3xl text-white light:text-slate-900">
          {entry.title}
        </h1>
        <p className="mt-3 text-sm text-slate-300 light:text-slate-600">{entry.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-electric">
          <span className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1">
            {entry.status}
          </span>
          <span>{t("historyUpdated")}: {entry.updated}</span>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <p className="text-xs uppercase text-slate-400 light:text-slate-500">
            {t("historyGenes")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <p className="text-xs uppercase text-slate-400 light:text-slate-500">
            {t("historyGenotypes")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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

      {(entry.qualityStatus || entry.coherenceScore) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("historyQuality")}
            </p>
            <p className="mt-3 text-lg text-electric">{entry.qualityStatus || "-"}</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-200 light:text-slate-700">
              {(entry.qualityNotes || []).map((note) => (
                <div key={note}>{note}</div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("historyCoherence")}
            </p>
            <p className="mt-3 text-lg text-electric">{entry.coherenceScore || 0}</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-200 light:text-slate-700">
              {(entry.coherenceFactors || []).map((factor) => (
                <div key={factor}>{factor}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
        <p className="text-xs uppercase text-slate-400 light:text-slate-500">
          {t("historyPhenotypes")}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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

      {entry.timeline?.length ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <p className="text-xs uppercase text-slate-400 light:text-slate-500">
            {t("historyTimeline")}
          </p>
          <div className="mt-3 grid gap-2">
            {entry.timeline.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
              >
                <span>{item.date}</span>
                <span>{item.label}</span>
                <span className="text-electric">{item.severity}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleExportReport}
          className="rounded-2xl border border-electric/40 bg-electric/10 px-4 py-2 text-xs text-electric"
        >
          {t("historyExportReport")}
        </button>
      </div>
    </section>
  );
}

export default HistoryDetailPage;
