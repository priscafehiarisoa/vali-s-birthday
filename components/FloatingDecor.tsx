"use client";

import { motion } from "framer-motion";

const ITEMS = [
  { e: "⭐", x: "8%", y: "12%", d: 0 },
  { e: "🌙", x: "85%", y: "8%", d: 0.6 },
  { e: "💤", x: "90%", y: "55%", d: 1.2 },
  { e: "🐾", x: "5%", y: "70%", d: 0.3 },
  { e: "✨", x: "75%", y: "85%", d: 0.9 },
  { e: "⭐", x: "40%", y: "4%", d: 1.5 },
];

/** Purely decorative floating emojis in the background. */
export default function FloatingDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {ITEMS.map((it, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-60 select-none"
          style={{ left: it.x, top: it.y }}
          animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: it.d, ease: "easeInOut" }}
        >
          {it.e}
        </motion.span>
      ))}
    </div>
  );
}
