"""
Generate synthetic PPG training data for Nadi pulse pattern classification.

Produces realistic PPG-like signals with distinct morphological characteristics
for each Nadi type: Vata, Pitta, Kapha, and Sama.

Usage:
    python generate_data.py --output data/ --samples 200
"""

import argparse
import os
import numpy as np


PATTERN_PARAMS = {
    "vata": {
        "heart_rate_range": (85, 115),
        "ibi_cv_range": (0.06, 0.15),
        "amplitude_range": (0.25, 0.55),
        "rise_time_ratio": (0.25, 0.40),
        "pulse_width_ratio": (0.20, 0.35),
        "notch_depth": (0.0, 0.05),
        "noise_level": (0.02, 0.06),
    },
    "pitta": {
        "heart_rate_range": (72, 95),
        "ibi_cv_range": (0.02, 0.06),
        "amplitude_range": (0.55, 0.85),
        "rise_time_ratio": (0.20, 0.30),
        "pulse_width_ratio": (0.30, 0.45),
        "notch_depth": (0.08, 0.18),
        "noise_level": (0.01, 0.03),
    },
    "kapha": {
        "heart_rate_range": (52, 70),
        "ibi_cv_range": (0.01, 0.04),
        "amplitude_range": (0.60, 0.90),
        "rise_time_ratio": (0.30, 0.45),
        "pulse_width_ratio": (0.35, 0.50),
        "notch_depth": (0.05, 0.12),
        "noise_level": (0.005, 0.02),
    },
    "sama": {
        "heart_rate_range": (65, 80),
        "ibi_cv_range": (0.02, 0.05),
        "amplitude_range": (0.45, 0.70),
        "rise_time_ratio": (0.25, 0.35),
        "pulse_width_ratio": (0.28, 0.40),
        "notch_depth": (0.06, 0.12),
        "noise_level": (0.01, 0.03),
    },
}


def generate_ppg_pulse(heart_rate, rise_time_ratio, pulse_width_ratio, notch_depth, amplitude, sample_rate=100):
    beat_period = 60.0 / heart_rate
    beat_samples = int(beat_period * sample_rate)
    t = np.linspace(0, beat_period, beat_samples, endpoint=False)
    systolic_peak_time = rise_time_ratio * beat_period
    systolic_sigma = 0.15 * beat_period
    systolic = amplitude * np.exp(-0.5 * ((t - systolic_peak_time) / systolic_sigma) ** 2)
    notch_time = systolic_peak_time + 0.25 * beat_period
    notch_sigma = 0.06 * beat_period
    notch = -notch_depth * amplitude * np.exp(-0.5 * ((t - notch_time) / notch_sigma) ** 2)
    diastolic_time = systolic_peak_time + 0.45 * beat_period
    diastolic_sigma = 0.3 * beat_period
    diastolic = 0.25 * amplitude * np.exp(-0.5 * ((t - diastolic_time) / diastolic_sigma) ** 2)
    return systolic + notch + diastolic


def generate_ppg_signal(duration_sec, sample_rate, params, rng):
    total_samples = int(duration_sec * sample_rate)
    hr = rng.uniform(*params["heart_rate_range"])
    ibi_cv = rng.uniform(*params["ibi_cv_range"])
    amplitude = rng.uniform(*params["amplitude_range"])
    rise_ratio = rng.uniform(*params["rise_time_ratio"])
    pw_ratio = rng.uniform(*params["pulse_width_ratio"])
    notch = rng.uniform(*params["notch_depth"])
    noise = rng.uniform(*params["noise_level"])

    signal = np.zeros(total_samples)
    current_sample = 0

    while current_sample < total_samples:
        beat_hr = hr * (1 + rng.normal(0, ibi_cv * 0.5))
        beat_hr = np.clip(beat_hr, hr * 0.7, hr * 1.3)
        beat_amp = amplitude * (1 + rng.normal(0, 0.05))
        beat_amp = np.clip(beat_amp, amplitude * 0.7, amplitude * 1.3)

        pulse = generate_ppg_pulse(beat_hr, rise_ratio, pw_ratio, notch, beat_amp, sample_rate)
        end = min(current_sample + len(pulse), total_samples)
        signal[current_sample:end] = pulse[:end - current_sample]

        beat_period = 60.0 / beat_hr
        jitter = rng.normal(0, beat_period * ibi_cv)
        next_interval = beat_period + jitter
        current_sample += int(next_interval * sample_rate)

    t = np.arange(total_samples) / sample_rate
    baseline = 0.05 * amplitude * np.sin(2 * np.pi * 0.1 * t + rng.uniform(0, 2 * np.pi))
    signal += baseline
    signal += rng.normal(0, noise * amplitude, total_samples)
    return signal


def generate_dataset(samples_per_class=200, duration_sec=6.0, sample_rate=100, seed=42):
    rng = np.random.default_rng(seed)
    all_signals = []
    all_labels = []

    for pattern_name, params in PATTERN_PARAMS.items():
        print(f"  Generating {samples_per_class} {pattern_name} samples...")
        for i in range(samples_per_class):
            signal = generate_ppg_signal(duration_sec, sample_rate, params, rng)
            all_signals.append(signal)
            all_labels.append(pattern_name)

    return {"signals": all_signals, "labels": all_labels, "sample_rate": sample_rate}


def save_dataset_csv(dataset, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "training_data.csv")
    with open(output_path, "w") as f:
        f.write("sample_index,value,label\n")
        for signal, label in zip(dataset["signals"], dataset["labels"]):
            for idx, val in enumerate(signal):
                f.write(f"{idx},{val:.6f},{label}\n")
    print(f"  Saved to {output_path}")
    total = len(dataset["signals"])
    sr = dataset["sample_rate"]
    n_samples = len(dataset["signals"][0])
    print(f"  {total} samples, {sr} Hz, {n_samples} samples each ({n_samples/sr:.1f}s)")


def save_dataset_per_class(dataset, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    by_label = {}
    for signal, label in zip(dataset["signals"], dataset["labels"]):
        if label not in by_label:
            by_label[label] = []
        by_label[label].append(signal)

    sr = dataset["sample_rate"]
    for label, signals in by_label.items():
        label_dir = os.path.join(output_dir, label)
        os.makedirs(label_dir, exist_ok=True)
        for i, signal in enumerate(signals):
            filepath = os.path.join(label_dir, f"{i:04d}.csv")
            with open(filepath, "w") as f:
                f.write("value\n")
                for val in signal:
                    f.write(f"{val:.6f}\n")

    print(f"  Saved {sum(len(v) for v in by_label.values())} files across {len(by_label)} classes")


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic Nadi training data")
    parser.add_argument("--output", default="data", help="Output directory")
    parser.add_argument("--samples", type=int, default=200, help="Samples per class")
    parser.add_argument("--duration", type=float, default=6.0, help="Signal duration (sec)")
    parser.add_argument("--sample-rate", type=int, default=100, help="Sample rate (Hz)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    print(f"Generating synthetic Nadi training data...")
    print(f"  {args.samples} samples per class, {args.duration}s each, {args.sample_rate} Hz")

    dataset = generate_dataset(
        samples_per_class=args.samples,
        duration_sec=args.duration,
        sample_rate=args.sample_rate,
        seed=args.seed,
    )

    save_dataset_csv(dataset, args.output)
    save_dataset_per_class(dataset, args.output)
    print("\nDone! Training data ready.")


if __name__ == "__main__":
    main()
