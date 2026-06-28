import { phenotypeCatalog, phenotypeImageMap } from "./phenotypesCatalog.js";

export const historyEntries = [
  {
    id: "PG-1042",
    title: "Pediatric epilepsy panel",
    status: "In review",
    updated: "2h",
    genes: ["BRCA1", "SCN1A"],
    phenotypes: [
      { label: "Seizures", image: phenotypeImageMap["Seizures"] },
      { label: "Hypotonia", image: phenotypeImageMap["Hypotonia"] },
      { label: "Ataxia", image: phenotypeImageMap["Ataxia"] },
    ],
    genotypes: ["c.5266dupC", "c.3700A>G"],
    summary:
      "Rapid review of seizure phenotype with targeted genotype cross-check.",
    imageAccent: "from-cyan-400/30 via-blue-500/10 to-indigo-500/30",
  },
  {
    id: "PG-1109",
    title: "Neurodevelopmental delay review",
    status: "Validated",
    updated: "1d",
    genes: ["MECP2", "STXBP1"],
    phenotypes: [
      { label: "Developmental delay", image: phenotypeImageMap["Developmental delay"] },
      { label: "Microcephaly", image: phenotypeImageMap["Microcephaly"] },
    ],
    genotypes: ["c.806delG", "p.Arg294*"],
    summary: "Delayed development cohort with shared neurology markers.",
    imageAccent: "from-emerald-400/20 via-teal-500/10 to-cyan-500/30",
  },
  {
    id: "PG-1188",
    title: "Infantile epilepsy triage",
    status: "Queued",
    updated: "3d",
    genes: ["KCNQ2", "CACNA1A"],
    phenotypes: [
      { label: "Infantile epilepsy", image: phenotypeImageMap["Infantile epilepsy"] },
      { label: "Hypotonia", image: phenotypeImageMap["Hypotonia"] },
    ],
    genotypes: ["c.811C>T", "c.2138G>A"],
    summary: "Queued for validation after genotype signal detection.",
    imageAccent: "from-fuchsia-400/20 via-purple-500/10 to-blue-600/30",
  },
];

export const phenotypeLibrary = phenotypeCatalog.map((item) => ({
  label: item.label,
  image: item.image,
  slug: item.slug,
}));

export { phenotypeImageMap };
