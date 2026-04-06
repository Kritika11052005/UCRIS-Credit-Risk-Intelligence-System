import os
import joblib
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- Model Architecture ---
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

    def forward(self, x):
        shared = self.shared_encoder(x)
        stress_logits = self.stress_head(shared)
        esc_logits = self.escalation_head(shared).squeeze(1)
        return stress_logits, esc_logits

# CRITICAL FIX: Patch __main__ for torch.load
import __main__
__main__.UCRISHybridJointModel = UCRISHybridJointModel

# --- Feature Engineering Logic ---
BILL_COLS = ['BILL_AMT1','BILL_AMT2','BILL_AMT3','BILL_AMT4','BILL_AMT5','BILL_AMT6']
PAY_COLS = ['PAY_0','PAY_2','PAY_3','PAY_4','PAY_5','PAY_6']
PAY_AMT_COLS = ['PAY_AMT1','PAY_AMT2','PAY_AMT3','PAY_AMT4','PAY_AMT5','PAY_AMT6']

def engineer_features(data: dict, feature_names: List[str]) -> pd.DataFrame:
    # Ensure PAY_1 is mapped to PAY_0 (UCI consistency)
    if "pay_1" in data:
        data["pay_0"] = data.pop("pay_1")
    
    raw_df = pd.DataFrame([data])
    
    # Simple normalization for column names
    col_map = {
        "limit_bal": "LIMIT_BAL", "sex": "SEX", "education": "EDUCATION", 
        "marriage": "MARRIAGE", "age": "AGE"
    }
    for i in range(1, 7):
        col_map[f"pay_{i}"] = f"PAY_{i}" if i != 1 else "PAY_0"
        col_map[f"bill_amt{i}"] = f"BILL_AMT{i}"
        col_map[f"pay_amt{i}"] = f"PAY_AMT{i}"
    
    df = raw_df.rename(columns=col_map)
    x_range = np.arange(6)

    # Utilization
    for i, col in enumerate(BILL_COLS, 1):
        df[f'UTIL_{i}'] = (df[col] / df['LIMIT_BAL'].replace(0, np.nan)).clip(0, 1).fillna(0)
    
    util_cols = [f'UTIL_{i}' for i in range(1, 7)]
    df['avg_utilization'] = df[util_cols].mean(axis=1)
    df['util_recent'] = df[['UTIL_1', 'UTIL_2']].mean(axis=1)
    df['util_early'] = df[['UTIL_5', 'UTIL_6']].mean(axis=1)
    df['util_change'] = df['util_recent'] - df['util_early']

    # Payment Delays
    pay_matrix = df[PAY_COLS].values.astype(float)
    df['pay_delay_trend'] = np.array([np.polyfit(x_range, row, 1)[0] for row in pay_matrix])
    df['avg_pay_delay'] = df[PAY_COLS].mean(axis=1)
    df['consecutive_delays'] = df[PAY_COLS].gt(0).sum(axis=1)

    # Repayment
    for i, (p, b) in enumerate(zip(PAY_AMT_COLS, BILL_COLS), 1):
        df[f'REPAY_RATIO_{i}'] = np.where(df[b] > 0, (df[p] / df[b]).clip(0, 1), 1.0)
    
    repay_cols = [f'REPAY_RATIO_{i}' for i in range(1, 7)]
    df['avg_repay_ratio'] = df[repay_cols].mean(axis=1)

    # Volatility
    df['spending_volatility'] = np.log1p(df[BILL_COLS].std(axis=1))

    # Pay Amount Trend
    pay_amt_matrix = df[PAY_AMT_COLS].values.astype(float)
    slopes = np.array([np.polyfit(x_range, row, 1)[0] for row in pay_amt_matrix])
    df['pay_amt_trend'] = np.sign(slopes) * np.log1p(np.abs(slopes))

    # Categorical handling
    base_features = [f for f in feature_names if not f.startswith("RF_prob_") and not f.startswith("XGB_")]
    for col in base_features:
        if col not in df:
            prefix = col.split("_")[0]
            if prefix in ['SEX', 'EDUCATION', 'MARRIAGE']:
                val = int(col.split("_")[1])
                df[col] = (df.get(prefix, np.nan) == val).astype(int)
            else:
                df[col] = 0
                
    return df[base_features]

# --- FastAPI App ---
app = FastAPI(title="UCRIS Model Server")

# Global model state
rf_model = None
xgb_model = None
hybrid_model = None
scaler = None
feature_names = None

@app.on_event("startup")
def load_models():
    global rf_model, xgb_model, hybrid_model, scaler, feature_names
    
    print("Loading models from ./models...")
    try:
        rf_model = joblib.load("models/random_forest/model.pkl")
        xgb_model = joblib.load("models/xgboost/model.pkl")
        scaler = joblib.load("models/hybrid_joint/scaler.pkl")
        feature_names = joblib.load("models/hybrid_joint/feature_names.pkl")
        
        # Load Hybrid (PyTorch)
        hybrid_model = torch.load("models/hybrid_joint/model_full.pt", map_location="cpu", weights_only=False)
        hybrid_model.eval()
        print("All models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

class PredictionRequest(BaseModel):
    customer_data: Dict[str, Any]

@app.get("/")
def home():
    return {"status": "UCRIS Model Server is running"}

@app.post("/predict")
async def predict(request: PredictionRequest):
    if any(m is None for m in [rf_model, xgb_model, hybrid_model, scaler, feature_names]):
        raise HTTPException(status_code=500, detail="Models not loaded")

    try:
        # 1. Feature Engineering
        df = engineer_features(request.customer_data, feature_names)
        X = df.values
        X_scaled = scaler.transform(X)

        # 2. Base Model Probs
        rf_probs = rf_model.predict_proba(X_scaled)
        xgb_prob = xgb_model.predict_proba(X_scaled)[:, 1].reshape(-1, 1)

        # 3. Hybrid Inference
        X_hybrid = np.hstack([X_scaled, rf_probs, xgb_prob])
        X_tensor = torch.tensor(X_hybrid, dtype=torch.float32)
        
        with torch.no_grad():
            stress_logits, esc_logit = hybrid_model(X_tensor)
            stress_probs = torch.softmax(stress_logits, dim=1).numpy()[0]
            esc_prob = torch.sigmoid(esc_logit).numpy()[0]

        stress_level = int(np.argmax(stress_probs))
        stress_label = {0: "Low", 1: "Medium", 2: "High"}[stress_level]
        esc_flag = int(esc_prob >= 0.5)

        # 4. SHAP (Basic implementation for now to keep it fast)
        # In a real scenario, you'd use shap.TreeExplainer here. 
        # But for this server, we'll return the results.
        
        return {
            "stress_level": stress_level,
            "stress_label": stress_label,
            "stress_prob_low": float(stress_probs[0]),
            "stress_prob_med": float(stress_probs[1]),
            "stress_prob_high": float(stress_probs[2]),
            "escalation_flag": esc_flag,
            "escalation_prob": float(esc_prob),
            "recommended_action": "Restructure" if (stress_label == "High" or esc_flag) else "Monitor",
            "confidence": "High" if max(stress_probs) > 0.8 else "Medium",
            "model_version": "hybrid_joint_v1.0_hf"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
