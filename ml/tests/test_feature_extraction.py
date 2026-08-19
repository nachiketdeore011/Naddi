"""Unit tests for feature extraction pipeline."""

import numpy as np
import pytest

from src.feature_extraction import (
    detect_peaks,
    extract_heart_rate,
    extract_morphology_features,
    extract_all_features,
    _empty_features,
)


def make_ppg_signal(hr_bpm=75, duration_sec=6.0, sr=100, noise=0.01):
    """Generate a synthetic PPG signal with known properties."""
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


class TestDetectPeaks:

    def test_finds_peaks_in_ppg(self):
        signal = make_ppg_signal(hr_bpm=75, duration_sec=6.0)
        peaks_info = detect_peaks(signal, sample_rate=100)
        assert 5 <= len(peaks_info["indices"]) <= 12

    def test_peak_indices_are_integers(self):
        signal = make_ppg_signal(hr_bpm=75)
        peaks_info = detect_peaks(signal, sample_rate=100)
        assert peaks_info["indices"].dtype in (np.int64, np.int32, int)

    def test_peak_times_are_correct(self):
        sr = 100
        signal = make_ppg_signal(hr_bpm=75, sr=sr)
        peaks_info = detect_peaks(signal, sample_rate=sr)
        expected_times = peaks_info["indices"] / sr
        np.testing.assert_array_almost_equal(peaks_info["times"], expected_times)

    def test_intervals_are_positive(self):
        signal = make_ppg_signal(hr_bpm=75)
        peaks_info = detect_peaks(signal, sample_rate=100)
        if len(peaks_info["intervals"]) > 0:
            assert np.all(peaks_info["intervals"] > 0)

    def test_no_peaks_in_flat_signal(self):
        signal = np.zeros(600)
        peaks_info = detect_peaks(signal, sample_rate=100)
        assert len(peaks_info["indices"]) == 0
        assert len(peaks_info["intervals"]) == 0

    def test_single_peak_has_empty_intervals(self):
        sr = 100
        signal = np.zeros(600)
        signal[200] = 1.0
        peaks_info = detect_peaks(signal, sample_rate=sr)
        assert len(peaks_info["indices"]) <= 1
        assert len(peaks_info["intervals"]) == 0


class TestExtractHeartRate:

    def test_calculation_from_intervals(self):
        peaks_info = {"intervals": np.array([1.0, 1.0, 1.0, 1.0])}
        hr = extract_heart_rate(peaks_info)
        assert hr == pytest.approx(60.0)

    def test_fast_heart_rate(self):
        peaks_info = {"intervals": np.array([0.5, 0.5, 0.5])}
        hr = extract_heart_rate(peaks_info)
        assert hr == pytest.approx(120.0)

    def test_empty_intervals_returns_zero(self):
        peaks_info = {"intervals": np.array([])}
        hr = extract_heart_rate(peaks_info)
        assert hr == 0.0

    def test_matches_known_ppg(self):
        signal = make_ppg_signal(hr_bpm=75, duration_sec=6.0)
        peaks_info = detect_peaks(signal, sample_rate=100)
        hr = extract_heart_rate(peaks_info)
        assert 60 < hr < 90


class TestExtractMorphologyFeatures:

    def test_empty_peaks_returns_defaults(self):
        signal = np.random.default_rng(42).normal(0, 1, 600)
        peaks_info = {"indices": np.array([]), "intervals": np.array([])}
        features = extract_morphology_features(signal, peaks_info, sample_rate=100)
        assert features == _empty_features()

    def test_single_peak_returns_defaults(self):
        """With only 1 peak, the function returns empty features (< 2 peaks)."""
        signal = np.random.default_rng(42).normal(0, 1, 600)
        peaks_info = {"indices": np.array([300]), "intervals": np.array([])}
        features = extract_morphology_features(signal, peaks_info, sample_rate=100)
        # Single peak triggers _empty_features() path
        assert features["heart_rate"] == 0.0
        assert features["peak_amplitude_mean"] == 0.0

    def test_features_from_ppg(self):
        signal = make_ppg_signal(hr_bpm=75)
        peaks_info = detect_peaks(signal, sample_rate=100)
        features = extract_morphology_features(signal, peaks_info, sample_rate=100)

        expected_keys = [
            "peak_amplitude_mean", "peak_amplitude_std",
            "ibi_mean", "ibi_std", "heart_rate",
            "rising_time_mean", "pulse_width_mean",
            "systolic_area_ratio",
        ]
        for key in expected_keys:
            assert key in features, f"Missing feature: {key}"

    def test_ibi_mean_positive(self):
        signal = make_ppg_signal(hr_bpm=75)
        peaks_info = detect_peaks(signal, sample_rate=100)
        features = extract_morphology_features(signal, peaks_info, sample_rate=100)
        assert features["ibi_mean"] > 0

    def test_hr_matches_expected_range(self):
        signal = make_ppg_signal(hr_bpm=75)
        peaks_info = detect_peaks(signal, sample_rate=100)
        features = extract_morphology_features(signal, peaks_info, sample_rate=100)
        assert 60 < features["heart_rate"] < 90


class TestExtractAllFeatures:

    def test_returns_all_expected_keys(self):
        signal = make_ppg_signal(hr_bpm=75)
        features = extract_all_features(signal, sample_rate=100)

        expected_keys = [
            "peak_amplitude_mean", "peak_amplitude_std",
            "ibi_mean", "ibi_std", "heart_rate",
            "rising_time_mean", "pulse_width_mean",
            "systolic_area_ratio", "peak_count", "hrv_rmssd",
        ]
        for key in expected_keys:
            assert key in features, f"Missing feature: {key}"

    def test_peak_count_positive(self):
        signal = make_ppg_signal(hr_bpm=75)
        features = extract_all_features(signal, sample_rate=100)
        assert features["peak_count"] > 0

    def test_hrv_rmssd_is_non_negative(self):
        signal = make_ppg_signal(hr_bpm=75)
        features = extract_all_features(signal, sample_rate=100)
        assert features["hrv_rmssd"] >= 0.0

    def test_flat_signal_gives_zero_features(self):
        signal = np.zeros(600)
        features = extract_all_features(signal, sample_rate=100)
        assert features["peak_count"] == 0
        assert features["heart_rate"] == 0.0
        assert features["hrv_rmssd"] == 0.0

    def test_numeric_values_are_scalar(self):
        """All feature values should be numeric scalars (int or float)."""
        signal = make_ppg_signal(hr_bpm=75)
        features = extract_all_features(signal, sample_rate=100)
        for key, val in features.items():
            assert isinstance(val, (int, float)), (
                f"Feature {key} is not numeric: {type(val)}"
            )
