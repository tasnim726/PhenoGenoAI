import { useTranslation } from "react-i18next";
import { Activity, FileDown } from "lucide-react";
import TextHighlighter from "./TextHighlighter";

function ResultsDisplay({ data, loading, onExportPdf, exporting }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-white light:text-slate-900">{t("resultsTitle")}</h3>
        <div className="flex items-center gap-2 text-xs text-electric">
          <Activity className="h-4 w-4" />
          Live model simulation
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-electric/20 bg-electric/10 p-6 text-sm text-electric">
          Running inference on phenotype embeddings...
        </div>
      )}

      {!loading && !data && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 light:border-slate-200 light:bg-white light:text-slate-600">
          {t("resultsEmpty")}
        </div>
      )}

      {!loading && data && (
        <>
          <div className="mb-4">
            <TextHighlighter text={data.symptoms_text} attentionMap={data.attention_map} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.predictions.map((item) => (
              <div
                key={item.gene}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-electric">{item.gene}</span>
                  <span className="rounded-full bg-electric/20 px-3 py-1 text-xs text-electric">
                    {item.probability}% {t("probability")}
                  </span>
                </div>
                <p className="text-xs uppercase text-slate-400 light:text-slate-500">{item.disease}</p>
                <a
                  href={item.omim}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-electric underline-offset-4 hover:underline"
                >
                  {t("omimLink")}
                </a>
              </div>
            ))}
          </div>

          {(data.phenotype_predictions?.length || data.genotype_predictions?.length) && (
            <div
              className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-xl light:border-slate-200 light:bg-white light:text-slate-900 lg:grid-cols-2"
            >
              {data.phenotype_predictions?.length ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-400 light:text-slate-500">
                    {t("phenotypePredictions")}
                  </p>
                  {data.phenotype_predictions.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs light:border-slate-200 light:bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white light:text-slate-900">{item.label}</span>
                      </div>
                      
                      {/* Check if we have the nested gene breakdown or fallback data */}
                      {item.genes ? (
                        <div className="space-y-1.5 border-t border-white/5 pt-2">
                          {item.genes.map(g => (
                            <div key={g.gene} className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400">{g.gene}</span>
                              <span className="text-electric">{g.probability}%</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Match probability</span>
                          <span className="text-electric">{item.probability}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
              {data.genotype_predictions?.length ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-400 light:text-slate-500">
                    {t("genotypePredictions")}
                  </p>
                  {data.genotype_predictions.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs light:border-slate-200 light:bg-white"
                    >
                      <span>{item.label}</span>
                      <span className="text-electric">{item.probability}%</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {!loading && data && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700">
          <div>{t("exportHint")}</div>
          <button
            type="button"
            onClick={() => onExportPdf?.()}
            disabled={exporting}
            className="flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-4 py-2 text-xs text-electric transition hover:border-electric disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileDown className="h-4 w-4" />
            {exporting ? t("exporting") : t("exportPdf")}
          </button>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;
