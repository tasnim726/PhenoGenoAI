import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Beaker,
  ClipboardCheck,
  ImagePlus,
  Info,
  ListChecks,
  UploadCloud,
} from "lucide-react";
import { phenotypeLibrary } from "../data/historyData.js";

function AnalysisPage() {
  const { t } = useTranslation();
  const [caseId, setCaseId] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [genes, setGenes] = useState("");
  const [phenotypes, setPhenotypes] = useState("");
  const [genotypes, setGenotypes] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [librarySelection, setLibrarySelection] = useState([]);
  const [timelineDate, setTimelineDate] = useState("");
  const [timelineLabel, setTimelineLabel] = useState("");
  const [timelineSeverity, setTimelineSeverity] = useState("Moderate");
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const phenotypeImages = useMemo(() => {
    const selected = phenotypeLibrary.filter((item) =>
      librarySelection.includes(item.label)
    );
    return [...selected, ...uploadedImages];
  }, [librarySelection, uploadedImages]);

  const handleFiles = (files) => {
    const readers = Array.from(files).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ label: file.name, image: reader.result });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((items) => {
      setUploadedImages((prev) => [...prev, ...items]);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!caseId.trim()) {
      setMessage(t("analysisCaseRequired"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        case_id: caseId.trim(),
        sex: sex.trim(),
        age: age.trim(),
        symptoms: symptoms.trim(),
        genes: genes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        phenotypes: phenotypes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        genotypes: genotypes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        phenotype_images: phenotypeImages.map((item) => item.image),
        phenotype_timeline: timelineEntries,
        notes: notes.trim(),
      };
      const response = await axios.post("/api/analyses/", payload);
      setLastSaved(response.data);
      setMessage(t("analysisSaved"));
      setCaseId("");
      setSex("");
      setAge("");
      setSymptoms("");
      setGenes("");
      setPhenotypes("");
      setGenotypes("");
      setNotes("");
      setUploadedImages([]);
      setLibrarySelection([]);
      setTimelineEntries([]);
      setTimelineDate("");
      setTimelineLabel("");
      setTimelineSeverity("Moderate");
    } catch (error) {
      setMessage(t("analysisSaveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimeline = () => {
    if (!timelineDate.trim() || !timelineLabel.trim()) {
      return;
    }
    setTimelineEntries((prev) => [
      ...prev,
      {
        date: timelineDate.trim(),
        label: timelineLabel.trim(),
        severity: timelineSeverity,
      },
    ]);
    setTimelineDate("");
    setTimelineLabel("");
  };

  const handleCsvImport = async () => {
    setImportMessage("");
    if (!csvText.trim()) {
      setImportMessage(t("analysisImportRequired"));
      return;
    }
    try {
      const response = await axios.post("/api/analyses/import/", {
        csv_text: csvText,
      });
      setImportMessage(
        t("analysisImportSuccess", { count: response.data?.count || 0 })
      );
      setCsvText("");
    } catch (error) {
      setImportMessage(t("analysisImportError"));
    }
  };

  const handleCsvFile = (file) => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(reader.result || "");
    };
    reader.readAsText(file);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("analysisTitle")}
            </p>
            <h1 className="mt-2 font-display text-3xl text-white light:text-slate-900">
              {t("analysisSubtitle")}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-electric">
            <Beaker className="h-4 w-4" />
            {t("analysisSignal")}
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-center gap-3 text-electric">
              <ClipboardCheck className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t("analysisPatientInfo")}</h2>
            </div>
            <div className="mt-4 grid gap-4">
              <input
                value={caseId}
                onChange={(event) => setCaseId(event.target.value)}
                placeholder={t("analysisCaseId")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={sex}
                  onChange={(event) => setSex(event.target.value)}
                  placeholder={t("analysisSex")}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
                />
                <input
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder={t("analysisAge")}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
                />
              </div>
              <textarea
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                rows={4}
                placeholder={t("analysisSymptoms")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-center gap-3 text-electric">
              <ListChecks className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t("analysisResults")}</h2>
            </div>
            <div className="mt-4 grid gap-4">
              <input
                value={genes}
                onChange={(event) => setGenes(event.target.value)}
                placeholder={t("analysisGenes")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
              <input
                value={phenotypes}
                onChange={(event) => setPhenotypes(event.target.value)}
                placeholder={t("analysisPhenotypes")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
              <input
                value={genotypes}
                onChange={(event) => setGenotypes(event.target.value)}
                placeholder={t("analysisGenotypes")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder={t("analysisNotes")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-center gap-3 text-electric">
              <ListChecks className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t("analysisTimeline")}</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                value={timelineDate}
                onChange={(event) => setTimelineDate(event.target.value)}
                placeholder={t("analysisTimelineDate")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
              <input
                value={timelineLabel}
                onChange={(event) => setTimelineLabel(event.target.value)}
                placeholder={t("analysisTimelineLabel")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
              />
              <select
                value={timelineSeverity}
                onChange={(event) => setTimelineSeverity(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 light:border-slate-200 light:bg-white light:text-slate-900"
              >
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddTimeline}
              className="mt-3 w-full rounded-2xl border border-electric/40 bg-electric/10 px-4 py-2 text-xs text-electric"
            >
              {t("analysisAddTimeline")}
            </button>
            {timelineEntries.length > 0 && (
              <div className="mt-4 grid gap-2">
                {timelineEntries.map((item, index) => (
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
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-center gap-3 text-electric">
              <ImagePlus className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t("analysisPhenotypeImages")}</h2>
            </div>
            <p className="mt-2 text-xs text-slate-300 light:text-slate-600">
              {t("analysisPhenotypeHint")}
            </p>
            <div className="mt-4 grid gap-3">
              <div className="flex flex-wrap gap-2">
                {phenotypeLibrary.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLibrarySelection((prev) =>
                          prev.includes(item.label)
                            ? prev.filter((label) => label !== item.label)
                            : [...prev, item.label]
                        );
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        librarySelection.includes(item.label)
                          ? "border-electric/70 bg-electric/20 text-electric"
                          : "border-white/10 bg-black/30 text-slate-200 hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-700"
                      }`}
                    >
                      {item.label}
                    </button>
                    {item.slug && (
                      <Link
                        to={`/phenotypes/${item.slug}`}
                        className="rounded-full border border-white/10 bg-black/30 p-1 text-slate-200 hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-700"
                        aria-label={`${item.label} details`}
                      >
                        <Info className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-electric/40 bg-black/40 px-4 py-6 text-xs text-electric light:border-electric/60 light:bg-white">
                <UploadCloud className="h-6 w-6" />
                <span>{t("analysisUploadImages")}</span>
                <input
                  type="file"
                  accept="image/*,.vcf,text/vcf"
                  multiple
                  onChange={(event) => handleFiles(event.target.files)}
                  className="hidden"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {phenotypeImages.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className="h-16 w-20 rounded-xl border border-white/10 bg-black/40 object-cover"
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-electric">
                <Beaker className="h-5 w-5" />
                <p className="text-sm">{t("analysisSaveHint")}</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-electric px-4 py-2 text-xs font-semibold text-midnight disabled:opacity-60"
              >
                {saving ? t("analysisSaving") : t("analysisSave")}
              </button>
            </div>
            {message && (
              <p className="mt-3 text-xs text-electric">{message}</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-center gap-3 text-electric">
              <Beaker className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t("analysisQuality")}</h2>
            </div>
            {lastSaved ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("analysisQualityStatus")}</span>
                  <span className="rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs text-electric">
                    {lastSaved.quality_status || "-"}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 light:text-slate-500">
                    {t("analysisQualityNotes")}
                  </p>
                  <div className="mt-2 grid gap-2">
                    {(lastSaved.quality_notes || []).map((note) => (
                      <div
                        key={note}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700">
                  <p className="text-[10px] uppercase text-slate-400 light:text-slate-500">
                    {t("analysisCoherence")}
                  </p>
                  <p className="mt-2 text-xl text-electric">
                    {lastSaved.coherence_score || 0}
                  </p>
                  <div className="mt-2 grid gap-2">
                    {(lastSaved.coherence_factors || []).map((factor) => (
                      <div key={factor}>{factor}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-300 light:text-slate-600">
                {t("analysisQualityEmpty")}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <div className="flex items-center gap-3 text-electric">
              <UploadCloud className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t("analysisImport")}</h2>
            </div>
            <textarea
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              rows={5}
              placeholder={t("analysisImportPlaceholder")}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
            />
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-electric/40 bg-black/40 px-4 py-3 text-xs text-electric light:border-electric/60 light:bg-white">
              <UploadCloud className="h-4 w-4" />
              {t("analysisImportFile")}
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => handleCsvFile(event.target.files?.[0])}
                className="hidden"
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCsvImport}
                className="rounded-2xl border border-electric/40 bg-electric/10 px-4 py-2 text-xs text-electric"
              >
                {t("analysisImportButton")}
              </button>
              {importMessage && (
                <span className="text-xs text-electric">{importMessage}</span>
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

export default AnalysisPage;
