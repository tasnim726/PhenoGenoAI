import seizuresImg from "../assets/phenotypes/seizures.svg";
import hypotoniaImg from "../assets/phenotypes/hypotonia.svg";
import ataxiaImg from "../assets/phenotypes/ataxia.svg";
import developmentalDelayImg from "../assets/phenotypes/developmental-delay.svg";
import microcephalyImg from "../assets/phenotypes/microcephaly.svg";
import infantileEpilepsyImg from "../assets/phenotypes/infantile-epilepsy.svg";
import cardiomyopathyImg from "../assets/phenotypes/cardiomyopathy.svg";
import hearingLossImg from "../assets/phenotypes/hearing-loss.svg";
import visionImpairmentImg from "../assets/phenotypes/vision-impairment.svg";
import skeletalDysplasiaImg from "../assets/phenotypes/skeletal-dysplasia.svg";
import craniofacialImg from "../assets/phenotypes/craniofacial.svg";
import mriAbnormalityImg from "../assets/phenotypes/mri-abnormality.svg";

export const phenotypeCatalog = [
  {
    label: "Seizures",
    slug: "seizures",
    image: seizuresImg,
    overview: "Episodes of uncontrolled electrical activity in the brain.",
    symptoms: ["Convulsions", "Loss of awareness", "Tonic-clonic events"],
    genes: ["SCN1A", "KCNQ2", "MECP2"],
    hpo: ["HP:0001250"],
  },
  {
    label: "Hypotonia",
    slug: "hypotonia",
    image: hypotoniaImg,
    overview: "Reduced muscle tone leading to poor motor control.",
    symptoms: ["Floppy posture", "Delayed motor milestones"],
    genes: ["SMN1", "MECP2"],
    hpo: ["HP:0001252"],
  },
  {
    label: "Ataxia",
    slug: "ataxia",
    image: ataxiaImg,
    overview: "Loss of coordination affecting gait and fine motor control.",
    symptoms: ["Unsteady gait", "Balance issues"],
    genes: ["CACNA1A", "SPTBN2"],
    hpo: ["HP:0001251"],
  },
  {
    label: "Developmental delay",
    slug: "developmental-delay",
    image: developmentalDelayImg,
    overview: "Delayed attainment of developmental milestones.",
    symptoms: ["Speech delay", "Cognitive delay"],
    genes: ["MECP2", "STXBP1"],
    hpo: ["HP:0001263"],
  },
  {
    label: "Microcephaly",
    slug: "microcephaly",
    image: microcephalyImg,
    overview: "Reduced head circumference relative to age and sex.",
    symptoms: ["Small head size", "Neurologic impairment"],
    genes: ["ASPM", "WDR62"],
    hpo: ["HP:0000252"],
  },
  {
    label: "Infantile epilepsy",
    slug: "infantile-epilepsy",
    image: infantileEpilepsyImg,
    overview: "Early-onset seizures presenting in infancy.",
    symptoms: ["Spasms", "Seizure clusters"],
    genes: ["KCNQ2", "CDKL5"],
    hpo: ["HP:0001270"],
  },
  {
    label: "Cardiomyopathy",
    slug: "cardiomyopathy",
    image: cardiomyopathyImg,
    overview: "Structural or functional disease of the heart muscle.",
    symptoms: ["Fatigue", "Shortness of breath"],
    genes: ["MYH7", "TNNT2"],
    hpo: ["HP:0001638"],
  },
  {
    label: "Hearing loss",
    slug: "hearing-loss",
    image: hearingLossImg,
    overview: "Partial or complete loss of auditory perception.",
    symptoms: ["Reduced hearing", "Delayed speech"],
    genes: ["GJB2", "SLC26A4"],
    hpo: ["HP:0000365"],
  },
  {
    label: "Vision impairment",
    slug: "vision-impairment",
    image: visionImpairmentImg,
    overview: "Reduced visual acuity or visual field deficits.",
    symptoms: ["Blurred vision", "Night blindness"],
    genes: ["RHO", "USH2A"],
    hpo: ["HP:0000505"],
  },
  {
    label: "Skeletal dysplasia",
    slug: "skeletal-dysplasia",
    image: skeletalDysplasiaImg,
    overview: "Abnormal bone growth leading to disproportion.",
    symptoms: ["Short stature", "Bone deformities"],
    genes: ["FGFR3", "COL2A1"],
    hpo: ["HP:0002652"],
  },
  {
    label: "Craniofacial anomalies",
    slug: "craniofacial-anomalies",
    image: craniofacialImg,
    overview: "Structural differences in skull or facial features.",
    symptoms: ["Facial asymmetry", "Midface hypoplasia"],
    genes: ["FGFR2", "TWIST1"],
    hpo: ["HP:0001999"],
  },
  {
    label: "MRI abnormality",
    slug: "mri-abnormality",
    image: mriAbnormalityImg,
    overview: "Findings on MRI suggesting neurologic changes.",
    symptoms: ["Structural lesions", "White matter changes"],
    genes: ["PLP1", "TUBA1A"],
    hpo: ["HP:0001324"],
  },
];

export const phenotypeImageMap = phenotypeCatalog.reduce((acc, item) => {
  acc[item.label] = item.image;
  return acc;
}, {});

export const getPhenotypeByLabel = (label) =>
  phenotypeCatalog.find((item) => item.label === label);

export const getPhenotypeBySlug = (slug) =>
  phenotypeCatalog.find((item) => item.slug === slug);
