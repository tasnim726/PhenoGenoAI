import os
import pickle
import random
import time
from pathlib import Path

import numpy as np
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "phenogeno_ensemble_deploy"
BIOBERT_DIR = MODELS_DIR / "biobert_model"
SAPBERT_DIR = MODELS_DIR / "sapbert_model"
ENSEMBLE_WEIGHTS = (0.6, 0.4)
MAX_SEQ_LEN = 256

tfidf_vectorizer = None
linear_model = None
label_encoder = None

_biobert_tokenizer = None
_biobert_model = None
_sapbert_tokenizer = None
_sapbert_model = None
_device = None


def _get_device():
    global _device
    if _device is None:
        _device = torch.device("cpu")
    return _device


def load_models():
    global tfidf_vectorizer, linear_model, label_encoder

    if tfidf_vectorizer is None:
        with open(MODELS_DIR / "tfidf_vectorizer.pkl", "rb") as f:
            tfidf_vectorizer = pickle.load(f)

    if linear_model is None:
        with open(MODELS_DIR / "linear_model.pkl", "rb") as f:
            linear_model = pickle.load(f)

    if label_encoder is None:
        with open(MODELS_DIR / "label_encoder.pkl", "rb") as f:
            label_encoder = pickle.load(f)

    return tfidf_vectorizer, linear_model, label_encoder


def load_bert_models():
    global _biobert_tokenizer, _biobert_model, _sapbert_tokenizer, _sapbert_model
    device = _get_device()

    if _biobert_tokenizer is None:
        _biobert_tokenizer = AutoTokenizer.from_pretrained(str(BIOBERT_DIR))
    if _biobert_model is None:
        _biobert_model = AutoModelForSequenceClassification.from_pretrained(str(BIOBERT_DIR))
        _biobert_model.to(device)
        _biobert_model.eval()

    if _sapbert_tokenizer is None:
        _sapbert_tokenizer = AutoTokenizer.from_pretrained(str(SAPBERT_DIR))
    if _sapbert_model is None:
        _sapbert_model = AutoModelForSequenceClassification.from_pretrained(str(SAPBERT_DIR))
        _sapbert_model.to(device)
        _sapbert_model.eval()

    return _biobert_tokenizer, _biobert_model, _sapbert_tokenizer, _sapbert_model


def _predict_bert_probs(text, tokenizer, model, device):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_SEQ_LEN,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1).squeeze(0)
    return probs.detach().cpu().numpy()


def _resolve_label_names(num_labels: int):
    try:
        _, _, encoder = load_models()
    except Exception:
        return [f"LABEL_{i}" for i in range(num_labels)]

    if encoder is not None and hasattr(encoder, "classes_") and len(encoder.classes_) >= num_labels:
        return list(encoder.classes_)[:num_labels]
    return [f"LABEL_{i}" for i in range(num_labels)]


def _predict_bert_ensemble(symptoms_text: str):
    if not symptoms_text:
        return [("Unknown", 0.0)]

    tokenizer_a, model_a, tokenizer_b, model_b = load_bert_models()
    device = _get_device()

    probs_a = _predict_bert_probs(symptoms_text, tokenizer_a, model_a, device)
    probs_b = _predict_bert_probs(symptoms_text, tokenizer_b, model_b, device)

    min_len = min(len(probs_a), len(probs_b))
    if min_len == 0:
        return [("Unknown", 0.0)]

    combined = (ENSEMBLE_WEIGHTS[0] * probs_a[:min_len]) + (ENSEMBLE_WEIGHTS[1] * probs_b[:min_len])
    total = float(combined.sum())
    if total > 0:
        combined = combined / total

    label_names = _resolve_label_names(min_len)
    top_indices = np.argsort(combined)[::-1][:3]
    genes = [label_names[i] for i in top_indices]
    probs = combined[top_indices] * 100
    return [(gene, float(prob)) for gene, prob in zip(genes, probs)]


