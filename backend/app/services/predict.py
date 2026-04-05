import numpy as np
import pandas as pd
import joblib
import os
import sys
import gc
from app.core.config import settings

# ── Model Architecture ────────────────────────────────────────────────────────
# This must match the architecture used during training in the notebook.
# We define it here but it's only instantiated during lazy loading.
def get_hybrid_model_class():
    import torch.nn as nn
    class UCRISHybridJointModel(nn.Module):
        def __init__(self, n_features=19, encoder_dims=[64, 32], head_dim=16, dropout_rate=0.2):
            super(UCRISHybridJointModel, self).__init__()
            encoder_layers = []
            in_dim = n_features
            for out_dim in encoder_dims:
                encoder_layers.extend([
                    nn.Linear(in_dim, out_dim),
                    nn.BatchNorm1d(out_dim),
                    nn.ReLU(),
                    nn.Dropout(dropout_rate)
                ])
                in_dim = out_dim
            self.shared_encoder = nn.Sequential(*encoder_layers)
            self.stress_head = nn.Sequential(
                nn.Linear(encoder_dims[-1], head_dim),
                nn.ReLU(),
                nn.Dropout(dropout_rate / 2),
                nn.Linear(head_dim, 3)
            )
            self.escalation_head = nn.Sequential(
                nn.Linear(encoder_dims[-1], head_dim),
                nn.ReLU(),
                nn.Dropout(dropout_rate / 2),
                nn.Linear(head_dim, 1)
            )
            for m in self.modules():
                if isinstance(m, nn.Linear):
                    nn.init.xavier_uniform_(m.weight)
                    nn.init.zeros_(m.bias)

        def forward(self, x):
            shared = self.shared_encoder(x)
            stress_logits = self.stress_head(shared)
            esc_logits = self.escalation_head(shared).squeeze(1)
            return stress_logits, esc_logits
    return UCRISHybridJointModel

# ── Model paths ───────────────────────────────────────────────────────────────
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODELS_DIR = os.path.join(_PROJECT_ROOT, "backend", "models")

RF_PATH      = os.path.join(MODELS_DIR, "random_forest", "model.pkl")
XGB_PATH     = os.path.join(MODELS_DIR, "xgboost", "model.pkl")
HYBRID_PATH  = os.path.join(MODELS_DIR, "hybrid_joint", "model_full.pt")
SCALER_PATH  = os.path.join(MODELS_DIR, "hybrid_joint", "scaler.pkl")
FEATURES_PATH = os.path.join(MODELS_DIR, "hybrid_joint", "feature_names.pkl")

# ── Model state ───────────────────────────────────────────────────────────────
rf_model      = None
xgb_model     = None
scaler        = None
feature_names = None
hybrid_model  = None

def load_models():
    """Load lightweight models during startup (called by lifespan)."""
    global rf_model, scaler, feature_names
    
    if rf_model is not None:
        return
        
    print("[INFO] Loading basic models (RF, Scaler)...")
    try:
        rf_model      = joblib.load(RF_PATH)
        scaler        = joblib.load(SCALER_PATH)
        feature_names = joblib.load(FEATURES_PATH)
        print("[OK] Basic models loaded.")
        gc.collect()
    except Exception as e:
        print(f"[ERROR] Failed to load startup models: {e}")
        raise e

def _lazy_load_heavy_models():
    """Load heavy models (XGBoost, PyTorch) on demand to save memory."""
    global xgb_model, hybrid_model
    
    if xgb_model is not None and hybrid_model is not None:
        return

    print("[INFO] Lazy loading heavy models (XGBoost, PyTorch)...")
    import torch
    import __main__
    
    # Patch __main__ for torch.load()
    __main__.UCRISHybridJointModel = get_hybrid_model_class()
    
    try:
        xgb_model     = joblib.load(XGB_PATH)
        hybrid_model  = torch.load(HYBRID_PATH, map_location="cpu", weights_only=False)
        hybrid_model.eval()
        print("[OK] Heavy models loaded successfully.")
        gc.collect()
    except Exception as e:
        print(f"[ERROR] Failed to lazy load heavy models: {e}")
        raise e

STRESS_LABELS = {0: "Low", 1: "Medium", 2: "High"}
ACTION_MAP = {
    ("High",   True):  "Restructure",
    ("Low",    False): "Monitor",
}


# ── Feature engineering ───────────────────────────────────────────────────────
# We use the official project source for feature engineering to ensure 
# consistency with the training pipeline.
sys.path.append(_PROJECT_ROOT)
from src.feature_engineering import engineer_features as src_engineer_features

