export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  height?: number;
  weight?: number;
}

export interface AnalysisResult {
  id: string;
  patientId: string;
  date: string;
  heartRate: number;
  pulseStrength: string;
  rhythm: string;
  signalQuality: number;
  vata: number;
  pitta: number;
  kapha: number;
  pattern: string;
  recommendation: string;
}

export const mockPatient: Patient = {
  id: "p-001",
  name: "Priya Sharma",
  age: 34,
  gender: "Female",
  phone: "+91 98765 43210",
  height: 162,
  weight: 58,
};

export const mockAnalysis: AnalysisResult = {
  id: "a-001",
  patientId: "p-001",
  date: "2026-08-19",
  heartRate: 72,
  pulseStrength: "Normal",
  rhythm: "Stable",
  signalQuality: 94,
  vata: 42,
  pitta: 34,
  kapha: 24,
  pattern: "Balanced Pitta-Vata",
  recommendation: "The pulse shows a predominantly Vata pattern with moderate Pitta influence. Consider regular sleep schedule, warm meals, and gentle exercise like walking or yoga.",
};

export const mockHistory: AnalysisResult[] = [
  { ...mockAnalysis, id: "a-001", date: "2026-08-19" },
  { id: "a-002", patientId: "p-001", date: "2026-08-12", heartRate: 68, pulseStrength: "Strong", rhythm: "Stable", signalQuality: 91, vata: 38, pitta: 36, kapha: 26, pattern: "Balanced", recommendation: "Pulse patterns indicate good overall balance. Continue current lifestyle." },
  { id: "a-003", patientId: "p-001", date: "2026-08-05", heartRate: 75, pulseStrength: "Normal", rhythm: "Slightly Irregular", signalQuality: 87, vata: 45, pitta: 32, kapha: 23, pattern: "Elevated Vata", recommendation: "Vata indicators suggest possible stress. Practice meditation and maintain regular routines." },
  { id: "a-004", patientId: "p-001", date: "2026-07-29", heartRate: 70, pulseStrength: "Normal", rhythm: "Stable", signalQuality: 93, vata: 40, pitta: 35, kapha: 25, pattern: "Balanced", recommendation: "Healthy pulse patterns observed. Maintain current wellness routine." },
];

export const doshaInfo = [
  { name: "Vata", subtitle: "Movement · Nervous System · Energy", color: "#38bdf8", icon: "wind", description: "Governs all movement in the body — breathing, blood flow, and nerve impulses." },
  { name: "Pitta", subtitle: "Metabolism · Transformation · Balance", color: "#f59e0b", icon: "flame", description: "Controls digestion, metabolism, and body temperature." },
  { name: "Kapha", subtitle: "Structure · Stability · Strength", color: "#34d399", icon: "droplets", description: "Provides structure, lubrication, and stability to the body." },
];