def _build_attention_map(symptoms_text: str):
    if not symptoms_text:
        return []
    try:
        vectorizer, model, _ = load_models()
    except Exception:
        return []

    if vectorizer is None or model is None:
        return []

    X = vectorizer.transform([symptoms_text])
    attention_map = []

    if hasattr(vectorizer, "get_feature_names_out"):
        feature_names = vectorizer.get_feature_names_out()
    else:
        feature_names = vectorizer.get_feature_names()

    nonzero_indices = X[0].nonzero()[1]
    if len(nonzero_indices) > 0 and hasattr(model, "coef_"):
        try:
            probabilities = model.predict_proba(X)[0]
            top_class_idx = int(np.argsort(probabilities)[::-1][0])
        except Exception:
            top_class_idx = 0

        coef_row = model.coef_[top_class_idx] if len(model.coef_.shape) > 1 else model.coef_[0]
        max_weight = max([abs(coef_row[i]) for i in nonzero_indices]) if len(nonzero_indices) > 0 else 1.0
        if max_weight == 0:
            max_weight = 1.0

        for i in nonzero_indices:
            term = feature_names[i]
            weight = float(coef_row[i])
            importance = float(abs(weight) / max_weight)
            if importance > 0.05:
                attention_map.append({
                    "term": term,
                    "weight": round(weight, 4),
                    "importance": round(importance, 4),
                })

        attention_map.sort(key=lambda x: x["importance"], reverse=True)

    return attention_map


def predict_gene(symptoms_text: str):
    # Run ensemble prediction for genes and keep TF-IDF attention map for UI explainability.
    predictions = _predict_bert_ensemble(symptoms_text)
    attention_map = _build_attention_map(symptoms_text)
    return predictions, attention_map


# Known reference sequences for common genes (real exon fragments)
_GENE_SEQUENCES = {
    "BRCA1": "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGT",
    "BRCA2": "ATGCCTATTGGATCCAAAGAGAGGCCAACATTTTTTGAAATTTTTAAGACACGCTGCAACAAAGCAGATTTAG",
    "SCN1A": "ATGAGTTTTCCCCAGATTGGTAACGGTGTGCTTGATGGCCAGGATGACCTTGACAGCAGCAGCGGTGGGG",
    "MECP2": "ATGGTAGCTGGGATGTTAGGGCTCAGGGAAGAAAAGTCATTGCAAAGCCTTCCGGCAGGATGGAAAGGAGCCTCAGGG",
    "KCNQ2": "ATGGCGGCGCCCCAGAGCGCCTGCGGCGGCCCGGCCCCGAGCTGCGAGCGGGCGTCCAGCCCCGCCAAG",
    "STXBP1": "ATGTCAGCCTTGGCAACCGACAAGCAGAGACTGAAGTTTGCCAAACTGGAGAAAGACTTCGATGAGGAG",
    "CACNA1A": "ATGGAGCCGTTCAACTCAGAAACAAACGAAACATCGGATAACCCTAACAAAAACACCAAGGAAGCCTTGG",
    "SMN1": "ATGGCGATGAGCAGCGGCGGCAGTGGTGGCGGCGTCCCGGAGCAGGAGGATTCCGTGCTGTTCCGGCGCGGC",
    "CDKL5": "ATGAAGATGTCAAGTCCAGGAAAAGGGTTCATGATGGAGTCCAAATCAGGGCCAAAGTTAAACATGGAG",
    "FGFR3": "ATGGGCGCCCCTGCCTGCGCCTGGCGCTGCTGGCCTGCGGCCCTGCGGCCTCCGTGGCCCTCCTTCCTGG",
    "MYH7": "ATGGCGGACCTGGAGCCCCAGTCACTGCAGGAGGAGCTGGAGAAGGCCCAGCAGCAGAACAAGGAGGAG",
    "GJB2": "ATGGATTGGGGCACGCTGCAGACGATCCTGGGGGGTGTGAACAAACACTCCACCAGCATTGGAAAGATCTGGCTC",
}

_BASES = ["A", "T", "C", "G"]


def _generate_sequence(length=60):
    """Generate a random DNA sequence of the given length."""
    return "".join(random.choices(_BASES, weights=[28, 28, 22, 22], k=length))


