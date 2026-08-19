import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones,
  CheckCircle2, ArrowRight, Globe, ExternalLink
} from "lucide-react";
import SectionReveal from "../components/SectionReveal";

const CONTACT_INFO = [
  { icon: <Mail className="w-6 h-6" />, label: "Email Us", value: "support@nadi.ai", sub: "We respond within 24 hours", color: "text-teal-400" },
  { icon: <Phone className="w-6 h-6" />, label: "Call Us", value: "+91 98765 43210", sub: "Mon-Fri, 9 AM - 6 PM IST", color: "text-cyan-400" },
  { icon: <MapPin className="w-6 h-6" />, label: "Visit Us", value: "Ayurveda Tech Hub", sub: "Bangalore, Karnataka, India", color: "text-emerald-400" },
  { icon: <Clock className="w-6 h-6" />, label: "Working Hours", value: "Mon - Fri", sub: "9:00 AM - 6:00 PM IST", color: "text-amber-400" },
];

const FAQ = [
  { q: "Is Nadi.AI a medical diagnostic tool?", a: "No. Nadi.AI is designed for wellness and informational purposes only. It provides AI-assisted interpretations of pulse patterns and should not replace professional medical advice." },
  { q: "How does the pulse sensor work?", a: "Our IoT sensor captures the radial pulse at specific Nadi points on the wrist using piezoelectric sensors. The signal is digitized and processed to extract pulse characteristics." },
  { q: "Is my health data secure?", a: "Yes. All patient data is encrypted in transit and at rest. We follow HIPAA-compliant practices and never share your data with third parties without explicit consent." },
  { q: "Can I export my analysis reports?", a: "Yes. You can download your analysis reports as PDF files from the Results or History page. Reports include all pulse metrics, dosha balance, and AI observations." },
  { q: "How accurate is the AI analysis?", a: "Our AI models achieve approximately 94% signal quality in controlled conditions. The analysis is based on established Nadi Parikshan principles enhanced by machine learning." },
  { q: "How often should I get a Nadi analysis?", a: "For general wellness tracking, we recommend periodic analyses at regular intervals. Your healthcare provider can guide you on the appropriate frequency for your needs." },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute top-10 left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <SectionReveal>
            <span className="badge-glow mb-4 inline-flex"><MessageCircle className="w-3 h-3" /> GET IN TOUCH</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact <span className="gradient-text-teal">Us</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Have questions about Nadi.AI? We'd love to hear from you.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_INFO.map((c, i) => (
              <SectionReveal key={c.label} delay={i * 0.1}>
                <div className="glass-card p-6 text-center h-full">
                  <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4 ${c.color}`}>{c.icon}</div>
                  <h3 className="text-sm font-semibold text-white mb-1">{c.label}</h3>
                  <p className="text-lg font-bold text-white mb-1">{c.value}</p>
                  <p className="text-xs text-slate-400">{c.sub}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <SectionReveal>
              <div className="glass-card p-8 border-gradient">
                <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
                <p className="text-sm text-slate-400 mb-6">Fill out the form and we'll get back to you shortly.</p>

                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="py-16 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <p className="text-xl font-bold text-white mb-2">Message Sent!</p>
                    <p className="text-sm text-slate-400">Thank you for reaching out. We'll respond within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Your Name</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Enter your name" className="input-dark" required />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Email</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="you@example.com" className="input-dark" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Subject</label>
                      <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="input-dark" required>
                        <option value="">Select a topic...</option>
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Message</label>
                      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="How can we help you?" rows={5} className="input-dark resize-none" required />
                    </div>
                    <button type="submit" className="btn-glow w-full justify-center">
                      <Send className="w-4 h-4" /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </SectionReveal>

            {/* Support & FAQ */}
            <div className="space-y-6">
              <SectionReveal delay={0.1}>
                <div className="glass-card p-6 border-gradient">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Support</h3>
                  <div className="space-y-4">
                    {[
                      { icon: <Headphones className="w-5 h-5 text-teal-400" />, title: "Live Chat", desc: "Chat with our support team in real time." },
                      { icon: <Globe className="w-5 h-5 text-cyan-400" />, title: "Documentation", desc: "Browse our guides and API documentation." },
                      { icon: <ExternalLink className="w-5 h-5 text-emerald-400" />, title: "Community Forum", desc: "Join discussions and share experiences." },
                    ].map((s) => (
                      <div key={s.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
                        <div className="mt-0.5">{s.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-white">{s.title}</p>
                          <p className="text-xs text-slate-400">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.2}>
                <div className="glass-card p-6 border-gradient">
                  <h3 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-3">
                    {FAQ.map((f, i) => (
                      <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors">
                          <span className="text-sm font-medium text-white pr-4">{f.q}</span>
                          <ArrowRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                        </button>
                        {openFaq === i && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            className="px-4 pb-4">
                            <p className="text-sm text-slate-400">{f.a}</p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
