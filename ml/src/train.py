"""
Model training for Nadi pulse pattern classification.
"""

import argparse
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

from src.preprocessing import preprocess
from src.feature_extraction import extract_all_features

PULSE_PATTERNS = ["vata", "pitta", "kapha", "sama"]


def load_training_data(data_dir):
    features_list = []
    labels = []
    data_path = os.path.join(data_dir, "training_data.csv")
    if os.path.isfile(data_path):
        df = pd.read_csv(data_path)
        for label in df["label"].unique():
            sub = df[df["label"] == label].copy().reset_index(drop=True)
            sample_ids = []
            current_id = 0
            prev_idx = -1
            for idx in sub["sample_index"].values:
                if idx <= prev_idx:
                    current_id += 1
                sample_ids.append(current_id)
                prev_idx = idx
            sub["sample_id"] = sample_ids
            for _, group in sub.groupby("sample_id"):
                signal = group.sort_values("sample_index")["value"].values
                if len(signal) < 100:
                    continue
                processed = preprocess(signal)
                feat = extract_all_features(processed)
                features_list.append(feat)
                labels.append(label)
    else:
        for pattern in PULSE_PATTERNS:
            pattern_dir = os.path.join(data_dir, pattern)
            if not os.path.isdir(pattern_dir):
                continue
            for fname in sorted(os.listdir(pattern_dir)):
                if not fname.endswith(".csv"):
                    continue
                filepath = os.path.join(pattern_dir, fname)
                dframe = pd.read_csv(filepath)
                signal = dframe["value"].values if "value" in dframe.columns else dframe.iloc[:, 0].values
                processed = preprocess(signal)
                feat = extract_all_features(processed)
                features_list.append(feat)
                labels.append(pattern)
    return features_list, labels


def train_model(features_list, labels):
    if not features_list:
        raise ValueError("No training data found.")
    df = pd.DataFrame(features_list)
    X = df.values
    y = np.array(labels)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    model = RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42, class_weight="balanced"
    )
    model.fit(X_train, y_train)
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    cv_scores = cross_val_score(
        model, X_scaled, y, cv=min(5, len(set(y))), scoring="accuracy"
    )
    y_pred = model.predict(X_test)
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    return {
        "model": model,
        "scaler": scaler,
        "feature_names": list(df.columns),
        "metrics": {
            "train_accuracy": train_score,
            "test_accuracy": test_score,
            "cv_mean": float(np.mean(cv_scores)),
            "cv_std": float(np.std(cv_scores)),
            "classification_report": report,
        },
    }


def save_model(result, output_path):
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    artifact = {
        "model": result["model"],
        "scaler": result["scaler"],
        "feature_names": result["feature_names"],
        "metrics": result["metrics"],
        "pulse_patterns": PULSE_PATTERNS,
    }
    joblib.dump(artifact, output_path)
    print(f"Model saved to {output_path}")
    print(f"  Train accuracy: {result['metrics']['train_accuracy']:.3f}")
    print(f"  Test accuracy:  {result['metrics']['test_accuracy']:.3f}")
    print(f"  CV mean:        {result['metrics']['cv_mean']:.3f} +/- {result['metrics']['cv_std']:.3f}")


def main():
    parser = argparse.ArgumentParser(description="Train Nadi pulse classifier")
    parser.add_argument("--data", default="data", help="Directory with training data")
    parser.add_argument("--output", default="models/nadi_model.pkl", help="Output model path")
    args = parser.parse_args()
    print("Loading training data...")
    features_list, labels = load_training_data(args.data)
    print(f"  Loaded {len(features_list)} samples")
    print(f"  Label distribution: {dict(pd.Series(labels).value_counts())}")
    if not features_list:
        print("No training data found.")
        return
    print("Training model...")
    result = train_model(features_list, labels)
    save_model(result, args.output)


if __name__ == "__main__":
    main()
