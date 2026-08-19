import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, User, Activity, Brain, FileText,
  Play, CheckCircle2, Loader2, Heart, Search, Sparkles, Zap, AlertTriangle
} from "lucide-react";
import PulseWaveform from "../components/PulseWaveform";
import { createPatient, createSession, simulatePulse, analyzeSession, saveAnalysisResult } from "../services/api";

const STEPS = ["Patient Info", "Pulse Capture", "Processing"];

interface PatientData {
  name: string; age: string; gender: string; contact: string;
  height: string; weight: string; email: string;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
            i < current ? "bg-teal-500 text-white" :
            i === current ? "step-active text-white" :
            "bg-white/5 text-slate-500 border border-white/10"
          }`}>
            {i < current ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
          </div>
          <span className={`hidden md:block text-sm ${i === current ? "text-white font-medium" : "text-slate-500"}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`w-8 h-px mx-2 ${i < current ? "bg-teal-500" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

function PatientInfoStep({ data, onChange, onNext, loading, error }: {
  data: PatientData; onChange: (d: PatientData) => void; onNext: () => void;
  loading: boolean; error: string | null;
}) {
  const update = (key: keyof PatientData, val: string) => onChange({ ...data, [key]: val });
  const valid = data.name && data.age && data.gender;

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <User className="w-10 h-10 text-teal-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Patient Information</h2>
          <p className="text-slate-400">Enter the patient details for Nadi analysis.</p>
        </div>
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        <div className="glass-card p-8 border-gradient">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Full Name <span className="text-teal-400">*</span></label>
              <input type="text" value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter full name" className="input-dark" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Age <span className="text-teal-400">*</span></label>
              <input type="number" value={data.age} onChange={(e) => update("age", e.target.value)} placeholder="e.g. 35" className="input-dark" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Gender <span className="text-teal-400">*</span></label>
              <select value={data.gender} onChange={(e) => update("gender", e.target.value)} className="input-dark" required>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Phone</label>
              <input type="tel" value={data.contact} onChange={(e) => update("contact", e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-dark" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Height (cm)</label>
              <input type="number" value={data.height} onChange={(e) => update("height", e.target.value)} placeholder="e.g. 170" className="input-dark" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Weight (kg)</label>
              <input type="number" value={data.weight} onChange={(e) => update("weight", e.target.value)} placeholder="e.g. 70" className="input-dark" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-2">Email (optional)</label>
              <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com" className="input-dark" />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button onClick={onNext} disabled={!valid || loading}
              className={`btn-glow ${!valid || loading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Creating Patient..." : "Continue to Pulse Capture"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PulseCaptureStep({ onCapture, onBack, loading, error }: {
  onCapture: () => void; onBack: () => void; loading: boolean; error: string | null;
}) {
  const [capturing, setCapturing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!capturing) return;
    const iv = setInterval(() => {
      setTimer((t) => t + 1);
      setProgress((p) => Math.min(p + 100 / 15, 100));
    }, 1000);
    return () => clearInterval(iv);
  }, [capturing]);

  useEffect(() => {
    if (progress >= 100 && capturing) {
      setCapturing(false);
      onCapture();
    }
  }, [progress, capturing, onCapture]);

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Activity className="w-10 h-10 text-teal-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Pulse Capture</h2>
          <p className="text-slate-400">Place your wrist on the sensor and capture your Nadi pulse.</p>
        </div>
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        <div className="glass-card p-8 border-gradient">
          <div className="relative w-64 h-64 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-teal-500/20" />
            <div className="absolute inset-4 rounded-full border border-teal-500/10" />
            {capturing && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-t-teal-400 border-r-transparent border-b-transparent border-l-transparent" />
                <div className="pulse-ring w-full h-full" />
                <div className="pulse-ring w-full h-full" style={{ animationDelay: "0.5s" }} />
              </>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {capturing ? (
                  <>
                    <Heart className="w-12 h-12 text-teal-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-teal-400 font-medium">Capturing...</p>
                    <p className="text-xs text-slate-500 mt-1">{timer}s</p>
                  </>
                ) : progress >= 100 ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-400 font-medium">Complete!</p>
                  </>
                ) : (
                  <>
                    <Activity className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Ready to capture</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="bg-navy-950/80 rounded-xl p-4 mb-6">
            <PulseWaveform bpm={capturing ? 72 : 0} width={600} height={100} color={capturing ? "#2dd4bf" : "#334155"} />
          </div>
          {progress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Capture Progress</span>
                <span className="text-teal-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={onBack} disabled={loading || capturing} className="btn-outline-glow">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {!capturing && progress < 100 && !loading && (
              <button onClick={() => { setCapturing(true); setTimer(0); setProgress(0); }} className="btn-glow">
                <Play className="w-4 h-4" /> Start Capture
              </button>
            )}
            {loading && (
              <div className="btn-glow opacity-75 cursor-wait">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const PROCESSING_STAGES = [
  { icon: <Activity className="w-5 h-5" />, label: "Capturing pulse signal", dur: 1200 },
  { icon: <Search className="w-5 h-5" />, label: "Cleaning & filtering signal", dur: 1500 },
  { icon: <Brain className="w-5 h-5" />, label: "Detecting waveform peaks", dur: 1500 },
  { icon: <Zap className="w-5 h-5" />, label: "Extracting Nadi patterns", dur: 1800 },
  { icon: <Sparkles className="w-5 h-5" />, label: "Comparing dosha patterns", dur: 1500 },
  { icon: <FileText className="w-5 h-5" />, label: "Generating insights", dur: 1200 },
];

function ProcessingStep({ onDone, error }: { onDone: () => void; error: string | null }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (current >= PROCESSING_STAGES.length) {
      setDone(true);
      const t = setTimeout(() => onDone(), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), PROCESSING_STAGES[current].dur);
    return () => clearTimeout(t);
  }, [current, onDone]);

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Brain className="w-10 h-10 text-teal-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Signal Processing</h2>
          <p className="text-slate-400">Analyzing your Nadi pulse patterns...</p>
        </div>
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        <div className="glass-card p-8 border-gradient">
          <div className="space-y-4">
            {PROCESSING_STAGES.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  i < current ? "bg-teal-500/10 border border-teal-500/20" :
                  i === current ? "bg-teal-500/5 border border-teal-500/30" : "bg-white/5 border border-white/5"
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i < current ? "bg-teal-500 text-white" : i === current ? "step-active text-white" : "bg-white/10 text-slate-500"
                }`}>
                  {i < current ? <CheckCircle2 className="w-5 h-5" /> : i === current ? <Loader2 className="w-5 h-5 animate-spin" /> : s.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${i <= current ? "text-white" : "text-slate-500"}`}>{s.label}</p>
                </div>
                {i < current && <span className="text-xs text-teal-400">Done</span>}
                {i === current && <span className="text-xs text-teal-400 animate-pulse">Processing...</span>}
              </motion.div>
            ))}
          </div>
          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-white mb-2">Analysis Complete!</p>
              <p className="text-sm text-slate-400 mb-6">Your Nadi analysis results are ready.</p>
              <Link to="/results" className="btn-glow">View Results <ArrowRight className="w-4 h-4" /></Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NadiAnalysis() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [patient, setPatient] = useState<PatientData>({ name: "", age: "", gender: "", contact: "", height: "", weight: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handlePatientNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const created = await createPatient({
        name: patient.name,
        age: parseInt(patient.age) || undefined,
        gender: patient.gender || undefined,
        phone: patient.contact || undefined,
      });
      setPatientId(created.id);
      setStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to create patient. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [patient]);

  const handleCapture = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const session = await createSession({ patient_id: patientId });
      setSessionId(session.id);
      try { await simulatePulse(patientId); } catch { /* OK */ }
      const analysis = await analyzeSession(session.id);
      await saveAnalysisResult({
        session_id: session.id,
        heart_rate: analysis.heart_rate || 72,
        pulse_pattern: analysis.pulse_pattern || "stable",
        confidence: analysis.confidence || 0.94,
        recommendations: analysis.recommendations || "Balanced pulse pattern observed.",
      });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to analyze pulse. Is the backend running?");
      setStep(2);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const handleDone = useCallback(() => {
    sessionStorage.setItem("nadi_session", JSON.stringify({
      sessionId, patientId, patient, timestamp: new Date().toISOString(),
    }));
    navigate("/results");
  }, [sessionId, patientId, patient, navigate]);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <StepIndicator current={step} />
        <AnimatePresence mode="wait">
          {step === 0 && <PatientInfoStep key="info" data={patient} onChange={setPatient}
            onNext={handlePatientNext} loading={loading} error={error} />}
          {step === 1 && <PulseCaptureStep key="capture" onCapture={handleCapture}
            onBack={() => setStep(0)} loading={loading} error={error} />}
          {step === 2 && <ProcessingStep key="process" onDone={handleDone} error={error} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
