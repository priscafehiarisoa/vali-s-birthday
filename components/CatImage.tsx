"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/** Cat image with a cute emoji fallback if the file in /public/cats is missing. */
export default function CatImage({ src, alt, size = 200 }: { src: string; alt: string; size?: number }) {
  const [failed, setFailed] = useState<string | null>(null);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {failed === src ? (
          <motion.span
            key={`fallback-${src}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            style={{ fontSize: size * 0.6 }}
            role="img"
            aria-label={alt}
          >
            🐱
          </motion.span>
        ) : (
          <motion.img
            key={src}
            src={src}
            alt={alt}
            onError={() => setFailed(src)}
            initial={{ scale: 0.8, opacity: 0, rotate: -4 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="h-full w-full rounded-[2rem] object-cover shadow-xl ring-4 ring-white"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
