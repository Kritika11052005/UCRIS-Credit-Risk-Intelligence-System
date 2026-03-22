from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


# ── DB Row Model ──────────────────────────────────────────────────────────────

class PredictionDB(BaseModel):
    id:                 str
    customer_id:        str
    requested_by:       str
    stress_level:       int
    stress_label:       str
    stress_prob_low:    float
    stress_prob_med:    float
    stress_prob_high:   float
    escalation_flag:    int
    escalation_prob:    float
    recommended_action: str
    confidence:         str
    shap_factors:       list
    gemini_narrative:   Optional[str]
    model_version:      str
    predicted_at:       datetime

    class Config:
        from_attributes = True


# ── Sub-models ────────────────────────────────────────────────────────────────

class SHAPFactor(BaseModel):
    feature:    str
    value:      float
    shap_value: float


class StressDistribution(BaseModel):
    prob_low:  float
    prob_med:  float
    prob_high: float


# ── Request ───────────────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    customer_id: str

    @field_validator("customer_id")
    @classmethod
    def customer_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Customer ID cannot be empty")
        return v.strip()


# ── Response ──────────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    id:                 str
    customer_id:        str
    requested_by:       str
    stress_level:       int
    stress_label:       str
    stress_distribution: StressDistribution
    escalation_flag:    int
    escalation_prob:    float
    recommended_action: str
    confidence:         str
    shap_factors:       list[SHAPFactor]
    gemini_narrative:   Optional[str] = None
    model_version:      str
    predicted_at:       datetime

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_predictions:    int
    stress_distribution:  dict
    escalation:           dict
    recommendations:      dict


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:     str
    customer_id: Optional[str] = None

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message cannot be empty")
        if len(v) > 1000:
            raise ValueError("Message too long — max 1000 characters")
        return v.strip()


class ChatResponse(BaseModel):
    answer:  str
    sources: Optional[list] = None