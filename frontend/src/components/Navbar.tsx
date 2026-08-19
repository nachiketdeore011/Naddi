import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/analysis", label: "Nadi Analysis" },
  { path: "/results", label: "Insights" },
  { path: "/history", label: "History" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  return (
    <>
      <nav className={"fixed top-0 left-0 right-0 z-50 transition-all duration-500 " + (scrolled ? "glass py-3" : "bg-transparent py-5")}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">NADI<span className="text-teal-400">.AI</span></span>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Ancient Pulse Wisdom</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.path} to={l.path}
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 " + (loc.pathname === l.path ? "text-teal-400 bg-teal-400/10" : "text-slate-400 hover:text-white hover:bg-white/5")}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/analysis" className="hidden sm:inline-flex btn-glow text-sm">Start Analysis</Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-navy-950/95 backdrop-blur-xl pt-24 px-6 md:hidden">
            <div className="space-y-2">
              {navLinks.map((l) => (
                <Link key={l.path} to={l.path}
                  className={"block px-4 py-3 rounded-xl text-lg font-medium transition-colors " + (loc.pathname === l.path ? "text-teal-400 bg-teal-400/10" : "text-slate-300 hover:text-white hover:bg-white/5")}>
                  {l.label}
                </Link>
              ))}
              <Link to="/analysis" className="block btn-glow text-center mt-6 text-lg">Start Nadi Analysis</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
