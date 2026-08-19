const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');
fs.mkdirSync(dir, { recursive: true });

function write(relPath, content) {
  const full = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Wrote', relPath, '(' + content.length + ' bytes)');
}

write('src/pages/Landing.tsx', `
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Activity, Brain, Shield, Zap, Heart, Wind, Flame,
  Droplets, Eye, Database, FileText, Sparkles, CheckCircle2, Play,
} from "lucide-react";
import PulseWaveform from "../components/PulseWaveform";
import DoshaChart from "../components/DoshaChart";
import AnimatedCounter from "../components/AnimatedCounter";
import SectionReveal from "../components/SectionReveal";

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="particle" style={{
          left: \`\${Math.random() * 100}%\`, top: \`\${Math.random() * 100}%\`,
          animationDelay: \`\${Math.random() * 8}s\`, animationDuration: \`\${6 + Math.random() * 6}s\`,
          width: \`\${2 + Math.random() * 3}px\`, height: \`\${2 + Math.random() * 3}px\`,
        }} />
      ))}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <Particles />
      <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge-glow mb-6 inline-flex"><Sparkles className="w-3 h-3" /> AI-ASSISTED NADI ANALYSIS</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Understand Your <span className="gradient-text">Health</span><br />Through Your <span className="gradient-text-teal">Pulse</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-slate-400 leading-relaxed max-w-lg mb-8">
            Experience the intersection of traditional Nadi Parikshan and modern intelligent technology.
            Analyze pulse patterns and visualize health insights through an intuitive digital experience.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-10">
            <Link to="/analysis" className="btn-glow text-base">Start Nadi Analysis <ArrowRight className="w-4 h-4" /></Link>
            <a href="#how-it-works" className="btn-outline-glow text-base">Explore How It Works</a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-6">
            {[{ icon: <CheckCircle2 className="w-4 h-4" />, text: "Traditional Nadi Principles" },
              { icon: <CheckCircle2 className="w-4 h-4" />, text: "AI-Assisted Analysis" },
              { icon: <CheckCircle2 className="w-4 h-4" />, text: "Secure Patient Data" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-teal-500">{item.icon}</span> {item.text}
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="pulse-ring w-80 h-80" style={{ animationDelay: "0s" }} />
            <div className="pulse-ring w-80 h-80" style={{ animationDelay: "0.7s" }} />
            <div className="pulse-ring w-80 h-80" style={{ animationDelay: "1.4s" }} />
          </div>
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border border-teal-500/20 flex items-center justify-center">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-navy-900 to-navy-950 border border-teal-500/10 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-16 h-16 text-teal-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm text-slate-400">Nadi Signal</p>
                </div>
              </div>
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-4 right-0 glass-card p-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-teal-400" />
                </div>
                <div><p className="text-xs text-slate-500">Pulse Detected</p><p className="text-lg font-bold text-white">72 BPM</p></div>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-8 left-0 glass-card p-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div><p className="text-xs text-slate-500">Pattern</p><p className="text-sm font-semibold text-white">Stable</p></div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PulseSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <SectionReveal className="text-center mb-12">
          <span className="badge-glow mb-4 inline-flex"><Activity className="w-3 h-3" /> REAL-TIME SIGNAL</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Pulse, <span className="gradient-text-teal">Visualized</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">Watch your pulse waveform in real time as the system captures and processes your Nadi signal.</p>
        </SectionReveal>
        <SectionReveal delay={0.2}>
          <div className="glass-card p-8 max-w-4xl mx-auto border-gradient">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div><h3 className="text-white font-semibold">Pulse Rhythm</h3><p className="text-sm text-slate-500">Real-time Pulse Signal</p></div>
              <div className="flex items-center gap-6">
                <div className="text-center"><p className="text-3xl font-bold text-teal-400">72</p><p className="text-xs text-slate-500">BPM</p></div>
                <div className="text-center"><p className="text-3xl font-bold text-emerald-400">94%</p><p className="text-xs text-slate-500">Quality</p></div>
                <div className="text-center"><p className="text-lg font-bold text-cyan-400">Stable</p><p className="text-xs text-slate-500">Rhythm</p></div>
        