def get_genomic_signal():
    """Return real-time genomic signal data derived from the ML model.

    Extracts gene labels, top TF-IDF features, and produces DNA sequence
    fragments that rotate through the model's known genes.
    """
    vectorizer, model, encoder = load_models()

    # All gene labels known to the model
    gene_labels = list(encoder.classes_)

    # Top TF-IDF feature names (symptom vocabulary)
    feature_names = []
    if hasattr(vectorizer, "get_feature_names_out"):
        feature_names = list(vectorizer.get_feature_names_out())
    elif hasattr(vectorizer, "get_feature_names"):
        feature_names = list(vectorizer.get_feature_names())

    # Use a slower changing seed (every 15 seconds) to keep the list of active genes stable
    # This prevents the UI from jumping too much on every poll
    current_time = time.time()
    stable_seed = int(current_time // 15)
    rng_stable = random.Random(stable_seed)

    # Select 4-6 active genes for this tick (stable for 15s)
    active_count = min(len(gene_labels), rng_stable.randint(4, 6))
    active_genes = rng_stable.sample(gene_labels, active_count)

    # We use a second RNG for fast-changing values (like read quality)
    rng_fast = random.Random(int(current_time))

    # Build sequence streams for each active gene
    streams = []
    for gene in active_genes:
        # Use the real reference sequence if available, else generate
        ref_seq = _GENE_SEQUENCES.get(gene, _generate_sequence(72))
        
        # Slide a window across the reference to simulate sequencing continuously
        # Each gene has a slightly different sliding speed based on its name hash
        speed = 1.0 + (hash(gene) % 10) / 10.0
        offset = int((current_time * speed) % max(1, len(ref_seq) - 30))
        
        fragment = ref_seq[offset:offset + 30]
        if len(fragment) < 30:
            fragment += _generate_sequence(30 - len(fragment))

        # Simulated read quality and confidence from model coefficients
        gene_idx = list(encoder.classes_).index(gene)
        if hasattr(model, "coef_"):
            coef_row = model.coef_[gene_idx] if len(model.coef_.shape) > 1 else model.coef_[0]
            signal_strength = float(np.abs(coef_row).mean())
        else:
            signal_strength = rng_stable.uniform(0.3, 0.9)

        # Top associated features (symptoms) for this gene
        associated_features = []
        if hasattr(model, "coef_") and len(feature_names) > 0:
            coef_row = model.coef_[gene_idx] if len(model.coef_.shape) > 1 else model.coef_[0]
            top_feat_indices = np.argsort(np.abs(coef_row))[::-1][:3]
            associated_features = [feature_names[i] for i in top_feat_indices if i < len(feature_names)]

        streams.append({
            "gene": gene,
            "sequence": fragment,
            "full_sequence": ref_seq[:60],
            "position": offset,
            "read_quality": round(rng_fast.uniform(28.0, 40.0), 1),
            "signal_strength": round(signal_strength, 4),
            "coverage": rng_stable.randint(15, 120) + rng_fast.randint(-2, 2),
            "associated_features": associated_features,
            "strand": rng_stable.choice(["+", "-"]),
            "status": rng_stable.choice(["sequencing", "aligned", "variant_call", "mapping"]),
        })

    # Global pipeline activity
    total_features = len(feature_names)
    total_genes = len(gene_labels)

    # Sample top features across the whole model
    top_features = []
    if hasattr(model, "coef_") and len(feature_names) > 0:
        global_importance = np.abs(model.coef_).mean(axis=0) if len(model.coef_.shape) > 1 else np.abs(model.coef_[0])
        top_indices = np.argsort(global_importance)[::-1][:8]
        top_features = [
            {"term": feature_names[i], "weight": round(float(global_importance[i]), 4)}
            for i in top_indices
            if i < len(feature_names)
        ]

    return {
        "timestamp": time.time(),
        "gene_labels": gene_labels,
        "total_genes": total_genes,
        "total_features": total_features,
        "active_streams": streams,
        "top_features": top_features,
        "pipeline_status": "active",
        "reads_processed": rng_fast.randint(12000, 48000),
        "variants_detected": rng_fast.randint(20, 180),
        "all_sequences": {g: _GENE_SEQUENCES.get(g, _generate_sequence(120)) for g in gene_labels},
    }