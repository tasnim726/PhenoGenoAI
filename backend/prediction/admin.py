from django.contrib import admin

from .models import PredictionRequest


@admin.register(PredictionRequest)
class PredictionRequestAdmin(admin.ModelAdmin):
    list_display = ("created_at", "clinical_text", "hpo_terms")
