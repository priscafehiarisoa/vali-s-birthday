"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CatImage from "@/components/CatImage";
import FloatingDecor from "@/components/FloatingDecor";
import content from "@/lib/content";

const { invitation } = content;
const MAX_NO = invitation.noSteps.length;

export default function InvitationPage() {
  const router = useRouter();
  const [noCount, setNoCount] = useState(0);

  // No disappears once every message has been shown.
  const noVisible = noCount < MAX_NO;
  const noScale = Math.max(0.25, 1 - (noCount / MAX_NO) * 0.75);
  const yesScale = Math.min(2.6, 1 + noCount * 0.18);

  const step = noCount > 0 ? invitation.noSteps[noCount - 1] : null;
  const image = step?.image || invitation.image;
  const message = step?.message ?? null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <FloatingDecor />

      {invitation.badge && (
        <motion.p
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -2 }}
          transition={{ type: "spring", stiffness: 260, damping: 12 }}
          className="rounded-full bg-accent px-5 py-1.5 text-lg font-bold shadow-md"
        >
          {invitation.badge}
        </motion.p>
      )}

      <div className="relative">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <CatImage src={image} alt={invitation.imageAlt} size={220} />
        </motion.div>

        {/* Little polaroids on the sides, hidden once the cat gets sad */}
        <AnimatePresence>
          {noCount === 0 &&
            invitation.sideImages.map((img, i) => (
              <motion.img
                key={img.src}
                src={img.src}
                alt={img.alt}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: i === 0 ? -12 : 12 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.15, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 260, damping: 14 }}
                className={`absolute z-10 h-24 w-24 bg-white object-cover p-1.5 pb-4 shadow-lg ${
                  i === 0 ? "-top-4 -left-16" : "-right-16 -bottom-4"
                }`}
              />
            ))}
        </AnimatePresence>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-3xl font-bold leading-tight text-primary-dark sm:text-4xl"
      >
        {invitation.question}
      </motion.h1>
      <p className="max-w-sm text-lg opacity-80">{invitation.subtitle}</p>

      <div className="h-8">
        <AnimatePresence mode="wait">
          {message && (
            <motion.p
              key={message}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="rounded-full bg-white/80 px-4 py-1 text-lg font-semibold shadow"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex min-h-40 flex-wrap items-center justify-center gap-6">
        <motion.button
          type="button"
          onClick={() => router.push("/thanks")}
          animate={{ scale: yesScale }}
          whileHover={{ scale: yesScale * 1.06 }}
          whileTap={{ scale: yesScale * 0.94 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="btn bg-primary-dark px-8 text-xl"
        >
          {invitation.yesLabel}
        </motion.button>

        <AnimatePresence>
          {noVisible && (
            <motion.button
              type="button"
              onClick={() => setNoCount((c) => c + 1)}
              animate={{ scale: noScale }}
              exit={{ scale: 0, opacity: 0, rotate: 90 }}
              whileTap={{ rotate: [0, -10, 10, 0] }}
              transition={{ type: "spring", stiffness: 300, damping: 15, rotate: { type: "tween", duration: 0.3 } }}
              className="btn bg-secondary px-8 text-xl text-ink"
            >
              {invitation.noLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
