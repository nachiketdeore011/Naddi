# ML Pipeline - Nadi Pulse Analysis

## Overview
Signal processing and machine learning pipeline for classifying pulse patterns based on Nadi Pariksha principles.

## Structure
- `src/preprocessing.py` - Bandpass filtering, baseline removal, normalization
- `src/feature_extraction.py` - Heart rate, morphology features, HRV
- `src/train.py` - Model training script
- `src/inference.py` - Real-time analysis engine
- `src/server.py` - FastAPI inference server
- `data/` - Training data directory
- `models/` - Trained model artifacts

## Training
```bash
python -m src.train --data data/ --output models/nadi_model.pkl
```

## Running the Server
```bash
uvicorn src.server:app --host 0.0.0.0 --port 8001 --reload
```

## Training Data Format
CSV files with columns: `sample_index, value, label`

Or directory structure:
```
data/
  vata/*.csv
  pitta/*.csv
  kapha/*.csv
  sama/*.csv
```
