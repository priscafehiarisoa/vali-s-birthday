"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import FloatingDecor from "@/components/FloatingDecor";
import ContactsAdmin from "@/components/ContactsAdmin";
import Icon from "@/components/Icon";
import content from "@/lib/content";
import type { Guest } from "@/lib/db";

const { guest } = content;
type State = "loading" | "locked" | "ready";

export default function GuestPage() {
  const [state, setState] = useState<State>("loading");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/guests", { cache: "no-store" });
    if (res.ok) {
      setGuests((await res.json()).guests);
      setState("ready");
    } else {
      setState("locked");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    const res = await fetch("/api/guest-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSubmitting(false);
    if (res.ok) {
      setPassword("");
      await load();
    } else {
      setError(true);
    }
  }

  async function logout() {
    await fetch("/api/guest-auth", { method: "DELETE" });
    setGuests([]);
    setState("locked");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-4 py-10">
      <FloatingDecor />
      <h1 className="text-3xl font-bold text-primary-dark">{guest.title}</h1>

      {state === "loading" && <p className="animate-pulse">{guest.loading}</p>}

      {state === "locked" && (
        <motion.form
          onSubmit={login}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card flex w-full max-w-sm flex-col gap-4"
        >
          <label className="flex flex-col gap-2 font-semibold">
            <span className="flex items-center gap-1.5">
              <Icon name="lock" size={20} /> {guest.passwordLabel}
            </span>
            <input
              type="password"
              className="input font-normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={guest.passwordPlaceholder}
              autoFocus
            />
          </label>
          {error && (
            <motion.p animate={{ x: [10, -10, 0] }} className="text-center font-semibold text-red-500">
              {guest.wrongPassword}
            </motion.p>
          )}
          <button type="submit" className="btn" disabled={submitting || !password}>
            {guest.loginLabel}
          </button>
        </motion.form>
      )}

      {state === "ready" && (
        <>
          <div className="flex items-center gap-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-4xl font-bold shadow-lg"
            >
              {guests.length}
            </motion.span>
            <span className="flex items-center gap-1.5 text-xl font-semibold">
              {guest.counterLabel} <Icon name="cat" size={24} />
            </span>
          </div>

          {guests.length === 0 ? (
            <p className="card text-center">{guest.empty}</p>
          ) : (
            <ul className="grid w-full gap-4 sm:grid-cols-2">
              {guests.map((g, i) => (
                <motion.li
                  key={g.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card flex flex-col gap-2"
                >
                  <p className="flex items-center gap-2 text-xl font-bold">
                    <Icon name="paw" size={22} className="text-primary-dark" /> {g.name}
                  </p>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                      {guest.allergiesTitle}
                    </p>
                    <p className="whitespace-pre-wrap">{g.allergies || guest.noAllergies}</p>
                  </div>
                  <p className="text-xs opacity-60">
                    {guest.dateLabel}{" "}
                    {new Date(g.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}

          <ContactsAdmin />

          <button type="button" onClick={logout} className="flex items-center gap-1 text-sm underline opacity-70">
            <Icon name="logout" size={16} /> {guest.logoutLabel}
          </button>
        </>
      )}
    </main>
  );
}
