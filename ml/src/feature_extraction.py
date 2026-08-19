"""
Feature extraction from preprocessed PPG signals.

Extracts morphological features relevant to Nadi pulse
pattern classification.
"""

import numpy as np
from scipy.signal import find_peaks


def detect_peaks(signal: np.ndarray, sample_rate: int = 100) -> dict:
    """Detect systolic peaks in PPG signal.

    Returns:
        Dictionary with peak indices, times, and intervals.
    """
    min_distance = int(0.4 * sample_rate)  # minimum 400ms between peaks
    peaks, properties = find_peaks(
        signal,
        distance=min_distance,
        prominence=0.1,
    )

    peak_times = peaks / sample_rate
    if len(peaks) > 1:
        peak_intervals = np.diff(peak_times)
    else:
        peak_intervals = np.array([])

    return {
        "indices": peaks,
        "times": peak_times,
        "intervals": peak_intervals,
    }


def extract_heart_rate(peaks_info: dict) -> float:
    """Calculate heart rate from detected peaks.

    Returns:
        Heart rate in BPM.
    """
    intervals = peaks_info["intervals"]
    if len(intervals) == 0:
        return 0.0
    mean_interval = np.mean(intervals)
    return 60.0 / mean_interval if mean_interval > 0 else 0.0


def extract_morphology_features(
    signal: np.ndarray,
    peaks_info: dict,
    sample_rate: int = 100,
) -> dict:
    """Extract morphological features from PPG signal.

    Features include:
    - Systolic peak amplitude
    - Pulse width at 50% amplitude
    - Rising time (systolic phase)
    - Dicrotic notch presence
    - Pulse area ratio

    Returns:
        Dictionary of extracted features.
    """
    peaks = peaks_info["indices"]
    features = {}

    if len(peaks) < 2:
        return _empty_features()

    # Peak amplitudes
    amplitudes = signal[peaks]
    features["peak_amplitude_mean"] = float(np.mean(amplitudes))
    features["peak_amplitude_std"] = float(np.std(amplitudes))

    # Inter-beat interval stats
    intervals = peaks_info["intervals"]
    features["ibi_mean"] = float(np.mean(intervals))
    features["ibi_std"] = float(np.std(intervals))
    features["heart_rate"] = extract_heart_rate(peaks_info)

    # Rising time (time from trough to peak)
    rising_times = []
    widths_50 = []
    for i in range(1, len(peaks)):
        # Find trough before this peak
        window_start = peaks[i - 1]
        window_end = peaks[i]
        trough_idx = window_start + np.argmin(signal[window_start:window_end])
        trough_val = signal[trough_idx]
        peak_val = signal[peaks[i - 1]]

        # Rising time
        rising_times.append((peaks[i - 1] - trough_idx) / sample_rate)

        # Pulse width at 50%
        mid_amp = (peak_val + trough_val) / 2
        above = signal[trough_idx:peaks[i - 1]] >= mid_amp
        if np.any(above):
            idx = np.where(above)[0]
            width = (idx[-1] - idx[0]) / sample_rate
            widths_50.append(width)

    features["rising_time_mean"] = float(np.mean(rising_times)) if rising_times else 0.0
    features["pulse_width_mean"] = float(np.mean(widths_50)) if widths_50 else 0.0

    # Pulse area ratio (systolic / total)
    areas = []
    for i in range(1, len(peaks)):
        start = peaks[i - 1]
        end = peaks[i]
        segment = signal[start:end]
        if len(segment) > 0:
            peak_local = peaks[i - 1] - start
            systolic_area = np.trapz(segment[:peak_local]) if peak_local > 0 else 0
            total_area = np.trapz(segment)
            ratio = systolic_area / total_area if total_area > 0 else 0
            areas.append(ratio)

    features["systolic_area_ratio"] = float(np.mean(areas)) if areas else 0.5

    return features


def _empty_features() -> dict:
    """Return empty feature set when signal is too short."""
    return {
        "peak_amplitude_mean": 0.0,
        "peak_amplitude_std": 0.0,
        "ibi_mean": 0.0,
        "ibi_std": 0.0,
        "heart_rate": 0.0,
        "rising_time_mean": 0.0,
        "pulse_width_mean": 0.0,
        "systolic_area_ratio": 0.5,
    }


def extract_all_features(
    signal: np.ndarray,
    sample_rate: int = 100,
) -> dict:
    """Run full feature extraction pipeline.

    Args:
        signal: Preprocessed PPG signal.
        sample_rate: Sampling rate in Hz.

    Returns:
        Dictionary of all extracted features.
    """
    peaks_info = detect_peaks(signal, sample_rate)
    features = extract_morphology_features(signal, peaks_info, sample_rate)

    # Add peak count
    features["peak_count"] = len(peaks_info["indices"])

    # Heart rate variability
    if len(peaks_info["intervals"]) > 1:
        features["hrv_rmssd"] = float(
            np.sqrt(np.mean(np.diff(peaks_info["intervals"]) ** 2))
        )
    else:
        features["hrv_rmssd"] = 0.0

    return features
