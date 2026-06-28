import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
  Beaker,
  ClipboardList,
  Database,
  Image,
  LayoutDashboard,
  LineChart,
  NotebookPen,
  UploadCloud,
} from "lucide-react";

const menuItems = [
  { id: "workbench", path: "/", icon: LayoutDashboard, labelKey: "menuWorkbench" },
  { id: "upload", path: "/upload", icon: UploadCloud, labelKey: "menuUpload" },
  { id: "analysis", path: "/analysis", icon: NotebookPen, labelKey: "menuAnalysis" },
  { id: "cohort", path: "/cohort", icon: Database, labelKey: "menuCohort" },
  { id: "history", path: "/history", icon: ClipboardList, labelKey: "menuHistory" },
  { id: "gallery", path: "/gallery", icon: Image, labelKey: "menuGallery" },
  { id: "reports", path: "/reports", icon: LineChart, labelKey: "menuReports" },
];

function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur light:border-slate-200 light:bg-white light:text-slate-900">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-electric">
          <Beaker className="h-4 w-4" />
          {t("menuLab")}
        </div>
        <p className="text-xs text-slate-300 light:text-slate-500">
          {t("menuHint")}
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  isActive
                    ? "border-electric/60 bg-electric/10 text-electric"
                    : "border-white/10 bg-black/30 text-slate-200 hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-700"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-electric/20 bg-electric/10 p-4 text-xs text-electric">
        {t("menuCta")}
      </div>
    </aside>
  );
}

export default Sidebar;
