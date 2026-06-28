import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity, CalendarDays, Microscope, Users } from "lucide-react";

const cohorts = [
  {
    id: "cohort-01",
    name: "Neurodevelopmental Focus",
    summary: "32 cases, multi-site, pediatric",
    topSymptoms: ["Seizures", "Developmental delay", "Hypotonia", "Ataxia"],
    sampleText: "seizures, developmental delay, hypotonia, ataxia",
    predictedGene: "SCN1A",
    confidence: 0.91,
  },
  {
    id: "cohort-02",
    name: "Cardio-Genomics",
    summary: "18 cases, adult, longitudinal",
    topSymptoms: ["Arrhythmia", "Syncope", "Cardiomyopathy", "Chest pain"],
    sampleText: "arrhythmia, syncope, cardiomyopathy, chest pain",
    predictedGene: "MYH7",
    confidence: 0.86,
  },
  {
    id: "cohort-03",
    name: "Oncology Variant Review",
    summary: "11 cases, tumor-normal",
    topSymptoms: ["Weight loss", "Fatigue", "Anemia", "Bone pain"],
    sampleText: "weight loss, fatigue, anemia, bone pain",
    predictedGene: "BRCA1",
    confidence: 0.89,
  },
];

function CohortPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(cohorts[0]);
  const [hpoFilter, setHpoFilter] = useState("");
  const [symptomText, setSymptomText] = useState("");
  const [prediction, setPrediction] = useState(null);

  const handlePredict = () => {
    setPrediction({
      gene: selected.predictedGene,
      confidence: selected.confidence,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-white light:text-slate-900">
          {t("cohortExplorerTitle")}
        </h2>
        <p className="text-sm text-slate-300 light:text-slate-600">
          {t("cohortExplorerSubtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-4 py-2 text-xs text-electric">
          <Microscope className="h-4 w-4" />
          {t("cohortModelHint")}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 light:text-slate-600">
          <Activity className="h-4 w-4 text-electric" />
          {t("cohortLiveMode")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t("kpiCohorts"), value: "6" },
          { label: t("kpiSamples"), value: "143" },
          { label: t("kpiSites"), value: "4" },
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700">
            <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
              {t("cohortFilters")}
            </p>
            <div className="mt-3 grid gap-3">
              <input
                value={hpoFilter}
                onChange={(event) => setHpoFilter(event.target.value)}
                placeholder={t("cohortHpoFilter")}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200 outline-none transition focus:border-electric/60 light:border-slate-200 light:bg-white"
              />
              <textarea
                value={symptomText}
                onChange={(event) => setSymptomText(event.target.value)}
                rows={3}
                placeholder={t("cohortSymptomInput")}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200 outline-none transition focus:border-electric/60 light:border-slate-200 light:bg-white"
              />
            </div>
          </div>

          {cohorts.map((cohort) => (
            <button
              key={cohort.id}
              type="button"
              onClick={() => {
                setSelected(cohort);
                setPrediction(null);
              }}
              className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition ${
                selected.id === cohort.id
                  ? "border-electric/60 bg-electric/10 text-electric"
                  : "border-white/10 bg-black/30 text-slate-200 hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-700"
              }`}
            >
              <span className="text-sm font-semibold">{cohort.name}</span>
              <span className="text-xs text-slate-400 light:text-slate-500">{cohort.summary}</span>
              <span className="text-[11px] text-slate-400 light:text-slate-500">
                {t("cohortTopSymptoms")}: {cohort.topSymptoms.join(", ")}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl backdrop-blur light:border-slate-200 light:bg-white light:text-slate-700">
          <div className="flex items-center gap-3 text-electric">
            <Users className="h-5 w-5" />
            <span className="text-base font-semibold">{selected.name}</span>
          </div>
          <p className="mt-3 text-xs text-slate-400 light:text-slate-500">{selected.summary}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {selected.topSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[11px] text-electric"
              >
                {symptom}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-electric" />
              <span className="text-xs text-slate-300 light:text-slate-600">{t("cohortTimeline")}</span>
            </div>
            <div className="rounded-2xl border border-electric/30 bg-electric/10 p-4 text-xs text-electric">
              {t("cohortSampleText")}: {selected.sampleText}
            </div>
            <button
              type="button"
              onClick={handlePredict}
              className="w-full rounded-2xl bg-electric px-5 py-3 text-xs font-semibold text-midnight transition hover:shadow-glow"
            >
              {t("cohortRunPrediction")}
            </button>
            {prediction && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                  {t("cohortPrediction")}
                </p>
                <p className="mt-2 text-base font-semibold text-electric">
                  {prediction.gene}
                </p>
                <p className="text-xs text-slate-300 light:text-slate-600">
                  {t("cohortConfidence")}: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CohortPage;
