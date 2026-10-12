"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import CatImage from "@/components/CatImage";
import FloatingDecor from "@/components/FloatingDecor";
import content from "@/lib/content";

const { thanks, theme } = content;
type Status = "idle" | "loading" | "error" | "success";

export default function ThanksPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const colors = [theme.primary, theme.secondary, theme.accent, theme.primaryDark];
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.35 }, colors });
    const t = setTimeout(
      () => confetti({ particleCount: 60, shapes: ["star"], spread: 120, origin: { y: 0.3 }, colors }),
      500,
    );
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(thanks.nameRequired);
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, allergies }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setTimeout(() => router.push("/info"), 1400);
    } catch {
      setError(thanks.errorMessage);
      setStatus("error");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-5 px-6 py-10 text-center">
      <FloatingDecor />

      {thanks.video ? (
        <motion.video
          src={thanks.video}
          aria-label={thanks.imageAlt}
          autoPlay
          loop
          muted
          playsInline
          initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="w-56 rounded-[2rem] shadow-xl ring-4 ring-white sm:w-64"
        />
      ) : (
        <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <CatImage src={thanks.image} alt={thanks.imageAlt} size={180} />
        </motion.div>
      )}

      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="text-4xl font-bold text-primary-dark"
      >
        {thanks.title}
      </motion.h1>
      <p className="max-w-sm text-lg opacity-80">{thanks.subtitle}</p>

      <motion.form
        onSubmit={onSubmit}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card flex w-full max-w-md flex-col gap-4 text-left"
        noValidate
      >
        <label className="flex flex-col gap-2 font-semibold">
          {thanks.nameLabel} *
          <input
            className="input font-normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={thanks.namePlaceholder}
            maxLength={100}
            required
            autoComplete="name"
          />
        </label>

        <label className="flex flex-col gap-2 font-semibold">
          {thanks.allergiesLabel}
          <textarea
            className="input min-h-28 resize-none font-normal"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder={thanks.allergiesPlaceholder}
            maxLength={1000}
          />
        </label>

        {status === "error" && error && (
          <motion.p initial={{ x: -8 }} animate={{ x: [8, -8, 0] }} className="text-center font-semibold text-red-500">
            {error}
          </motion.p>
        )}
        {status === "success" && (
          <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center font-semibold text-green-600">
            {thanks.successMessage}
          </motion.p>
        )}

        <button type="submit" className="btn w-full text-lg" disabled={status === "loading" || status === "success"}>
          {status === "loading" ? thanks.submittingLabel : thanks.submitLabel}
        </button>
      </motion.form>
    </main>
  );
}
