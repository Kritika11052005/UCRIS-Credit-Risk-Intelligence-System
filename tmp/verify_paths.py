import os
import sys

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname("c:/Users/HP/Downloads/Unified Cutomer risk prediction System/backend/app/services/predict.py"), "..", "..", ".."))
MODELS_DIR = os.path.join(_PROJECT_ROOT, "backend", "models")

print(f"Project Root: {_PROJECT_ROOT}")
print(f"Models Dir: {MODELS_DIR}")

RF_PATH = os.path.join(MODELS_DIR, "random_forest", "model.pkl")
print(f"RF Path: {RF_PATH}")
print(f"Exists: {os.path.exists(RF_PATH)}")
