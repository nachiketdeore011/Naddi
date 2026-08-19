import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock, Eye, Download, Filter, Search, Calendar,
  Heart, TrendingUp, Activity, ChevronRight
} from "lucide-react";
import SectionReveal from "../components/SectionReveal";

const MOCK_HISTORY = [
  { id: 1, date: "Aug 19, 2026", name: "Priya Sharma", pulse: 72, vata: 42, pitta: 34, kapha: 24, status: "Completed" },
  { id: 2, date: "Aug 17, 2026", name: "Rahul Verma", pulse: 68, vata: 38, pitta: 30, kapha: 32, status: "Completed" },
  { id: 3, date: "Aug 15, 2026", name: "Ananya Patel", pulse: 76, vata: 45, pitta: 28, kapha: 27, status: "Completed" },
  { id: 4, date: "Aug 12, 2026", name: "Vikram Singh", pulse: 65, vata: 35, pitta: 40, kapha: 25, status: "Completed" },
  { id: 5, date: "Aug 10, 2026", name: "Meera Joshi", pulse: 78, vata: 50, pitta: 25, kapha: 25, status: "Completed" },
  { id: 6, date: "Aug 8, 2026", name: "Arjun Nair", pulse: 70, vata: 40, pitta: 35, kapha: 25, status: "Completed" },
  { id: 7, date: "Aug 5, 2026", name: "Kavya Reddy", pulse: 74, vata: 44, pitta: 32, kapha: 24, status: "Completed" },
  { id: 8, date: "Aug 3, 2026", name: "Rohan Gupta", pulse: 69, vata: 36, pitta: 38, kapha: 26, status: "Completed" },
];

function DoshaBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-semibold text-white">{value}%</span>
    </div>
  );
}

export default function History() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <span className="badge-glow mb-3 inline-flex"><Clock className="w-3 h-3" /> ANALYSIS HISTORY</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Analysis <span className="gradient-text-teal">History</span></h1>
              <p className="text-slate-400 mt-2">View all your past Nadi analysis sessions.</p>
            </div>
            <Link to="/analysis" className="btn-glow text-sm">New Analysis <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </SectionReveal>

        {/* Stats */}
        <SectionReveal delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <Activity className="w-5 h-5 text-teal-400" />, label: "Total Analyses", value: MOCK_HISTORY.length.toString() },
              { icon: <Heart className="w-5 h-5 text-emerald-400" />, label: "Avg Heart Rate", value: "72 BPM" },
              { icon: <TrendingUp className="w-5 h-5 text-cyan-400" />, label: "Latest Vata", value: "42%" },
              { icon: <Calendar className="w-5 h-5 text-amber-400" />, label: "Last Session", value: "Today" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                {s.icon}
                <div><p className="text-lg font-bold text-white">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Filter Bar */}
        <SectionReveal delay={0.15}>
          <div className="glass-card p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search by patient name..." className="input-dark pl-10" />
            </div>
            <button className="btn-outline-glow text-sm"><Filter className="w-4 h-4" /> Filter</button>
            <button className="btn-outline-glow text-sm"><Download className="w-4 h-4" /> Export All</button>
          </div>
        </SectionReveal>

        {/* Table */}
        <SectionReveal delay={0.2}>
          <div className="glass-card border-gradient overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pulse</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vata</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pitta</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kapha</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_HISTORY.map((row, i) => (
                    <motion.tr key={row.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-sm text-slate-400">{row.date}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {row.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-sm font-medium text-white">{row.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-sm text-white font-medium">{row.pulse} BPM</td>
                      <td className="p-4 text-center"><DoshaBadge label="V" value={row.vata} color="bg-sky-400" /></td>
                      <td className="p-4 text-center"><DoshaBadge label="P" value={row.pitta} color="bg-amber-400" /></td>
                      <td className="p-4 text-center"><DoshaBadge label="K" value={row.kapha} color="bg-emerald-400" /></td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {row.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to="/results" className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-teal-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-teal-400 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
}
