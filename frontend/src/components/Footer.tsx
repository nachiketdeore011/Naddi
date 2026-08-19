import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div>
              <span className="text-white font-bold text-lg">NADI<span className="text-teal-400">.AI</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">Ancient pulse wisdom meets intelligent healthcare technology.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/analysis" className="hover:text-teal-400 transition-colors">Nadi Analysis</Link></li>
              <li><Link to="/results" className="hover:text-teal-400 transition-colors">Insights Dashboard</Link></li>
              <li><Link to="/history" className="hover:text-teal-400 transition-colors">Analysis History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-teal-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">&copy; 2026 NADI.AI. All rights reserved.</p>
          <p className="text-xs text-slate-600">Wellness tool - not a substitute for medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
