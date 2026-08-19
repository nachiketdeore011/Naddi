"""
Model inference for pulse pattern classification.
"""

import os

import numpy as np
import joblib

from src.preprocessing import preprocess
from src.feature_extraction import extract_all_features

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "models", "nadi_model.pkl"
)


class PulseAnalyzer:
    """Analyzes pulse signals using a trained ML model."""

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self.artifact = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.artifact = joblib.load(self.model_path)
        else:
            self.artifact = None

    def analyze(self, samples: list[float], sample_rate: int = 100) -> dict:
        signal = np.array(samples, dtype=np.float64)
        processed = preprocess(signal, sample_rate)
        features = extract_all_features(processed, sample_rate)

        result = {
            "heart_rate": features.get("heart_rate", 0.0),
            "sample_count": len(samples),
            "duration_sec": len(samples) / sample_rate,
            "features": features,
        }

        if self.artifact is not None and self.artifact["feature_names"]:
            model = self.artifact["model"]
            scaler = self.artifact["scaler"]
            feature_names = self.artifact["feature_names"]

            feature_vector = np.array([[features.get(name, 0) for name in feature_names]])
            feature_scaled = scaler.transform(feature_vector)

            prediction = model.predict(feature_scaled)[0]
            probabilities = model.predict_proba(feature_scaled)[0]
            classes = model.classes_

            result["pulse_pattern"] = str(prediction)
            result["confidence"] = float(np.max(probabilities))
            result["pattern_probabilities"] = {
                str(c): float(p) for c, p in zip(classes, probabilities)
            }
        else:
            result["pulse_pattern"] = self._rule_based_classify(features)
            result["confidence"] = 0.5

        result["recommendations"] = self._generate_recommendations(result)
        return result

    def _rule_based_classify(self, features: dict) -> str:
        hr = features.get("heart_rate", 0)
        ibi_std = features.get("ibi_std", 0)
        amplitude = features.get("peak_amplitude_mean", 0)

        if hr > 90 and ibi_std > 0.05:
            return "vata"
        elif hr > 70 and amplitude > 0.6:
            return "pitta"
        elif hr < 70 and amplitude > 0.3:
            return "kapha"
        else:
            return "sama"

    def _generate_recommendations(self, result: dict) -> str:
        pattern = result.get("pulse_pattern", "unknown")
        hr = result.get("heart_rate", 0)
        confidence = result.get("confidence", 0)

        recommendations = []

        if hr > 100:
            recommendations.append("Elevated heart rate detected. Consider rest and hydration.")
        elif hr < 50:
            recommendations.append("Low heart rate detected. Monitor for dizziness or fatigue.")

        pattern_recs = {
            "vata": "Vata-type pulse suggests air element dominance. Consider grounding routine, warm foods, and regular sleep schedule.",
            "pitta": "Pitta-type pulse suggests fire element balance. Consider cooling foods, avoid excessive heat exposure, and manage stress.",
            "kapha": "Kapha-type pulse suggests earth/water element. Consider regular exercise, light foods, and stimulation.",
            "sama": "Balanced pulse pattern detected. Maintain current lifestyle habits.",
        }

        if pattern in pattern_recs:
            recommendations.append(pattern_recs[pattern])

        if confidence < 0.6:
            recommendations.append("Analysis confidence is moderate. Consider a longer recording for better accuracy.")

        if not recommendations:
            recommendations.append("No specific concerns detected. Maintain a healthy lifestyle.")

        return " ".join(recommendations)
