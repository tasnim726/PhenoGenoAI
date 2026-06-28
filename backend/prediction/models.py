from django.db import models


class PredictionRequest(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    clinical_text = models.TextField(blank=True)
    hpo_terms = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"PredictionRequest({self.created_at:%Y-%m-%d %H:%M})"


class AnalysisEntry(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    case_id = models.CharField(max_length=64)
    sex = models.CharField(max_length=32, blank=True)
    age = models.CharField(max_length=32, blank=True)
    symptoms = models.TextField(blank=True)
    genes = models.JSONField(default=list, blank=True)
    phenotypes = models.JSONField(default=list, blank=True)
    genotypes = models.JSONField(default=list, blank=True)
    phenotype_images = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    phenotype_timeline = models.JSONField(default=list, blank=True)
    quality_status = models.CharField(max_length=32, blank=True)
    quality_notes = models.JSONField(default=list, blank=True)
    coherence_score = models.IntegerField(default=0)
    coherence_factors = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"AnalysisEntry({self.case_id})"
