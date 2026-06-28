import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

function InputForm({ onSubmit, onError }) {
    // Ajout de la gestion de fichier VCF
    const handleVcfUpload = (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setGenotypeText(e.target.result || "");
      };
      reader.readAsText(file);
    };
  const { t } = useTranslation();
  const [clinicalText, setClinicalText] = useState("");
  const [hpoTerms, setHpoTerms] = useState("");
  const [genotypeText, setGenotypeText] = useState("");
  const [mode, setMode] = useState("phenotype");

  const handleSubmit = (event) => {
    event.preventDefault();
    const hasPhenotype = clinicalText.trim().length > 0 || hpoTerms.trim().length > 0;
    const hasGenotype = genotypeText.trim().length > 0;
    if (mode === "phenotype" && !hasPhenotype) {
      onError(t("validationError"));
      return;
    }
    if (mode === "genotype" && !hasGenotype) {
      onError(t("validationError"));
      return;
    }
    if (mode === "all" && !(hasPhenotype && hasGenotype)) {
      onError(t("validationErrorAll"));
      return;
    }
    onSubmit({
      symptoms_text: clinicalText,
      hpo_terms: hpoTerms,
      genotype_text: genotypeText,
      mode
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        <h3 className="font-display text-lg text-white light:text-slate-900">{t("inputTitle")}</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "phenotype", label: t("modePhenotype") },
            { id: "genotype", label: t("modeGenotype") },
            { id: "all", label: t("modeAll") },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                mode === option.id
                  ? "border-electric/70 bg-electric/20 text-electric"
                  : "border-white/10 bg-black/30 text-slate-200 hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {mode !== "genotype" && (
          <textarea
            value={clinicalText}
            onChange={(event) => setClinicalText(event.target.value)}
            rows={6}
            placeholder={t("clinicalPlaceholder")}
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
          />
        )}
        {mode !== "phenotype" && (
          <>
            <textarea
              value={genotypeText}
              onChange={(event) => setGenotypeText(event.target.value)}
              rows={4}
              placeholder={t("genotypePlaceholder")}
              className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
            />
            <div className="mt-2">
              <label className="block text-xs text-electric cursor-pointer">
                Upload VCF file
                <input
                  type="file"
                  accept=".vcf,text/vcf"
                  onChange={handleVcfUpload}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {mode !== "genotype" && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-electric" />
            <input
              value={hpoTerms}
              onChange={(event) => setHpoTerms(event.target.value)}
              placeholder={t("hpoPlaceholder")}
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
            />
          </div>
        )}
        <button
          type="submit"
          className="rounded-2xl bg-electric px-6 py-3 text-sm font-semibold text-midnight transition hover:shadow-glow"
        >
          {t("predictButton")}
        </button>
        <div className="rounded-2xl border border-electric/30 bg-electric/10 p-4 text-xs text-electric">
          {mode === "genotype" ? t("helperGenotype") : t("helperPhenotype")}
        </div>
      </div>
    </form>
  );
}

export default InputForm;
