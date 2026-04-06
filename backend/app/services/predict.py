import httpx
import os
import json
from app.core.config import settings

# ── HF API Configuration ──────────────────────────────────────────────────────
# The URL is read from the environment variables (set in .env)
HF_API_URL = os.getenv("HF_MODEL_URL")
HF_TOKEN = os.getenv("HF_TOKEN")

def run_prediction(customer_data: dict) -> dict:
    """
    Calls the Hugging Face Model Server to get predictions.
    This offloads heavy ML processing (PyTorch, XGBoost) to Hugging Face.
    """
    
    if not HF_API_URL:
        return {
            "error": "HF_MODEL_URL not configured. AI inference unavailable.",
            "stress_label": "Unknown",
            "recommended_action": "Contact Admin"
        }

    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"

    payload = {"customer_data": customer_data}

    try:
        # Step 1: Call the Hugging Face Space
        with httpx.Client(timeout=30.0) as client:
            response = client.post(HF_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()

        # Step 2: Add local metadata that the UI expects
        # We add the transformed features back for the UI display
        result["features"] = customer_data
        
        # Step 3: SHAP Placeholders 
        # (SHAP is heavy and calculated on HF; we return basic factors for the UI)
        if "shap_factors" not in result:
            result["shap_factors"] = [
                {"feature": "LIMIT_BAL", "value": customer_data.get("limit_bal", 0), "shap_value": 0.0},
                {"feature": "AGE", "value": customer_data.get("age", 0), "shap_value": 0.0},
            ]

        return result

    except Exception as e:
        print(f"[ERROR] Hugging Face Inference Failed: {e}")
        return {
            "error": str(e),
            "stress_label": "Offline",
            "recommended_action": "Retry later",
            "status": "error"
        }

# For backward compatibility with any other modules calling load_models
def load_models():
    """No models to load locally - inference is offloaded to Hugging Face."""
    pass