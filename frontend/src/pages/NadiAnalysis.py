import os

content = r'''import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, User, Activity, Brain, FileText,
  Play, Pause, RotateCcw, CheckCircle2, Loader2, Heart,
  Search, Sparkles, Shield, Clock, Zap
} from "lucide-react";
import PulseWaveform from "../components/PulseWaveform";
import DoshaChart from "../components/DoshaChart";
import SectionReveal from "../components/SectionReveal";

const STEPS = ["Patient Info", "Pulse Capture", "Processing", "Results"];

interface PatientData {
  name: string; age: string; gender: string; contact: string;
  height: string; weight: string; email: string;
}

interface AnalysisResult {
  vata: number; pitta: number; kapha: number;
  heartRate: number; pulseStrength: string; rhythm: string;
  signalQuality: number; observations: string[];
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

function PatientInfoStep({ data, onChange, onNext }: { data: PatientData; onChange: (d: PatientData) => void; onNext: () => void }) {
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
        <div className="glass-card p-8 border-gradient">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: "name" as const, label: "Full Name", type: "text", placeholder: "Enter full name", required: true },
              { key: "age" as const, label: "Age", type: "number", placeholder: "e.g. 35", required: true },
              { key: "gender" as const, label: "Gender", type: "select", options: ["", "Male", "Female", "Other"], required: true },
              { key: "contact" as const, label: "Phone", type: "tel", placeholder: "+91 XXXXX XXXXX", required: false },
              { key: "height" as const, label: "Height (cm)", type: "number", placeholder: "e.g. 170", required: false },
              { key: "weight" as const, label: "Weight (kg)", type: "number", placeholder: "e.g. 70", required: false },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm text-slate-400 mb-2">{f.label}{f.required && <span className="text-teal-400 ml-1">*</span>}</label>
                {f.type === "select" ? (
                  <select value={data[f.key]} onChange={(e) => update(f.key, e.target.value)}
                    className="input-dark" required={f.required}>
                    {f.options!.map((o) => <option key={o} value={o}>{o || "Select..."}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={data[f.key]} onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder} className="input-dark" required={f.required} />
                )}
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-2">Email (optional)</label>
              <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)}
                placeholder="email@example.com" className="input-dark" />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button onClick={onNext} disabled={!valid}
              className={`btn-glow ${!valid ? "opacity-50 cursor-not-allowed" : ""}`}>
              Continue to Pulse Capture <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PulseCaptureStep({ onCapture, onBack }: { onCapture: () => void; onBack: () => void }) {
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
        <div className="glass-card p-8 border-gradient">
          {/* Scanning animation */}
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

          {/* Waveform preview */}
          <div className="bg-navy-950/80 roun
