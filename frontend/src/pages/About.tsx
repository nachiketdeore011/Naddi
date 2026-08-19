import { Link } from "react-router-dom";
import {
  ArrowRight, Shield, Wind, Flame, Droplets,
  Target, Users, Globe, BookOpen, Sparkles
} from "lucide-react";
import DoshaChart from "../components/DoshaChart";
import AnimatedCounter from "../components/AnimatedCounter";
import SectionReveal from "../components/SectionReveal";

const TEAM = [
  { name: "Dr. Anand Krishnan", role: "Chief Science Officer", initials: "AK", bio: "Ayurvedic physician with 15+ years of Nadi Parikshan experience." },
  { name: "Priya Mehta", role: "Head of AI Research", initials: "PM", bio: "ML engineer specializing in biomedical signal processing." },
  { name: "Rajesh Kumar", role: "IoT Systems Lead", initials: "RK", bio: "Embedded systems expert building precision pulse sensors." },
  { name: "Sneha Patel", role: "Product Designer", initials: "SP", bio: "Healthcare UX designer focused on accessibility and trust." },
];

const DOSHA_INFO = [
  { name: "Vata", subtitle: "Air + Space", icon: <Wind className="w-8 h-8" />, color: "from-sky-400 to-blue-500", desc: "Governs movement, breathing, blood circulation, nerve impulses, and sensory perception. When balanced, Vata promotes creativity, vitality, and mental clarity." },
  { name: "Pitta", subtitle: "Fire + Water", icon: <Flame className="w-8 h-8" />, color: "from-amber-400 to-orange-500", desc: "Controls digestion, metabolism, body temperature, and intellectual capacity. Balanced Pitta brings courage, leadership, and a healthy glow." },
  { name: "Kapha", subtitle: "Earth + Water", icon: <Droplets className="w-8 h-8" />, color: "from-emerald-400 to-green-500", desc: "Provides structure, lubrication, stability, and immunity. Balanced Kapha brings calmness, loyalty, and physical strength." },
];

export default function About() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <SectionReveal>
            <span className="badge-glow mb-6 inline-flex"><Sparkles className="w-3 h-3" /> ABOUT NADI.AI</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ancient Wisdom.<br /><span className="gradient-text">Reimagined Digitally.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Nadi.AI bridges thousands of years of Ayurvedic pulse diagnosis tradition with modern IoT sensors and AI analysis,
              making Nadi Parikshan accessible, consistent, and data-driven.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <SectionReveal>
            <div className="glass-card p-10 border-gradient">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {[
                  { icon: <Target className="w-8 h-8 text-teal-400" />, title: "Our Mission", desc: "Democratize traditional pulse diagnosis with affordable, consistent, AI-assisted technology." },
                  { icon: <Globe className="w-8 h-8 text-cyan-400" />, title: "Our Vision", desc: "A world where ancient Ayurvedic wisdom is enhanced by modern technology for preventive healthcare." },
                  { icon: <Shield className="w-8 h-8 text-emerald-400" />, title: "Our Promise", desc: "Never replace medical professionals. Always provide wellness insights, not diagnoses." },
                ].map((item) => (
                  <div key={item.title}>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <SectionReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { end: 5000, suffix: "+", label: "Years of Tradition" },
                { end: 1250, suffix: "+", label: "Analyses Performed" },
                { end: 340, suffix: "+", label: "Patients Served" },
                { end: 5, suffix: "", label: "Nadi Points Analyzed" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl md:text-4xl font-bold gradient-text-teal mb-2">
                    <AnimatedCounter end={s.end} suffix={s.suffix} />
                  </p>
                  <p className="text-sm text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Nadi Parikshan */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <SectionReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Understanding <span className="gradient-text-teal">Nadi Parikshan</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Nadi Parikshan is the ancient Ayurvedic science of pulse diagnosis. By examining the pulse at specific points on the wrist,
              practitioners assess the balance of three fundamental bio-energies or doshas.
            </p>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DOSHA_INFO.map((d, i) => (
              <SectionReveal key={d.name} delay={i * 0.15}>
                <div className="glass-card p-8 text-center h-full group">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${d.color} bg-opacity-10 flex items-center justify-center mx-auto mb-6 text-white/80 group-hover:scale-110 transition-transform`}>
                    {d.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{d.name}</h3>
                  <p className="text-sm text-teal-400 font-medium mb-4">{d.subtitle}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{d.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dosha Balance Visual */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <SectionReveal>
            <div className="glass-card p-8 border-gradient text-center">
              <h3 className="text-xl font-bold text-white mb-6">Balanced Dosha Harmony</h3>
              <div className="flex justify-center">
                <DoshaChart vata={33} pitta={34} kapha={33} size={200} />
              </div>
              <p className="text-sm text-slate-400 mt-6">
                An ideal state where all three doshas are in harmony, promoting overall wellness and vitality.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <SectionReveal className="text-center mb-12">
            <span className="badge-glow mb-4 inline-flex"><Users className="w-3 h-3" /> OUR TEAM</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Meet the <span className="gradient-text">Team</span></h2>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((t, i) => (
              <SectionReveal key={t.name} delay={i * 0.1}>
                <div className="glass-card p-6 text-center h-full group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {t.initials}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-sm text-teal-400 font-medium mb-3">{t.role}</p>
                  <p className="text-xs text-slate-400">{t.bio}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <SectionReveal>
            <div className="glass-card p-12 text-center border-gradient">
              <BookOpen className="w-10 h-10 text-teal-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Experience Nadi.AI</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Ready to explore AI-assisted pulse analysis? Start your first Nadi analysis today.
              </p>
              <Link to="/analysis" className="btn-glow text-lg px-8 py-4">
                Start Analysis <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-slate-600 mt-6">
                For wellness and informational purposes only. Not a medical diagnosis.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
