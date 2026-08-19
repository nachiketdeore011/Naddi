import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Brain, Shield, Zap, Heart, Wind, Flame, Droplets, Eye, Database, FileText, Sparkles, CheckCircle2, Play } from "lucide-react";
import PulseWaveform from "../components/PulseWaveform";
import DoshaChart from "../components/DoshaChart";
import AnimatedCounter from "../components/AnimatedCounter";
import SectionReveal from "../components/SectionReveal";
import PulseScene3D from "../components/PulseScene3D";

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`, animationDuration: `${6 + Math.random() * 6}s`,
          width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
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
          {/* 3D Pulse Visualization */}
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <PulseScene3D />
            {/* Floating glass cards overlaid on the 3D scene */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-8 right-0 glass-card p-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-teal-400" />
                </div>
                <div><p className="text-xs text-slate-500">Pulse Detected</p><p className="text-lg font-bold text-white">72 BPM</p></div>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-12 left-0 glass-card p-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div><p className="text-xs text-slate-500">Pattern</p><p className="text-sm font-semibold text-white">Stable</p></div>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }}
              className="absolute top-1/2 -left-4 glass-card p-3 z-10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <div><p className="text-xs text-slate-500">Signal</p><p className="text-sm font-semibold text-white">94%</p></div>
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
          <p className="text-slate-400 max-w-xl mx-auto">Watch your pulse waveform in real time.</p>
        </SectionReveal>
        <SectionReveal delay={0.2}>
          <div className="glass-card p-8 max-w-4xl mx-auto border-gradient">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div><h3 className="text-white font-semibold">Pulse Rhythm</h3></div>
              <div className="flex items-center gap-6">
                <div className="text-center"><p className="text-3xl font-bold text-teal-400">72</p><p className="text-xs text-slate-500">BPM</p></div>
                <div className="text-center"><p className="text-3xl font-bold text-emerald-400">94%</p><p className="text-xs text-slate-500">Quality</p></div>
              </div>
            </div>
            <div className="bg-navy-950/80 rounded-xl p-4"><PulseWaveform bpm={72} width={900} height={140} color="#2dd4bf" /></div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <Activity className="w-6 h-6" />, title: "Pulse Capture", desc: "IoT sensor captures radial pulse at multiple Nadi points." },
    { icon: <Brain className="w-6 h-6" />, title: "AI Analysis", desc: "ML models analyze pulse patterns to detect doshas." },
    { icon: <Eye className="w-6 h-6" />, title: "Real-time Viz", desc: "Watch your pulse waveform in real time." },
    { icon: <Database className="w-6 h-6" />, title: "Health Records", desc: "Store and access your analysis history." },
    { icon: <Shield className="w-6 h-6" />, title: "Privacy First", desc: "HIPAA-compliant encrypted data storage." },
    { icon: <FileText className="w-6 h-6" />, title: "Reports", desc: "Comprehensive wellness reports with AI observations." },
    { icon: <Zap className="w-6 h-6" />, title: "Instant Results", desc: "Results within seconds of capture." },
    { icon: <Heart className="w-6 h-6" />, title: "Wellness Tracking", desc: "Monitor dosha balance over time." },
  ];
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-16">
          <span className="badge-glow mb-4 inline-flex"><Zap className="w-3 h-3" /> CAPABILITIES</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ancient Wisdom, <span className="gradient-text">Modern Technology</span></h2>
        </SectionReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <SectionReveal key={f.title} delay={i * 0.05}>
              <div className="glass-card p-6 h-full group">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Capture", desc: "Place your wrist on the IoT sensor." },
    { num: "02", title: "Process", desc: "Filtering, noise removal, and peak detection." },
    { num: "03", title: "Analyze", desc: "AI identifies dosha patterns." },
    { num: "04", title: "Visualize", desc: "Intuitive charts and visual insights." },
    { num: "05", title: "Report", desc: "Personalized wellness report generated." },
  ];
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How <span className="gradient-text-teal">Nadi Analysis</span> Works</h2>
        </SectionReveal>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <SectionReveal key={s.num} delay={i * 0.1}>
              <div className="glass-card p-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl step-active flex items-center justify-center text-white font-bold">{s.num}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DoshaWisdomSection() {
  const doshas = [
    { name: "Vata", subtitle: "Movement, Energy", icon: <Wind className="w-8 h-8" />, desc: "Governs movement, breathing, blood flow, nerve impulses." },
    { name: "Pitta", subtitle: "Metabolism, Balance", icon: <Flame className="w-8 h-8" />, desc: "Controls digestion, metabolism, body temperature." },
    { name: "Kapha", subtitle: "Structure, Strength", icon: <Droplets className="w-8 h-8" />, desc: "Provides structure, lubrication, and stability." },
  ];
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ancient Knowledge. <span className="gradient-text">Reimagined Digitally.</span></h2>
        </SectionReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doshas.map((d, i) => (
            <SectionReveal key={d.name} delay={i * 0.15}>
              <div className="glass-card p-8 text-center h-full group">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/80 group-hover:scale-110 transition-transform">{d.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{d.name}</h3>
                <p className="text-sm text-teal-400 font-medium mb-4">{d.subtitle}</p>
                <p className="text-sm text-slate-400">{d.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
        <SectionReveal delay={0.3}>
          <div className="mt-16 glass-card p-8 max-w-2xl mx-auto border-gradient text-center">
            <h3 className="text-xl font-bold text-white mb-6">Dosha Balance Example</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <DoshaChart vata={42} pitta={34} kapha={24} size={180} />
              <div className="text-left space-y-3">
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-sky-400" /><span className="text-sm text-slate-300">Vata - 42%</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-sm text-slate-300">Pitta - 34%</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-sm text-slate-300">Kapha - 24%</span></div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

function LiveExperienceSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="text-center mb-12">
          <span className="badge-glow mb-4 inline-flex"><Play className="w-3 h-3" /> LIVE EXPERIENCE</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Your Pulse, <span className="gradient-text-teal">Visualized</span></h2>
        </SectionReveal>
        <SectionReveal delay={0.2}>
          <div className="glass-card p-6 md:p-10 border-gradient max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-navy-950/80 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Pulse Waveform</h3>
                <PulseWaveform bpm={72} width={700} height={160} color="#2dd4bf" />
              </div>
              <div className="space-y-4">
                {[{ l: "Heart Rate", v: "72 BPM", c: "text-teal-400" }, { l: "Quality", v: "94%", c: "text-emerald-400" }, { l: "Strength", v: "Normal", c: "text-cyan-400" }, { l: "Rhythm", v: "Stable", c: "text-amber-400" }].map((m) => (
                  <div key={m.l} className="bg-navy-950/80 rounded-xl p-4 flex items-center justify-between"><span className="text-sm text-slate-400">{m.l}</span><span className={`text-xl font-bold ${m.c}`}>{m.v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-card p-10 border-gradient">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ end: 1250, suffix: "+", label: "Analyses" }, { end: 340, suffix: "+", label: "Patients" }, { end: 98, suffix: "%", label: "Accuracy" }, { end: 5, suffix: "", label: "Nadi Points" }].map((s) => (
              <div key={s.label}><p className="text-4xl md:text-5xl font-bold gradient-text-teal mb-2"><AnimatedCounter end={s.end} suffix={s.suffix} /></p><p className="text-sm text-slate-400">{s.label}</p></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <SectionReveal>
          <div className="glass-card p-12 md:p-16 text-center border-gradient relative overflow-hidden">
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-teal-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Begin Your Nadi Analysis Journey</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">Experience AI-assisted pulse analysis with traditional Nadi Parikshan principles.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/analysis" className="btn-glow text-lg px-8 py-4">Start Analysis <ArrowRight className="w-5 h-5" /></Link>
                <Link to="/about" className="btn-outline-glow text-lg px-8 py-4">Learn More</Link>
              </div>
              <p className="text-xs text-slate-600 mt-8">For wellness and informational purposes only. Not a medical diagnosis.</p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

export default function Landing() {
  return (<>
    <HeroSection />
    <PulseSection />
    <FeaturesSection />
    <HowItWorksSection />
    <DoshaWisdomSection />
    <LiveExperienceSection />
    <StatsSection />
    <CTASection />
  </>);
}

