"""Unit tests for PulseAnalyzer inference."""

import numpy as np
import pytest

from src.inference import PulseAnalyzer


def make_ppg_signal(hr_bpm=75, duration_sec=6.0, sr=100, noise=0.01):
    """Generate a synthetic PPG signal."""
    rng = np.random.default_rng(42)
    total = int(duration_sec * sr)
    t = np.arange(total) / sr
    beat_period = 60.0 / hr_bpm
    signal = np.zeros(total)

    for beat_start in np.arange(0, duration_sec, beat_period):
        idx = int(beat_start * sr)
        if idx >= total:
            break
        end = min(idx + int(0.4 * sr), total)
        seg_t = np.arange(end - idx) / sr
        signal[idx:end] = 0.7 * np.exp(-0.5 * ((seg_t - 0.12) / 0.06) ** 2)

    signal += rng.normal(0, noise, total)
    return signal


class TestPulseAnalyzerWithoutModel:

    def test_rule_based_classify_vata(self):
        """High HR + high variability should classify as vata."""
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        features = {"heart_rate": 100, "ibi_std": 0.08, "peak_amplitude_mean": 0.4}
        result = analyzer._rule_based_classify(features)
        assert result == "vata"

    def test_rule_based_classify_pitta(self):
        """Medium HR + high amplitude should classify as pitta."""
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        features = {"heart_rate": 80, "ibi_std": 0.02, "peak_amplitude_mean": 0.7}
        result = analyzer._rule_based_classify(features)
        assert result == "pitta"

    def test_rule_based_classify_kapha(self):
        """Low HR + moderate amplitude should classify as kapha."""
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        features = {"heart_rate": 60, "ibi_std": 0.02, "peak_amplitude_mean": 0.5}
        result = analyzer._rule_based_classify(features)
        assert result == "kapha"

    def test_rule_based_classify_sama(self):
        """Moderate everything should classify as sama."""
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        features = {"heart_rate": 72, "ibi_std": 0.03, "peak_amplitude_mean": 0.3}
        result = analyzer._rule_based_classify(features)
        assert result == "sama"

    def test_analyze_without_model(self):
        """Full analysis pipeline should work without a trained model."""
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        signal = make_ppg_signal(hr_bpm=75)
        result = analyzer.analyze(signal.tolist(), sample_rate=100)

        assert "heart_rate" in result
        assert "pulse_pattern" in result
        assert "confidence" in result
        assert "recommendations" in result
        assert result["confidence"] == 0.5  # rule-based confidence
        assert result["sample_count"] == 600

    def test_analyze_short_signal(self):
        """Short signals should still work (may have few/no peaks)."""
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        signal = make_ppg_signal(hr_bpm=75, duration_sec=1.0)
        result = analyzer.analyze(signal.tolist(), sample_rate=100)
        assert "heart_rate" in result
        assert result["duration_sec"] == 1.0


class TestRecommendations:

    def test_high_hr_recommendation(self):
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        result = {"heart_rate": 110, "pulse_pattern": "vata", "confidence": 0.7}
        recs = analyzer._generate_recommendations(result)
        assert "rest and hydration" in recs

    def test_low_hr_recommendation(self):
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        result = {"heart_rate": 45, "pulse_pattern": "kapha", "confidence": 0.8}
        recs = analyzer._generate_recommendations(result)
        assert "dizziness" in recs

    def test_low_confidence_recommendation(self):
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        result = {"heart_rate": 75, "pulse_pattern": "sama", "confidence": 0.3}
        recs = analyzer._generate_recommendations(result)
        assert "moderate" in recs.lower()

    def test_vata_recommendation(self):
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        result = {"heart_rate": 100, "pulse_pattern": "vata", "confidence": 0.8}
        recs = analyzer._generate_recommendations(result)
        assert "vata" in recs.lower()

    def test_pitta_recommendation(self):
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        result = {"heart_rate": 80, "pulse_pattern": "pitta", "confidence": 0.8}
        recs = analyzer._generate_recommendations(result)
        assert "pitta" in recs.lower()

    def test_kapha_recommendation(self):
        analyzer = PulseAnalyzer.__new__(PulseAnalyzer)
        analyzer.artifact = None
        result = {"heart_rate": 60, "pulse_pattern": "kapha", "confidence": 0.8}
        recs = analyzer._generate_recommendations(result)
        assert "kapha" in recs.lower()


class TestPulseAnalyzerWithModel:

    @pytest.fixture
    def analyzer_with_model(self):
        """Create analyzer with the trained model."""
        import os
        model_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "models", "nadi_model.pkl"
        )
        if os.path.exists(model_path):
            return PulseAnalyzer(model_path)
        pytest.skip("Trained model not found")

    def test_model_loads(self, analyzer_with_model):
        assert analyzer_with_model.artifact is not None

    def test_analyze_with_model(self, analyzer_with_model):
        signal = make_ppg_signal(hr_bpm=75)
        result = analyzer_with_model.analyze(signal.tolist(), sample_rate=100)

        assert "pulse_pattern" in result
        assert result["pulse_pattern"] in ["vata", "pitta", "kapha", "sama"]
        assert 0 <= result["confidence"] <= 1.0

    def test_model_has_feature_names(self, analyzer_with_model):
        assert len(analyzer_with_model.artifact["feature_names"]) == 10