def engineer_features(data: dict) -> pd.DataFrame:
    """Transform raw API dictionary to model-ready DataFrame using src.feature_engineering."""
    
    if "pay_1" in data:
        data["pay_0"] = data.pop("pay_1")
        
    # src.engineer_features expects a DataFrame
    raw_df = pd.DataFrame([data])
    
    # Standardize column naming for src.feature_engineering (it expects caps)
    # Mapping based on typical UCI dataset names vs backend naming
    col_map = {
        "limit_bal": "LIMIT_BAL",
        "sex": "SEX",
        "education": "EDUCATION",
        "marriage": "MARRIAGE",
        "age": "AGE"
    }
    
    if "avg_utilization" in data:
        processed_df = raw_df.rename(columns=col_map)
    else:
        for i in range(1, 7):
            col_map[f"pay_{i}"] = f"PAY_{i}" if i != 1 else "PAY_0" # UCI uses PAY_0
            col_map[f"bill_amt{i}"] = f"BILL_AMT{i}"
            col_map[f"pay_amt{i}"] = f"PAY_AMT{i}"
        
        raw_df = raw_df.rename(columns=col_map)
        processed_df = src_engineer_features(raw_df)
    
    # Predict manually handles categorical encoding for single row
    # because pd.get_dummies() fails on single rows when using drop_first
    base_features = [f for f in feature_names if not f.startswith("RF_prob_") and not f.startswith("XGB_")]
    
    for col in base_features:
        if col not in processed_df:
            if col.startswith("SEX_"):
                val = int(col.split("_")[1])
                processed_df[col] = (processed_df.get("SEX", np.nan) == val).astype(int)
            elif col.startswith("EDUCATION_"):
                val = int(col.split("_")[1])
                processed_df[col] = (processed_df.get("EDUCATION", np.nan) == val).astype(int)
            elif col.startswith("MARRIAGE_"):
                val = int(col.split("_")[1])
                processed_df[col] = (processed_df.get("MARRIAGE", np.nan) == val).astype(int)
            else:
                processed_df[col] = 0
                
    return processed_df[base_features]

# ── Prediction pipeline ───────────────────────────────────────────────────────

def run_prediction(customer_data: dict) -> dict:
    """Full UCRIS prediction pipeline with lazy loading."""
    
    # Lazy load heavy models and libraries only when needed
    _lazy_load_heavy_models()
    import torch
    import shap

    # Step 1: Feature engineering
    df = engineer_features(customer_data)
    X  = df.values

    # Step 2: Scale
    X_scaled = scaler.transform(X)

    # Step 3: RF stress probabilities
    rf_probs = rf_model.predict_proba(X_scaled)

    # Step 4: XGB escalation probability
    xgb_prob = xgb_model.predict_proba(X_scaled)[:, 1].reshape(-1, 1)

    # Step 5: Hybrid input
    X_hybrid = np.hstack([X_scaled, rf_probs, xgb_prob])
    X_tensor = torch.tensor(X_hybrid, dtype=torch.float32)

    # Step 6: Hybrid model inference
    with torch.no_grad():
        stress_logits, esc_logit = hybrid_model(X_tensor)
        stress_probs = torch.softmax(stress_logits, dim=1).numpy()[0]
        esc_prob     = torch.sigmoid(esc_logit).numpy()[0]

    stress_level = int(np.argmax(stress_probs))
    stress_label = STRESS_LABELS[stress_level]
    esc_flag     = int(esc_prob >= 0.5)

    # Step 7: Recommendation
    key = (stress_label, bool(esc_flag))
    recommended_action = ACTION_MAP.get(key, "Alert")

    # Step 8: SHAP explanation (top 5 features)
    try:
        # TreeExplainer is faster and optimized for tree models like RF
        explainer_tree = shap.TreeExplainer(rf_model)
        shap_vals_all = explainer_tree.shap_values(X_scaled)
        
        # shap_values from TreeExplainer for multi-class yields a list of 3 (n_rows, n_feats) arrays
        # or a 3D array (n_rows, n_feats, n_classes). Normalizing to handle both.
        if isinstance(shap_vals_all, list):
            # For Low/Med/High class, index by stress_level (e.g. 0, 1, 2)
            shap_row = shap_vals_all[stress_level][0]
        else:
            # 3D array: (row, feat, class)
            shap_row = shap_vals_all[0, :, stress_level]

        top_indices = np.argsort(np.abs(shap_row))[-5:][::-1]
        shap_factors = [
            {
                "feature":    feature_names[i],
                "value":      float(X[0, i]),
                "shap_value": float(shap_row[i]),
            }
            for i in top_indices
        ]
        # Clean up SHAP memory if possible
        del explainer_tree
    except Exception as e:
        print(f"[WARN] SHAP calculation failed: {e}")
        # Return empty list or basic top features if SHAP crashes
        shap_factors = [
            {"feature": feature_names[i], "value": float(X[0, i]), "shap_value": 0.0}
            for i in range(5) if i < len(feature_names)
        ]

    # Step 9: Confidence
    max_prob = float(max(stress_probs))
    confidence = "High" if max_prob > 0.85 else "Medium" if max_prob > 0.65 else "Low"

    return {
        "stress_level":       stress_level,
        "stress_label":       stress_label,
        "stress_prob_low":    float(stress_probs[0]),
        "stress_prob_med":    float(stress_probs[1]),
        "stress_prob_high":   float(stress_probs[2]),
        "escalation_flag":    esc_flag,
        "escalation_prob":    float(esc_prob),
        "recommended_action": recommended_action,
        "confidence":         confidence,
        "shap_factors":       shap_factors,
        "model_version":      "hybrid_joint_v1.0",
        "features":           df.iloc[0].to_dict(),
    }