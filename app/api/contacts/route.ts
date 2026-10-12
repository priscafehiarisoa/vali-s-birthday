import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { addContact, deleteContact, listContacts } from "@/lib/db";

const digits = (s: string) => s.replace(/\D/g, "");

// Public: guests need the numbers on /info.
export async function GET() {
  return NextResponse.json({ contacts: await listContacts() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body?.name);
  const role = str(body?.role);
  const phone = str(body?.phone);
  const whatsapp = digits(str(body?.whatsapp) || phone); // wa.me only accepts digits

  if (!name || !digits(phone) || name.length > 100 || role.length > 100 || phone.length > 30) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  await addContact({ name, role: role || null, phone, whatsapp: whatsapp || null });
  return NextResponse.json({ contacts: await listContacts() }, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await deleteContact(id);
  return NextResponse.json({ contacts: await listContacts() });
}
