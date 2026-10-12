"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import CatImage from "@/components/CatImage";
import Icon from "@/components/Icon";
import Poster from "@/components/Poster";
import FloatingDecor from "@/components/FloatingDecor";
import content from "@/lib/content";
import type { Contact } from "@/lib/db";

const { info } = content;
type Tab = keyof typeof info.tabs;
const TABS = Object.keys(info.tabs) as Tab[];

function Informations() {
  const s = info.informations;
  return (
    <Section title={s.title} image={s.image}>
      <div className="mb-6">
        <Poster />
      </div>
      {s.meme?.image && (
        <motion.figure
          initial={{ rotate: 0, y: 30, opacity: 0 }}
          whileInView={{ rotate: -3, y: 0, opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ rotate: 2, scale: 1.03 }}
          className="relative mx-auto mb-8 w-64 bg-white p-3 pb-4 shadow-xl"
        >
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-accent/80 shadow-sm"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.meme.image} alt={s.meme.alt} className="aspect-square w-full object-cover" />
          {s.meme.caption && (
            <figcaption className="font-hand mt-2 text-center text-2xl text-ink">{s.meme.caption}</figcaption>
          )}
        </motion.figure>
      )}
      <ul className="flex flex-col gap-3">
        {s.items.map((it) => (
          <li key={it.label} className="card flex items-start gap-4">
            <span className="flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl bg-bg-alt text-primary-dark">
              <Icon name={it.icon} size={29} />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-dark">{it.label}</p>
              {"link" in it && it.link ? (
                <a href={it.link} target="_blank" rel="noreferrer" className="underline decoration-primary decoration-2">
                  {it.value}
                </a>
              ) : (
                <p>{it.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Rules() {
  const s = info.rules;
  return (
    <Section title={s.title} image={s.image}>
      {"important" in s && s.important?.text && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 flex items-start gap-3 rounded-3xl border-4 border-dashed border-primary-dark bg-accent p-5 shadow-lg"
        >
          <motion.span
            animate={{ rotate: [0, -12, 12, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
            className="shrink-0 text-primary-dark"
          >
            <Icon name="alert-triangle" size={30} />
          </motion.span>
          <div>
            <p className="text-lg font-bold text-primary-dark">{s.important.title}</p>
            <p className="font-semibold whitespace-pre-line">{s.important.text}</p>
          </div>
        </motion.div>
      )}
      <ol className="flex flex-col gap-3">
        {s.items.map((rule, i) => (
          <motion.li
            key={rule}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card flex items-center gap-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-bold">
              {i + 1}
            </span>
            <p>{rule}</p>
          </motion.li>
        ))}
      </ol>
    </Section>
  );
}

function Contacts() {
  const s = info.contacts;
  const [people, setPeople] = useState<Contact[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setPeople(d.contacts))
      .catch(() => setFailed(true));
  }, []);

  return (
    <Section title={s.title} image={s.image}>
      <p className="mb-4 text-center opacity-80">{s.intro}</p>
      {failed && <p className="card text-center">{s.error}</p>}
      {!failed && !people && <p className="animate-pulse text-center">{s.loading}</p>}
      <ul className="flex flex-col gap-3">
        {people?.map((p) => (
          <li key={p.id} className="card flex flex-col gap-3">
            <div>
              <p className="text-xl font-bold">{p.name}</p>
              {p.role && <p className="text-sm opacity-70">{p.role}</p>}
              <p className="font-mono text-sm">{p.phone}</p>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${p.phone}`} className="btn flex-1 py-2">
                <Icon name="phone" size={20} className="mr-1.5" /> {s.callLabel}
              </a>
              {p.whatsapp && (
                <a
                  href={`https://wa.me/${p.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn flex-1 bg-green-500 py-2"
                >
                  <Icon name="brand-whatsapp" size={20} className="mr-1.5" /> {s.whatsappLabel}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Section({ title, image, children }: { title: string; image: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <CatImage src={image} alt={title} size={130} />
      <h2 className="text-2xl font-bold text-primary-dark">{title}</h2>
      <div className="w-full">{children}</div>
    </div>
  );
}

const SECTIONS: Record<Tab, () => React.ReactNode> = {
  informations: Informations,
  rules: Rules,
  contacts: Contacts,
};

export default function InfoPage() {
  const [active, setActive] = useState<Tab>("informations");
  const Active = SECTIONS[active];

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-8 pb-32">
      <FloatingDecor />
      <h1 className="mb-6 text-center text-3xl font-bold">{info.title}</h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Active />
        </motion.div>
      </AnimatePresence>

      <nav className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-md rounded-full bg-white/90 p-2 shadow-[0_10px_30px_-10px_rgba(91,69,102,0.45)] backdrop-blur">
        <ul className="flex justify-between">
          {TABS.map((tab) => {
            const isActive = tab === active;
            return (
              <li key={tab} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setActive(tab);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className="relative z-10 flex w-full flex-col items-center gap-0.5 rounded-full py-2 text-sm font-semibold"
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.span animate={{ scale: isActive ? 1.15 : 1 }}>
                    <Icon name={info.tabs[tab].icon} size={24} />
                  </motion.span>
                  {info.tabs[tab].label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </main>
  );
}
