import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import axios from "axios";
import InputForm from "../components/InputForm.jsx";
import ResultsDisplay from "../components/ResultsDisplay.jsx";
import DNASignal from "../components/DNASignal.jsx";

const initialResults = null;

function WorkbenchPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flowStep, setFlowStep] = useState("upload");
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chartSeries = {
    daily: [24, 38, 30, 44, 26, 50, 42],
    weekly: [120, 160, 140, 180, 210, 190, 230],
    monthly: [460, 520, 610, 580, 640, 720],
    patients: [32, 48, 28, 20],
    cases: [18, 26, 14, 10],
    analyses: [42, 36, 30, 26, 22, 18],
    results: [55, 25, 12, 8],
  };

  const handleSubmit = async (payload) => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post("/api/predict/", payload);
      setResults(response.data);
    } catch (err) {
      setError(t("predictionError"));
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!results) {
      return;
    }
    setExporting(true);
    try {
      const response = await axios.post(
        "/api/export/",
        { results },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "phenogenoai-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setError(t("exportError"));
        return;
      }
      const rows = results.predictions
        .map(
          (item) =>
            `<tr><td>${item.gene}</td><td>${item.probability}%</td><td>${item.disease}</td></tr>`
        )
        .join("");
      const phenotypeRows = (results.phenotype_predictions || [])
        .map(
          (item) =>
            `<tr><td>${item.label}</td><td>${item.probability}%</td></tr>`
        )
        .join("");
      const genotypeRows = (results.genotype_predictions || [])
        .map(
          (item) =>
            `<tr><td>${item.label}</td><td>${item.probability}%</td></tr>`
        )
        .join("");
      printWindow.document.write(`
        <html>
          <head>
            <title>PhenoGenoAI Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; }
              h1 { font-size: 20px; margin-bottom: 12px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
              th { background: #f3f6ff; text-align: left; }
            </style>
          </head>
          <body>
            <h1>PhenoGenoAI Prediction Report</h1>
            <p>Phenotype: ${results.phenotype || "-"}</p>
            <p>HPO: ${results.hpo || "-"}</p>
            <p>Genotype: ${results.genotype || "-"}</p>
            <table>
              <thead>
                <tr><th>Gene</th><th>Probability</th><th>Disease</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            ${phenotypeRows ? `
            <h2>Phenotype predictions</h2>
            <table>
              <thead>
                <tr><th>Phenotype</th><th>Probability</th></tr>
              </thead>
              <tbody>${phenotypeRows}</tbody>
            </table>
            ` : ""}
            ${genotypeRows ? `
            <h2>Genotype predictions</h2>
            <table>
              <thead>
                <tr><th>Variant</th><th>Probability</th></tr>
              </thead>
              <tbody>${genotypeRows}</tbody>
            </table>
            ` : ""}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <section className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl leading-tight text-white light:text-slate-900"
          >
            {t("tagline")}
          </motion.h1>
          <p className="max-w-xl text-base text-slate-300 light:text-slate-600">
            {t("taglineSupport")}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-electric">
            <span className="h-px w-10 bg-electric/60" />
            Genomic + Clinical Intelligence Pipeline
            <span className="rounded-full border border-electric/30 px-3 py-1 text-xs text-electric">
              {t("activeView")} {t("view_workbench")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: t("kpiPatients"), value: "128" },
              { label: t("kpiGenes"), value: "54" },
              { label: t("kpiTurnaround"), value: "2.4h" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 shadow-lg light:border-slate-200 light:bg-white light:text-slate-700"
              >
                <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-electric">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("workbenchSearchTitle")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("workbenchSearchPlaceholder")}
                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
              <span className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs text-electric">
                {t("workbenchSearchTag")}
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                {t("workbenchSearchFilter")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur light:border-slate-200 light:bg-white light:text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">{t("flowTitle")}</p>
            <p className="text-sm text-slate-200 light:text-slate-700">{t("flowSubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "upload", label: t("flowUpload") },
              { id: "review", label: t("flowReview") },
              { id: "finalize", label: t("flowFinalize") },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setFlowStep(step.id)}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  flowStep === step.id
                    ? "border-electric/70 bg-electric/20 text-electric"
                    : "border-white/10 bg-black/30 text-slate-200 hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-700"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-electric/20 bg-electric/10 p-4 text-xs text-electric">
          {flowStep === "upload" && t("flowHintUpload")}
          {flowStep === "review" && t("flowHintReview")}
          {flowStep === "finalize" && t("flowHintFinalize")}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          { key: "daily", label: t("workbenchDaily") },
          { key: "weekly", label: t("workbenchWeekly") },
          { key: "monthly", label: t("workbenchMonthly") },
        ].map((series) => (
          <div
            key={series.key}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900"
          >
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {series.label}
            </p>
            <div className="mt-4 flex items-end gap-2">
              {chartSeries[series.key].map((value, index) => (
                <div
                  key={`${series.key}-${index}`}
                  className="flex h-28 w-8 items-end justify-center rounded-full border border-electric/20 bg-black/30 light:border-slate-200 light:bg-white"
                >
                  <span
                    className="block w-full rounded-full bg-electric/70"
                    style={{ height: `${Math.min(100, value / 3)}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-300 light:text-slate-600">
              {t("workbenchChartHint")}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("workbenchPatientsBreakdown")}
            </p>
            <span className="text-xs text-electric">{t("workbenchPatientsLive")}</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: t("workbenchPatientsNew"), value: chartSeries.patients[0], color: "bg-electric" },
              { label: t("workbenchPatientsActive"), value: chartSeries.patients[1], color: "bg-emerald-400" },
              { label: t("workbenchPatientsFollowup"), value: chartSeries.patients[2], color: "bg-cyan-400" },
              { label: t("workbenchPatientsClosed"), value: chartSeries.patients[3], color: "bg-slate-400" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs light:border-slate-200 light:bg-white"
              >
                <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                  {item.label}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-lg text-electric">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <p className="text-xs uppercase text-slate-400 light:text-slate-500">
            {t("workbenchCasesDistribution")}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="flex items-center justify-center">
              <div
                className="h-28 w-28 rounded-full"
                style={{
                  background:
                    "conic-gradient(#00e5ff 0 45%, #38bdf8 45% 70%, #22c55e 70% 88%, #64748b 88% 100%)",
                }}
              />
            </div>
            <div className="grid gap-2 text-xs text-slate-200 light:text-slate-700">
              <div className="flex items-center justify-between">
                <span>{t("workbenchCasesGenetic")}</span>
                <span className="text-electric">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("workbenchCasesNeuro")}</span>
                <span className="text-electric">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("workbenchCasesOnco")}</span>
                <span className="text-electric">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("workbenchCasesOther")}</span>
                <span className="text-electric">12%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <p className="text-xs uppercase text-slate-400 light:text-slate-500">
            {t("workbenchAnalysisVolume")}
          </p>
          <div className="mt-4 grid gap-2">
            {chartSeries.analyses.map((value, index) => (
              <div key={`analysis-${index}`} className="flex items-center gap-3">
                <span className="w-8 text-xs text-slate-300 light:text-slate-600">
                  W{index + 1}
                </span>
                <div className="h-2 flex-1 rounded-full bg-black/40 light:bg-slate-100">
                  <div
                    className="h-full rounded-full bg-electric/70"
                    style={{ width: `${Math.min(100, value * 2)}%` }}
                  />
                </div>
                <span className="text-xs text-electric">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <p className="text-xs uppercase text-slate-400 light:text-slate-500">
            {t("workbenchResultsMix")}
          </p>
          <div className="mt-4 space-y-3">
            {[
              { label: t("workbenchResultsHigh"), value: chartSeries.results[0] },
              { label: t("workbenchResultsMedium"), value: chartSeries.results[1] },
              { label: t("workbenchResultsLow"), value: chartSeries.results[2] },
              { label: t("workbenchResultsReview"), value: chartSeries.results[3] },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 light:text-slate-600">
                  <span>{item.label}</span>
                  <span className="text-electric">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-black/40 light:bg-slate-100">
                  <div
                    className="h-full rounded-full bg-electric/70"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <p className="text-xs uppercase text-slate-400 light:text-slate-500">
            {t("workbenchCasesStatus")}
          </p>
          <div className="mt-4 grid gap-3">
            {[
              { label: t("workbenchCasesQueued"), value: chartSeries.cases[0] },
              { label: t("workbenchCasesReview"), value: chartSeries.cases[1] },
              { label: t("workbenchCasesValidated"), value: chartSeries.cases[2] },
              { label: t("workbenchCasesClosed"), value: chartSeries.cases[3] },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs light:border-slate-200 light:bg-white"
              >
                <span>{item.label}</span>
                <span className="text-electric">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur light:border-slate-200 light:bg-white">
        <InputForm onSubmit={handleSubmit} onError={setError} />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      <section className="grid gap-8 items-start lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <ResultsDisplay
            data={results}
            loading={loading}
            onExportPdf={handleExportPdf}
            exporting={exporting}
          />
        </div>
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <DNASignal compact={true} />
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default WorkbenchPage;
