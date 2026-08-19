import { motion } from "framer-motion";

interface Props { vata: number; pitta: number; kapha: number; size?: number; }

export default function DoshaChart({ vata, pitta, kapha, size = 200 }: Props) {
  const r = size / 2 - 20, cx = size / 2, cy = size / 2, total = vata + pitta + kapha;
  const segs = [{ pct: vata/total, color: "#38bdf8" }, { pct: pitta/total, color: "#f59e0b" }, { pct: kapha/total, color: "#34d399" }];
  let a = -Math.PI / 2;
  const arcs = segs.map(s => {
    const sa = a, ea = a + s.pct * 2 * Math.PI; a = ea;
    const x1 = cx+r*Math.cos(sa), y1 = cy+r*Math.sin(sa);
    const x2 = cx+r*Math.cos(ea), y2 = cy+r*Math.sin(ea);
    return { ...s, d: "M "+cx+" "+cy+" L "+x1+" "+y1+" A "+r+" "+r+" 0 "+(s.pct>0.5?1:0)+" 1 "+x2+" "+y2+" Z" };
  });
  return (
    <svg width={size} height={size} viewBox={"0 0 "+size+" "+size}>
      {arcs.map((ar, i) => (
        <motion.path key={i} d={ar.d} fill={ar.color} fillOpacity={0.85}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.2, duration: 0.6 }}
          style={{ transformOrigin: cx+"px "+cy+"px" }} />
      ))}
      <circle cx={cx} cy={cy} r={r*0.45} fill="#0a1628" />
      <text x={cx} y={cy-5} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">Balance</text>
      <text x={cx} y={cy+15} textAnchor="middle" fill="#94a3b8" fontSize="11">Dosha Ratio</text>
    </svg>
  );
}
