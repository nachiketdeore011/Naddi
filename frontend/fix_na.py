# Write the complete NadiAnalysis.tsx file
content = r'''import { useState, useEffect, useCallback } from "react";
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
            <div className="absolute inset-0 flex it
