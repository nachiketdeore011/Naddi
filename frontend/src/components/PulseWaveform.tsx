import { useEffect, useRef } from "react";

interface Props { bpm?: number; width?: number; height?: number; color?: string; }

export default function PulseWaveform({ bpm = 72, width = 600, height = 120, color = "#2dd4bf" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offset = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      const period = (60 / bpm) * 60;
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.shadowColor = color; ctx.shadowBlur = 12;
      for (let x = 0; x < width; x++) {
        const t = (x + offset.current) / period;
        const c = t - Math.floor(t);
        let y = mid;
        if (c < 0.1) y = mid - Math.sin(c / 0.1 * Math.PI) * (mid * 0.7);
        else if (c < 0.15) y = mid + Math.sin((c - 0.1) / 0.05 * Math.PI) * (mid * 0.15);
        else if (c < 0.2) y = mid - Math.sin((c - 0.15) / 0.05 * Math.PI) * (mid * 0.25);
        else y = mid + Math.sin((c - 0.2) / 0.8 * Math.PI * 2) * 3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      offset.current += 2;
      animId = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(animId);
  }, [bpm, width, height, color]);
  return <canvas ref={canvasRef} width={width} height={height} className="w-full" style={{ maxWidth: width }} />;
}
