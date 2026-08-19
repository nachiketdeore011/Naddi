"""
Signal preprocessing for Nadi pulse data.

Applies bandpass filtering, baseline wander removal,
and normalization to raw PPG signals.
"""

import numpy as np
from scipy.signal import butter, filtfilt, detrend


def bandpass_filter(
    signal: np.ndarray,
    low_freq: float = 0.5,
    high_freq: float = 8.0,
    sample_rate: int = 100,
    order: int = 4,
) -> np.ndarray:
    """Apply a Butterworth bandpass filter to the signal.

    Args:
        signal: Raw PPG signal array.
        low_freq: Lower cutoff frequency in Hz.
        high_freq: Upper cutoff frequency in Hz.
        sample_rate: Sampling rate in Hz.
        order: Filter order.

    Returns:
        Filtered signal.
    """
    nyquist = sample_rate / 2.0
    low = low_freq / nyquist
    high = high_freq / nyquist
    b, a = butter(order, [low, high], btype="band")
    return filtfilt(b, a, signal)


def remove_baseline_wander(signal: np.ndarray) -> np.ndarray:
    """Remove baseline wander using detrending.

    Args:
        signal: Filtered PPG signal.

    Returns:
        Detrended signal.
    """
    return detrend(signal, type="linear")


def normalize(signal: np.ndarray) -> np.ndarray:
    """Normalize signal to [0, 1] range.

    Args:
        signal: Preprocessed signal.

    Returns:
        Normalized signal.
    """
    min_val = np.min(signal)
    max_val = np.max(signal)
    if max_val - min_val == 0:
        return np.zeros_like(signal)
    return (signal - min_val) / (max_val - min_val)


def preprocess(
    raw_signal: np.ndarray,
    sample_rate: int = 100,
) -> np.ndarray:
    """Full preprocessing pipeline.

    Args:
        raw_signal: Raw PPG signal from sensor.
        sample_rate: Sampling rate in Hz.

    Returns:
        Fully preprocessed signal.
    """
    signal = np.array(raw_signal, dtype=np.float64)

    # Step 1: Bandpass filter
    signal = bandpass_filter(signal, sample_rate=sample_rate)

    # Step 2: Remove baseline wander
    signal = remove_baseline_wander(signal)

    # Step 3: Normalize
    signal = normalize(signal)

    return signal
