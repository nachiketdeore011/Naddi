"""Unit tests for signal preprocessing pipeline."""

import numpy as np
import pytest
from numpy.testing import assert_array_almost_equal

from src.preprocessing import (
    bandpass_filter,
    remove_baseline_wander,
    normalize,
    preprocess,
)


class TestBandpassFilter:

    def test_passes_low_freq_content(self):
        """A 2 Hz sine should pass through a 0.5-8 Hz filter."""
        sr = 100
        t = np.arange(2000) / sr
        signal = np.sin(2 * np.pi * 2.0 * t)
        filtered = bandpass_filter(signal, low_freq=0.5, high_freq=8.0, sample_rate=sr)
        orig_rms = np.sqrt(np.mean(signal[500:1500] ** 2))
        filt_rms = np.sqrt(np.mean(filtered[500:1500] ** 2))
        assert filt_rms / orig_rms > 0.9

    def test_rejects_high_freq_content(self):
        """A 20 Hz sine should be strongly attenuated by a 0.5-8 Hz filter."""
        sr = 100
        t = np.arange(2000) / sr
        signal = np.sin(2 * np.pi * 20.0 * t)
        filtered = bandpass_filter(signal, low_freq=0.5, high_freq=8.0, sample_rate=sr)
        orig_rms = np.sqrt(np.mean(signal[500:1500] ** 2))
        filt_rms = np.sqrt(np.mean(filtered[500:1500] ** 2))
        # Should retain less than 1% of original energy
        assert filt_rms / orig_rms < 0.01

    def test_rejects_dc_offset(self):
        sr = 100
        signal = np.ones(600) * 5.0
        filtered = bandpass_filter(signal, low_freq=0.5, high_freq=8.0, sample_rate=sr)
        assert np.abs(np.mean(filtered)) < 0.01

    def test_output_same_length(self):
        sr = 100
        signal = np.random.default_rng(42).normal(0, 1, 600)
        filtered = bandpass_filter(signal, sample_rate=sr)
        assert len(filtered) == len(signal)

    def test_preserves_amplitude_shape(self):
        sr = 100
        t = np.arange(2000) / sr
        signal = 2.5 * np.sin(2 * np.pi * 3.0 * t)
        filtered = bandpass_filter(signal, sample_rate=sr)
        orig_rms = np.sqrt(np.mean(signal[500:1500] ** 2))
        filt_rms = np.sqrt(np.mean(filtered[500:1500] ** 2))
        assert filt_rms / orig_rms > 0.9


class TestRemoveBaselineWander:

    def test_removes_linear_trend(self):
        t = np.arange(600)
        signal = np.sin(2 * np.pi * 0.05 * t) + 0.001 * t
        detrended = remove_baseline_wander(signal)
        assert np.abs(np.mean(detrended)) < 0.1

    def test_removes_constant_offset(self):
        signal = np.ones(600) * 3.0
        detrended = remove_baseline_wander(signal)
        assert np.abs(np.mean(detrended)) < 1e-10

    def test_output_same_length(self):
        signal = np.random.default_rng(42).normal(0, 1, 600)
        result = remove_baseline_wander(signal)
        assert len(result) == len(signal)


class TestNormalize:

    def test_output_range_0_to_1(self):
        signal = np.array([3.0, 1.0, 5.0, 2.0, 4.0])
        normalized = normalize(signal)
        assert np.min(normalized) == pytest.approx(0.0)
        assert np.max(normalized) == pytest.approx(1.0)

    def test_constant_signal_returns_zeros(self):
        signal = np.ones(100) * 7.0
        normalized = normalize(signal)
        assert_array_almost_equal(normalized, np.zeros(100))

    def test_monotonic_stays_monotonic(self):
        signal = np.array([1, 2, 3, 4, 5], dtype=float)
        normalized = normalize(signal)
        for i in range(len(normalized) - 1):
            assert normalized[i] < normalized[i + 1]

    def test_output_same_length(self):
        signal = np.random.default_rng(42).normal(0, 1, 200)
        result = normalize(signal)
        assert len(result) == len(signal)


class TestPreprocess:

    def test_output_is_normalized(self):
        sr = 100
        t = np.arange(600) / sr
        signal = 0.5 * np.sin(2 * np.pi * 1.5 * t) + 0.1 * np.sin(2 * np.pi * 4.0 * t)
        result = preprocess(signal, sample_rate=sr)
        assert np.min(result) >= 0.0
        assert np.max(result) <= 1.0

    def test_output_is_float64(self):
        sr = 100
        signal = np.arange(600, dtype=float)
        result = preprocess(signal, sample_rate=sr)
        assert result.dtype == np.float64

    def test_output_same_length(self):
        sr = 100
        signal = np.random.default_rng(42).normal(0, 1, 600)
        result = preprocess(signal, sample_rate=sr)
        assert len(result) == 600

    def test_accepts_list_input(self):
        sr = 100
        signal_list = list(np.sin(np.linspace(0, 10, 600)))
        result = preprocess(signal_list, sample_rate=sr)
        assert isinstance(result, np.ndarray)
        assert len(result) == 600

    def test_ppg_like_signal_produces_valid_output(self):
        sr = 100
        t = np.arange(600) / sr
        hr = 75
        beat_period = 60.0 / hr
        signal = np.zeros(600)
        for beat_start in np.arange(0, 6, beat_period):
            idx = int(beat_start * sr)
            if idx < 600:
                end = min(idx + int(0.5 * sr), 600)
                segment_t = np.arange(end - idx) / sr
                signal[idx:end] = np.exp(-0.5 * ((segment_t - 0.15) / 0.08) ** 2)
        signal += 0.3 * np.sin(2 * np.pi * 0.1 * t)
        signal += np.random.default_rng(42).normal(0, 0.01, 600)
        result = preprocess(signal, sample_rate=sr)
        assert result.dtype == np.float64
        assert len(result) == 600
        assert np.max(result) <= 1.0
        assert np.min(result) >= 0.0
