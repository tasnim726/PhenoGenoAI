import { useTranslation } from "react-i18next";
import { Dna, Languages, Moon, Sun } from "lucide-react";

function Navbar({ theme, onToggleTheme, onToggleLanguage }) {
  const { t } = useTranslation();

  return (
    <header className="flex w-full items-center justify-between px-6 py-6 2xl:px-12">
      <div className="flex items-center gap-3 text-lg font-semibold text-electric">
        <Dna className="h-6 w-6" />
        <span className="font-display text-2xl tracking-wide">{t("appName")}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleLanguage}
          className="flex items-center gap-2 rounded-full border border-electric/40 px-4 py-2 text-sm text-electric transition hover:border-electric"
        >
          <Languages className="h-4 w-4" />
          {t("language")}
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-electric light:border-slate-200 light:text-slate-900"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? t("themeLight") : t("themeDark")}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
