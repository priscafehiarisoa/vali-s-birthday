"use client";

import { motion } from "framer-motion";
import { useState, type CSSProperties } from "react";
import content from "@/lib/content";

const poster = content.info.informations.poster;

// Cut-out "ransom note" letter colours: [paper, ink]
const LETTER_COLORS = [
  ["#f9a8d4", "#2f5233"],
  ["#4c5fd5", "#a5f3fc"],
  ["#a855f7", "#fde68a"],
  ["#4ade80", "#7c2d12"],
  ["#be123c", "#fecdd3"],
  ["#facc15", "#78350f"],
  ["#fb923c", "#1e3a8a"],
];
const SUB_COLORS = ["#ec4899", "#22c55e", "#3b82f6", "#f97316", "#a855f7", "#eab308", "#14b8a6"];
const tilt = (i: number) => ((i * 37) % 11) - 5; // deterministic pseudo-random rotation

const STICKER_SPOTS: CSSProperties[] = [
  { top: "17%", left: "3%" },
  { top: "12%", right: "4%" },
  { top: "25%", right: "6%" },
  { top: "50%", left: "4%" },
  { bottom: "26%", right: "8%" },
];

function Sticker({ children, style, delay }: { children: React.ReactNode; style: CSSProperties; delay: number }) {
  return (
    <motion.span
      className="absolute z-20 text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)] select-none"
      style={style}
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 12 }}
    >
      {children}
    </motion.span>
  );
}

export default function Poster() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -2, y: 20 }}
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-xl bg-[#e8e4dc] shadow-2xl ring-8 ring-white"
    >
      {/* Photo, black & white with a halftone dot overlay */}
      {!photoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster.photo}
          alt={poster.photoAlt}
          onError={() => setPhotoFailed(true)}
          className="absolute inset-0 h-full w-full object-cover  contrast-125"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10rem] grayscale">🐱</div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 "
        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1.4px)", backgroundSize: "5px 5px" }}
      />

      {/* Header */}
      <p className="font-hand absolute top-[2%] left-0 right-0 z-10 text-center text-2xl text-black">
        {poster.invitedText}
      </p>

      <h2 className="absolute top-[8%] left-0 right-0 z-10 flex justify-center gap-0.5 px-2" aria-label={poster.name}>
        {poster.name.split("").map((ch, i) => {
          const [bg, fg] = LETTER_COLORS[i % LETTER_COLORS.length];
          return (
            <motion.span
              key={i}
              aria-hidden
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 300, damping: 14 }}
              className="font-cutout inline-block px-1 text-5xl leading-none sm:text-6xl"
              style={{
                color: bg,
                WebkitTextStroke: `2px ${fg}`,
                textShadow: `3px 3px 0 ${fg}, 5px 5px 0 rgba(255,255,255,0.8)`,
                rotate: `${tilt(i)}deg`,
              }}
            >
              {ch}
            </motion.span>
          );
        })}
      </h2>

      <div className="absolute top-[23%] left-[5%] z-10 flex flex-wrap gap-x-0.5" aria-label={poster.subtitle}>
        {poster.subtitle.toUpperCase().split("").map((ch, i) => (
          <span
            key={i}
            aria-hidden
            className="font-cutout text-2xl drop-shadow-[1px_1px_0_white]"
            style={{ color: SUB_COLORS[i % SUB_COLORS.length], rotate: `${tilt(i + 3)}deg` }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>

      {poster.age && (
        <p
          className="font-cutout absolute top-[20%] right-[6%] z-10 rotate-6 text-6xl"
          style={{ color: "#ec4899", WebkitTextStroke: "2px #fff", textShadow: "4px 4px 0 #84cc16" }}
        >
          {poster.age}
        </p>
      )}

      <p className="absolute top-[30%] left-[6%] z-10 font-serif text-lg font-bold text-black drop-shadow-[0_0_3px_white]">
        {poster.hashtag}
      </p>

      {/* Date: lined notebook paper scrap */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-[25%] left-[3%] z-10 -rotate-3 px-4 py-2 shadow-lg"
        style={{
          background: "repeating-linear-gradient(#fff 0 14px, #bfdbfe 14px 15px)",
          clipPath: "polygon(2% 4%, 98% 0, 100% 96%, 0 100%)",
        }}
      >
        <p className="font-cutout text-3xl leading-none" style={{ color: "#db2777" }}>
          {poster.dateLine1}
        </p>
        <p className="font-cutout text-3xl leading-none" style={{ color: "#3b82f6" }}>
          {poster.dateLine2}
        </p>
      </motion.div>

      {/* Time: washi tape */}
      <motion.p
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="font-cutout absolute bottom-[15%] left-[4%] z-10 rotate-2 bg-[#f5ecd7]/95 px-5 py-1 text-4xl shadow-md"
        style={{ color: "#c026d3" }}
      >
        {poster.time}
      </motion.p>

      {/* Dress code: hand-drawn star */}
      <motion.div
        initial={{ scale: 0, rotate: 40 }}
        animate={{ scale: 1, rotate: -8 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 12 }}
        className="absolute right-[2%] bottom-[18%] z-10 flex h-36 w-36 items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-[#fbcfe8]"
          style={{
            clipPath:
              "polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            backgroundImage:
              "linear-gradient(#0001 1px, transparent 1px), linear-gradient(90deg, #0001 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
        <p className="font-hand relative mt-3 w-20 text-center text-lg leading-tight font-bold text-black">
          {poster.dressCode}
        </p>
      </motion.div>

      {/* Address: kraft paper label */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.05 }}
        className="absolute right-[2%] bottom-[2%] z-10 -rotate-3 bg-[#c8a77e] px-4 py-2 text-right shadow-lg"
        style={{ clipPath: "polygon(0 8%, 100% 0, 98% 100%, 3% 92%)" }}
      >
        <p className="font-cutout text-lg text-black">{poster.address}</p>
        <p className="font-serif text-sm text-black">{poster.addressDetail}</p>
      </motion.div>

      {poster.stickers.map((s, i) => (
        <Sticker key={i} style={STICKER_SPOTS[i % STICKER_SPOTS.length]} delay={1.2 + i * 0.1}>
          {s}
        </Sticker>
      ))}
    </motion.div>
  );
}
