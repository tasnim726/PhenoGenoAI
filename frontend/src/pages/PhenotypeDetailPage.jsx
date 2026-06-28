import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPhenotypeBySlug } from "../data/phenotypesCatalog.js";

function PhenotypeDetailPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const phenotype = useMemo(() => getPhenotypeBySlug(slug), [slug]);

  if (!phenotype) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 light:border-slate-200 light:bg-white light:text-slate-700">
        {t("phenotypeNotFound")}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
        <p className="text-xs uppercase text-slate-400 light:text-slate-500">
          {t("phenotypeDetailsTitle")}
        </p>
        <h1 className="mt-2 font-display text-3xl text-white light:text-slate-900">
          {phenotype.label}
        </h1>
        <p className="mt-3 text-sm text-slate-300 light:text-slate-600">
          {phenotype.overview}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
          <img
            src={phenotype.image}
            alt={phenotype.label}
            className="h-48 w-full rounded-2xl border border-white/10 bg-black/40 object-cover"
          />
        </div>
        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("phenotypeSymptoms")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {phenotype.symptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("phenotypeGenes")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {phenotype.genes.map((gene) => (
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
              {t("phenotypeHpo")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {phenotype.hpo.map((term) => (
                <span
                  key={term}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-700"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PhenotypeDetailPage;
