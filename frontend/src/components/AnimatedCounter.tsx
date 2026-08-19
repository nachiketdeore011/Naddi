import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface Props { end: number; duration?: number; suffix?: string; }

export default function AnimatedCounter({ end, duration = 2000, suffix = "" }: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let s = 0; const step = end / (duration / 16);
    const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}
