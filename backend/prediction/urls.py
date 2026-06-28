from django.urls import path

from .views import analyses, analyses_import, export_pdf, health, predict, model_info, genomic_signal
from .ml_models import load_models

urlpatterns = [
    path("predict/", predict, name="predict"),
    path("export/", export_pdf, name="export_pdf"),
    path("health/", health, name="health"),
    path("model/", model_info, name="model_info"),
    path("analyses/", analyses, name="analyses"),
    path("analyses/import/", analyses_import, name="analyses_import"),
    path("genomic-signal/", genomic_signal, name="genomic_signal"),
]

load_models()
