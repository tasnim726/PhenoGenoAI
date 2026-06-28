import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Sparkles } from "lucide-react";

const reports = [
  {
    id: "report-01",
    title: "Phenotype Evidence Summary",
    detail: "Auto-generated HPO clustering with confidence overlays.",
  },
  {
    id: "report-02",
    title: "Genotype Prioritization",
    detail: "Ranked genes with pathogenicity notes and variant counts.",
  },
  {
    id: "report-03",
    title: "Clinical Action Pack",
    detail: "Curated next steps for diagnostics and clinical review.",
  },
];

function ReportsPage() {
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = useState(reports[0]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-white light:text-slate-900">{t("reportsTitle")}</h2>
        <p className="text-sm text-slate-300 light:text-slate-600">{t("reportsSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t("kpiReports"), value: "12" },
          { label: t("kpiExports"), value: "31" },
          { label: t("kpiTurnaround"), value: "18m" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 shadow-lg light:border-slate-200 light:bg-white light:text-slate-700"
          >
            <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-electric">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => setActiveReport(report)}
              className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition ${
                activeReport.id === report.id
                  ? "border-electric/60 bg-electric/10 text-electric"
                  : "border-white/10 bg-black/30 text-slate-200 hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-700"
              }`}
            >
              <span className="text-sm font-semibold">{report.title}</span>
              <span className="text-xs text-slate-400 light:text-slate-500">{report.detail}</span>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl backdrop-blur light:border-slate-200 light:bg-white light:text-slate-700">
          <div className="flex items-center gap-3 text-electric">
            <FileText className="h-5 w-5" />
            <span className="text-base font-semibold">{activeReport.title}</span>
          </div>
          <p className="mt-3 text-xs text-slate-400 light:text-slate-500">{activeReport.detail}</p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-electric" />
              <span className="text-xs text-slate-300 light:text-slate-600">{t("reportsInsight")}</span>
            </div>
            <div className="rounded-2xl border border-electric/30 bg-electric/10 p-4 text-xs text-electric">
              {t("reportsActionHint")}
            </div>
            <button
              type="button"
              className="w-full rounded-2xl bg-electric px-5 py-3 text-xs font-semibold text-midnight transition hover:shadow-glow"
            >
              {t("reportsAction")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
