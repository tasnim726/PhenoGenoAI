import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import WorkbenchPage from "./pages/WorkbenchPage.jsx";
import CohortPage from "./pages/CohortPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HistoryDetailPage from "./pages/HistoryDetailPage.jsx";
import AnalysisPage from "./pages/AnalysisPage.jsx";
import PhenotypeGalleryPage from "./pages/PhenotypeGalleryPage.jsx";
import PhenotypeDetailPage from "./pages/PhenotypeDetailPage.jsx";
import DNA3D from "./components/DNA3D.jsx";

function App() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen text-white dark:text-white light:text-slate-900 relative">
        <DNA3D />
        <Navbar
          theme={theme}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          onToggleLanguage={() => i18n.changeLanguage(i18n.language === "en" ? "fr" : "en")}
        />

        <main className="grid w-full gap-8 px-6 pb-16 lg:grid-cols-[260px_1fr] 2xl:px-12">
          <Sidebar />

          <div className="flex flex-col gap-10">
            <Routes>
              <Route path="/" element={<WorkbenchPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/cohort" element={<CohortPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/gallery" element={<PhenotypeGalleryPage />} />
              <Route path="/phenotypes/:slug" element={<PhenotypeDetailPage />} />
              <Route path="/history/:id" element={<HistoryDetailPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
