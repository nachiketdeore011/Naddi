import jsPDF from "jspdf";

interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  date: string;
}

interface AnalysisData {
  patient: PatientInfo;
  vata: number;
  pitta: number;
  kapha: number;
  heartRate: number;
  pulseStrength: string;
  rhythm: string;
  signalQuality: number;
  observations: { title: string; desc: string }[];
  suggestions: string[];
}

export async function generateAnalysisPDF(data: AnalysisData): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const navy: [number, number, number] = [6, 14, 26];
  const teal: [number, number, number] = [45, 212, 191];
  const white: [number, number, number] = [255, 255, 255];
  const slate: [number, number, number] = [148, 163, 184];
  const dark: [number, number, number] = [15, 23, 42];

  // Header
  pdf.setFillColor(...navy);
  pdf.rect(0, 0, pageWidth, 45, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...white);
  pdf.text("NADI.AI", margin, 20);
  pdf.setFontSize(10);
  pdf.setTextColor(...teal);
  pdf.text("Nadi Analysis Report", margin, 28);
  pdf.setFontSize(8);
  pdf.setTextColor(...slate);
  pdf.text("Generated on " + data.patient.date, margin, 35);

  // Patient Info
  let y = 55;
  pdf.setFillColor(...dark);
  pdf.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text("Patient Information", margin + 8, y + 10);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...slate);
  pdf.text("Name: " + data.patient.name, margin + 8, y + 18);
  pdf.text("Age: " + data.patient.age + " years  |  Gender: " + data.patient.gender, margin + 8, y + 24);

  // Dosha Balance
  y += 40;
  pdf.setFillColor(...dark);
  pdf.roundedRect(margin, y, contentWidth, 50, 3, 3, "F");
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text("Dosha Balance", margin + 8, y + 12);
  const barY = y + 20;
  const barWidth = contentWidth - 16;
  const doshas = [
    { name: "Vata", value: Math.round(data.vata), color: [56, 189, 248] as [number, number, number] },
    { name: "Pitta", value: Math.round(data.pitta), color: [251, 191, 36] as [number, number, number] },
    { name: "Kapha", value: Math.round(data.kapha), color: [52, 211, 153] as [number, number, number] },
  ];
  doshas.forEach((d, i) => {
    const by = barY + i * 10;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...slate);
    pdf.text(d.name, margin + 8, by + 3);
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(margin + 35, by, barWidth - 50, 4, 2, 2, "F");
    const fillWidth = ((barWidth - 50) * d.value) / 100;
    pdf.setFillColor(...d.color);
    pdf.roundedRect(margin + 35, by, fillWidth, 4, 2, 2, "F");
    pdf.setTextColor(...white);
    pdf.text(d.value + "%", margin + barWidth - 8, by + 3);
  });

  // Pulse Metrics
  y += 60;
  pdf.setFillColor(...dark);
  pdf.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text("Pulse Metrics", margin + 8, y + 12);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...teal);
  pdf.text("Heart Rate: " + data.heartRate + " BPM  |  Strength: " + data.pulseStrength + "  |  Rhythm: " + data.rhythm + "  |  Quality: " + data.signalQuality + "%", margin + 8, y + 20);

  // AI Observations
  y += 38;
  const obsHeight = 12 + data.observations.length * 16;
  if (y + obsHeight > pageHeight - 40) { pdf.addPage(); y = 20; }
  pdf.setFillColor(...dark);
  pdf.roundedRect(margin, y, contentWidth, obsHeight, 3, 3, "F");
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text("AI-Assisted Nadi Insights", margin + 8, y + 10);
  data.observations.forEach((obs, i) => {
    const oy = y + 20 + i * 16;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...teal);
    pdf.text(obs.title, margin + 8, oy);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...slate);
    const lines = pdf.splitTextToSize(obs.desc, contentWidth - 16);
    pdf.text(lines, margin + 8, oy + 5);
  });

  // Wellness Suggestions
  y += obsHeight + 8;
  const sugHeight = 12 + data.suggestions.length * 7;
  if (y + sugHeight > pageHeight - 30) { pdf.addPage(); y = 20; }
  pdf.setFillColor(...dark);
  pdf.roundedRect(margin, y, contentWidth, sugHeight, 3, 3, "F");
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text("Wellness Suggestions", margin + 8, y + 10);
  data.suggestions.forEach((s, i) => {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...slate);
    pdf.text((i + 1) + ". " + s, margin + 8, y + 18 + i * 7);
  });

  // Disclaimer
  const disY = pageHeight - 20;
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...slate);
  pdf.text("Disclaimer: This analysis is intended for wellness and informational purposes only. It should not replace professional medical advice.", pageWidth / 2, disY, { align: "center" });
  pdf.text("Powered by NADI.AI - Ancient Pulse Wisdom, Intelligent Healthcare", pageWidth / 2, disY + 5, { align: "center" });

  pdf.save("Nadi-Report-" + data.patient.name.replace(/\s+/g, "-") + "-" + data.patient.date.replace(/\s+/g, "-") + ".pdf");
}
