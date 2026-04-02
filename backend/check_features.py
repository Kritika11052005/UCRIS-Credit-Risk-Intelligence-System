import joblib
scaler = joblib.load('../models/hybrid_joint/scaler.pkl')
fnames = joblib.load('../models/hybrid_joint/feature_names.pkl')
with open('features_info.txt', 'w') as f:
    f.write(f"Scaler expects: {getattr(scaler, 'n_features_in_', 'unknown')}\n")
    f.write(f"fnames length: {len(fnames)}\n")
    f.write(f"fnames: {fnames}\n")
