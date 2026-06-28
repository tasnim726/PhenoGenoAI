import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import axios from "axios";
import { Image, Search } from "lucide-react";
import {
  getPhenotypeByLabel,
  phenotypeCatalog,
  phenotypeImageMap,
} from "../data/phenotypesCatalog.js";

function PhenotypeGalleryPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let isActive = true;
    axios
      .get("/api/analyses/")
      .then((response) => {
        if (!isActive) {
          return;
        }
        const mapped = (response.data || []).flatMap((entry) => {
          const phenotypes = entry.phenotypes || [];
          return phenotypes.map((label, index) => {
            const image = entry.phenotype_images?.[index] || phenotypeImageMap[label] || "";
            return {
              id: `${entry.case_id || entry.id}-${label}-${index}`,
              label,
              image,
              source: entry.case_id || `AN-${entry.id}`,
            };
          });
        });
        setItems(mapped);
      })
      .catch(() => {
        if (isActive) {
          setItems([]);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const staticItems = useMemo(() => {
    return phenotypeCatalog.map((item) => ({
      id: `lib-${item.label}`,
      label: item.label,
      image: item.image,
      slug: item.slug,
      source: t("galleryLibrary"),
    }));
  }, [t]);

  const combinedItems = useMemo(() => [...items, ...staticItems], [items, staticItems]);

  const filteredItems = combinedItems.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      item.label.toLowerCase().includes(query) ||
      item.source.toLowerCase().includes(query)
    );
  });

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl light:border-slate-200 light:bg-white light:text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-slate-400 light:text-slate-500">
              {t("galleryTitle")}
            </p>
            <h1 className="mt-2 font-display text-3xl text-white light:text-slate-900">
              {t("gallerySubtitle")}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-electric">
            <Image className="h-4 w-4" />
            {t("gallerySignal")}
          </div>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-electric" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("gallerySearch")}
            className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-electric/70 placeholder:text-slate-400 light:border-slate-200 light:bg-white light:text-slate-900"
          />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const details = getPhenotypeByLabel(item.label);
          const wrapper = (
            <div
              className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-xl transition hover:border-electric/40 light:border-slate-200 light:bg-white light:text-slate-900"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.label}
                  className="h-40 w-full rounded-2xl border border-white/10 bg-black/40 object-cover"
                />
              ) : (
                <div className="h-40 w-full rounded-2xl border border-white/10 bg-black/40" />
              )}
              <div className="mt-3">
                <p className="text-xs uppercase text-slate-400 light:text-slate-500">
                  {item.source}
                </p>
                <p className="mt-1 text-sm text-electric">{item.label}</p>
              </div>
            </div>
          );

          if (details?.slug) {
            return (
              <Link key={item.id} to={`/phenotypes/${details.slug}`}>
                {wrapper}
              </Link>
            );
          }

          return <div key={item.id}>{wrapper}</div>;
        })}
      </div>
    </section>
  );
}

export default PhenotypeGalleryPage;
