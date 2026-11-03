"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import FloatingDecor from "@/components/FloatingDecor";
import Icon from "@/components/Icon";
import content from "@/lib/content";
import type { Guest } from "@/lib/db";

const { paid: t, theme } = content;
type State = "loading" | "locked" | "ready";
type Filter = "all" | "unpaid" | "paid";

const money = (n: number) => `${n.toLocaleString("fr-FR")} ${t.currency}`;

export default function PaidChecklistPage() {
  const [state, setState] = useState<State>("loading");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/guests", { cache: "no-store" }).then(async (res) => {
      if (!res.ok) return setState("locked");
      setGuests((await res.json()).guests);
      setState("ready");
    });
  }, []);

  async function toggle(g: Guest) {
    const paid = !g.paid;
    setSaving(g.id);
    setError(false);
    // Optimistic update so the checkbox feels instant
    setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, paid: paid ? 1 : 0 } : x)));
    const res = await fetch(`/api/guests?id=${g.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid }),
    });
    setSaving(null);
    if (!res.ok) {
      setError(true);
      setGuests((list) => list.map((x) => (x.id === g.id ? g : x)));
      return;
    }
    const updated: Guest[] = (await res.json()).guests;
    setGuests(updated);
    if (paid && updated.length > 0 && updated.every((x) => x.paid)) {
      confetti({ particleCount: 150, spread: 100, colors: [theme.primary, theme.accent, theme.secondary] });
    }
  }

  const paidCount = guests.filter((g) => g.paid).length;
  const total = guests.length;
  const percent = total ? Math.round((paidCount / total) * 100) : 0;
  const sorted = [...guests].sort((a, b) => a.paid - b.paid || a.name.localeCompare(b.name));
  const visible = sorted.filter((g) => filter === "all" || (filter === "paid" ? g.paid : !g.paid));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-10">
      <FloatingDecor />
      <h1 className="text-center text-3xl font-bold text-primary-dark">{t.title}</h1>

      {state === "loading" && <p className="animate-pulse">{t.loading}</p>}

      {state === "locked" && (
        <div className="card flex flex-col items-center gap-4 text-center">
          <p>{t.loginRequired}</p>
          <Link href="/guest" className="btn">
            <Icon name="lock" size={20} className="mr-1.5" /> {t.loginLink}
          </Link>
        </div>
      )}

      {state === "ready" && (
        <>
          <p className="text-center opacity-80">{t.subtitle}</p>

          {/* Progress */}
          <div className="card flex w-full flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {t.progressLabel.replace("{paid}", String(paidCount)).replace("{total}", String(total))}
              </span>
              <span className="text-lg font-semibold text-primary-dark">{percent}%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-bg-alt">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                animate={{ width: `${percent}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            {/* <div className="flex justify-between text-sm">
            
              <span>
                {t.collectedLabel} : <b>{money(paidCount * t.amountPerGuest)}</b>
              </span>
              <span className="opacity-70">
                {t.expectedLabel} : {money(total * t.amountPerGuest)}
              </span>
            </div> */}
            {total > 0 && paidCount === total && (
              <p className="text-center font-semibold text-green-600">{t.allPaid}</p>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 rounded-full bg-white/80 p-1 shadow">
            {(
              [
                ["all", t.filterAll],
                ["unpaid", t.filterUnpaid],
                ["paid", t.filterPaid],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  filter === key ? "bg-primary text-ink shadow" : "opacity-70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && <p className="font-semibold text-red-500">{t.error}</p>}

          {total === 0 ? (
            <p className="card text-center">{t.empty}</p>
          ) : (
            <ul className="flex w-full flex-col gap-3">
              <AnimatePresence initial={false}>
                {visible.map((g) => (
                  <motion.li
                    key={g.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={!!g.paid}
                      disabled={saving === g.id}
                      onClick={() => toggle(g)}
                      className={`card flex w-full items-center gap-4 text-left transition ${
                        g.paid ? "bg-green-50/90" : ""
                      }`}
                    >
                      <motion.span
                        animate={{ scale: g.paid ? [1, 1.25, 1] : 1 }}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-4 ${
                          g.paid ? "border-green-500 bg-green-500 text-white" : "border-primary bg-white"
                        }`}
                      >
                        {g.paid ? <Icon name="check" size={22} stroke={3} /> : null}
                      </motion.span>
                      <span className="flex-1">
                        <span className={`block text-lg font-bold ${g.paid ? "line-through opacity-60" : ""}`}>
                          {g.name}
                        </span>
                        {g.paid && g.paid_at ? (
                          <span className="text-xs opacity-60">
                            {t.paidOnLabel}{" "}
                            {new Date(g.paid_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          g.paid ? "bg-green-500 text-white" : "bg-accent"
                        }`}
                      >
                        {g.paid ? t.paidBadge : t.unpaidBadge}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          <Link href="/guest" className="flex items-center gap-1 text-sm underline opacity-70">
            <Icon name="arrow-left" size={16} /> {t.backLink}
          </Link>
        </>
      )}
    </main>
  );
}
