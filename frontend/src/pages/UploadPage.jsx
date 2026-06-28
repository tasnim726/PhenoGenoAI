import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadCloud } from "lucide-react";

function UploadPage() {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-white light:text-slate-900">{t("uploadTitle")}</h2>
        <p className="text-sm text-slate-300 light:text-slate-600">{t("uploadSubtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl backdrop-blur light:border-slate-200 light:bg-white light:text-slate-700">
          <div className="flex items-center gap-3 text-electric">
            <UploadCloud className="h-5 w-5" />
            <span className="text-base font-semibold">{t("uploadCardTitle")}</span>
          </div>
          <p className="mt-3 text-xs text-slate-400 light:text-slate-500">{t("uploadCardHint")}</p>

          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-electric/40 bg-electric/5 px-6 py-8 text-center text-xs text-electric">
            <input type="file" className="hidden" onChange={handleFileChange} />
            {fileName ? t("uploadSelected", { fileName }) : t("uploadDrop")}
          </label>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-2xl border border-electric/40 bg-electric/10 px-4 py-3 text-xs text-electric transition hover:border-electric"
            >
              {t("uploadValidate")}
            </button>
            <button
              type="button"
              className="rounded-2xl bg-electric px-4 py-3 text-xs font-semibold text-midnight transition hover:shadow-glow"
            >
              {t("uploadStart")}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl backdrop-blur light:border-slate-200 light:bg-white light:text-slate-700">
          <p className="text-sm font-semibold text-electric">{t("uploadChecklistTitle")}</p>
          <ul className="mt-3 space-y-2">
            <li>• {t("uploadChecklist1")}</li>
            <li>• {t("uploadChecklist2")}</li>
            <li>• {t("uploadChecklist3")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
