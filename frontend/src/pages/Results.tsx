import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Download, Share2, Heart, Activity, TrendingUp,
  Shield, Sparkles, Clock, Brain, Zap, CheckCircle2, AlertTriangle, Loader2
} from "lucide-react";
import DoshaChart from "../components/DoshaChart";
import PulseWaveform from "../components/PulseWaveform";
import { generateAnalysisPDF } from "../utils/generatePDF";
import SectionReveal from "../components/SectionReveal";

const MOCK_RESULT = {
  patient: { name: "Priya Sharma", age: 32, gender: "Female", date: "Aug 19, 2026" },
  vata: 42, pitta: 34, kapha: 24,
  heartRate: 72, pulseStrength: "Normal", rhythm: "Stable", signalQuality: 94,
  observations: [
    { title: "Pulse Pattern", desc: "Stable rhythmic pattern detected with consistent amplitude across capture window.", type: "positive" as const },
    { title: "Vata Balance", desc: "Slightly elevated Vata indicators suggest active nervous system. May benefit from grounding routines.", type: "info" as const },
    { title: "Pitta Characteristics", desc: "Balanced Pitta signals indicate healthy metabolic activity and temperature regulation.", type: "positive" as const },
    { title: "Kapha Indicators", desc: "Lower Kapha signals suggest active energy. Consider restful practices for balance.", type: "info" as const },
  ],
  suggestions: [
    "Practice regular meditation for Vata balance",
    "Maintain consistent sleep schedule",
    "Include warm, nourishing meals in diet",
    "Gentle yoga recommended for dosha harmony",
  ],
};

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass-card p-5 text-center">
      <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

export default function Results() {
  const r = MOCK_RESULT;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generateAnalysisPDF({
        patient: { name: r.patient.name, age: r.patient.age, gender: r.patient.gender, date: r.patient.date },
        vata: r.vata, pitta: r.pitta, kapha: r.kapha,
        heartRate: r.heartRate, pulseStrength: r.pulseStrength, rhythm: r.rhythm, signalQuality: r.signalQuality,
        observations: r.observations.map((o) => ({ title: o.title, desc: o.desc })),
        suggestions: r.suggestions,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <SectionReveal>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link to="/analysis" className="text-slate-500 hover:text-teal-400 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
                <span className="badge-glow"><Sparkles className="w-3 h-3" /> NADI ANALYSIS REPORT</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Analysis <span className="gradient-text-teal">Results</span></h1>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDownloadPDF} disabled={downloading} className="btn-outline-glow text-sm">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? "Generating..." : "Download Report"}
              </button>
              <button className="btn-outline-glow text-sm"><Share2 className="w-4 h-4" /> Share</button>
            </div>
          </div>
        </SectionReveal>

        {/* Patient Info */}
        <SectionReveal delay={0.1}>
          <div className="glass-card p-6 mb-8 border-gradient">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                  {r.patient.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{r.patient.name}</h3>
                  <p className="text-sm text-slate-400">{r.patient.age} years / {r.patient.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" /> {r.patient.date}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Dosha Balance */}
        <SectionReveal delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="glass-card p-8 border-gradient text-center">
              <h3 className="text-lg font-bold text-white mb-6">Dosha Balance</h3>
              <div className="flex justify-center">
                <DoshaChart vata={r.vata} pitta={r.pitta} kapha={r.kapha} size={220} />
              </div>
              <div className="flex justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-sky-400 mx-auto mb-1" />
                  <p className="text-sm font-medium text-white">{r.vata}%</p>
                  <p className="text-xs text-slate-500">Vata</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mx-auto mb-1" />
                  <p className="text-sm font-medium text-white">{r.pitta}%</p>
                  <p className="text-xs text-slate-500">Pitta</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 mx-auto mb-1" />
                  <p className="text-sm font-medium text-white">{r.kapha}%</p>
                  <p className="text-xs text-slate-500">Kapha</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 border-gradient">
              <h3 className="text-lg font-bold text-white mb-4">Pulse Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard icon={<Heart className="w-6 h-6 text-teal-400" />} label="Heart Rate" value={`${r.heartRate} BPM`} color="bg-teal-500/10" />
                <MetricCard icon={<Activity className="w-6 h-6 text-emerald-400" />} label="Pulse Strength" value={r.pulseStrength} color="bg-emerald-500/10" />
                <MetricCard icon={<TrendingUp className="w-6 h-6 text-cyan-400" />} label="Rhythm" value={r.rhythm} color="bg-cyan-500/10" />
                <MetricCard icon={<Zap className="w-6 h-6 text-amber-400" />} label="Signal Quality" value={`${r.signalQuality}%`} color="bg-amber-500/10" />
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Pulse Waveform */}
        <SectionReveal delay={0.2}>
          <div className="glass-card p-6 mb-8 border-gradient">
            <h3 className="text-lg font-bold text-white mb-4">Captured Pulse Waveform</h3>
            <div className="bg-navy-950/80 rounded-xl p-4">
              <PulseWaveform bpm={r.heartRate} width={800} height={120} color="#2dd4bf" />
            </div>
          </div>
        </SectionReveal>

        {/* AI Observations */}
        <SectionReveal delay={0.25}>
          <div className="glass-card p-8 mb-8 border-gradient">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-teal-400" />
              <h3 className="text-lg font-bold text-white">AI-Assisted Nadi Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {r.observations.map((obs, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    obs.type === "positive" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-sky-500/5 border-sky-500/20"
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {obs.type === "positive" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-sky-400" />}
                    <p className="text-sm font-semibold text-white">{obs.title}</p>
                  </div>
                  <p className="text-sm text-slate-400">{obs.desc}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-6 flex items-center gap-2">
              <Shield className="w-3 h-3" /> This analysis is intended for wellness and informational purposes only. It should not replace professional medical advice.
            </p>
          </div>
        </SectionReveal>

        {/* Wellness Suggestions */}
        <SectionReveal delay={0.3}>
          <div className="glass-card p-8 mb-8 border-gradient">
            <h3 className="text-lg font-bold text-white mb-6">Wellness Suggestions</h3>
            <div className="space-y-3">
              {r.suggestions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <p className="text-sm text-slate-300">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* CTA */}
        <SectionReveal delay={0.35}>
          <div className="text-center">
            <Link to="/analysis" className="btn-glow"><ArrowLeft className="w-4 h-4" /> New Analysis</Link>
            <Link to="/history" className="btn-outline-glow ml-4">View History</Link>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
}
