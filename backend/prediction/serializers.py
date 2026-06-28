from rest_framework import serializers


class PredictRequestSerializer(serializers.Serializer):
    symptoms_text = serializers.CharField(required=False, allow_blank=True)
    hpo_terms = serializers.CharField(required=False, allow_blank=True)
    genotype_text = serializers.CharField(required=False, allow_blank=True)
    mode = serializers.CharField(required=False, allow_blank=True)

    def to_internal_value(self, data):
        data = dict(data)
        # Accept legacy keys from the frontend.
        if "clinicalText" in data and "symptoms_text" not in data:
            data["symptoms_text"] = data.get("clinicalText")
        if "hpoTerms" in data and "hpo_terms" not in data:
            data["hpo_terms"] = data.get("hpoTerms")
        if "genotypeText" in data and "genotype_text" not in data:
            data["genotype_text"] = data.get("genotypeText")
        return super().to_internal_value(data)

    def validate(self, attrs):
        symptoms_text = (attrs.get("symptoms_text") or "").strip()
        hpo_terms = (attrs.get("hpo_terms") or "").strip()
        genotype_text = (attrs.get("genotype_text") or "").strip()
        if not symptoms_text and not hpo_terms and not genotype_text:
            raise serializers.ValidationError(
                "Provide symptoms_text, hpo_terms, or genotype_text."
            )
        return attrs


class AnalysisEntrySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    case_id = serializers.CharField()
    sex = serializers.CharField(required=False, allow_blank=True)
    age = serializers.CharField(required=False, allow_blank=True)
    symptoms = serializers.CharField(required=False, allow_blank=True)
    genes = serializers.ListField(child=serializers.CharField(), required=False)
    phenotypes = serializers.ListField(child=serializers.CharField(), required=False)
    genotypes = serializers.ListField(child=serializers.CharField(), required=False)
    phenotype_images = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    phenotype_timeline = serializers.ListField(
        child=serializers.DictField(), required=False
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    quality_status = serializers.CharField(required=False, allow_blank=True)
    quality_notes = serializers.ListField(child=serializers.CharField(), required=False)
    coherence_score = serializers.IntegerField(required=False)
    coherence_factors = serializers.ListField(
        child=serializers.CharField(), required=False
    )
