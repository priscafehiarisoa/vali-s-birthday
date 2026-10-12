"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import Icon from "@/components/Icon";
import content from "@/lib/content";
import type { Contact } from "@/lib/db";

const { guest } = content;
const EMPTY = { name: "", role: "", phone: "", whatsapp: "" };

/** Add / remove the contacts shown on /info. Rendered only once logged in on /guest. */
export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts));
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) return setError(true);
    setContacts((await res.json()).contacts);
    setForm(EMPTY);
  }

  async function remove(id: number) {
    if (!confirm(guest.confirmDeleteContact)) return;
    const res = await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    if (res.ok) setContacts((await res.json()).contacts);
  }

  const field = (key: keyof typeof EMPTY, label: string, placeholder: string, type = "text") => (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <input
        type={type}
        className="input font-normal"
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="text-center text-2xl font-bold text-primary-dark">{guest.contactsTitle}</h2>

      {contacts.length === 0 ? (
        <p className="card text-center">{guest.contactsEmpty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <motion.li key={c.id} layout className="card flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{c.name}</p>
                {c.role && <p className="text-sm opacity-70">{c.role}</p>}
                <p className="font-mono text-sm">{c.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`${guest.deleteContactLabel} ${c.name}`}
                className="rounded-full p-2 text-red-500 transition hover:bg-red-50"
              >
                <Icon name="trash" size={22} />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="card flex flex-col gap-3">
        {field("name", guest.contactNameLabel, guest.contactNamePlaceholder)}
        {field("role", guest.contactRoleLabel, guest.contactRolePlaceholder)}
        {field("phone", guest.contactPhoneLabel, guest.contactPhonePlaceholder, "tel")}
        {field("whatsapp", guest.contactWhatsappLabel, guest.contactWhatsappPlaceholder, "tel")}
        {error && <p className="text-center font-semibold text-red-500">{guest.contactError}</p>}
        <button type="submit" className="btn" disabled={busy || !form.name || !form.phone}>
          {guest.addContactLabel}
        </button>
      </form>
    </section>
  );
}
