import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { addGuest, listGuests } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const allergies = typeof body?.allergies === "string" ? body.allergies.trim() : "";

  if (!name || name.length > 100 || allergies.length > 1000) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  addGuest(name, allergies || null);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ guests: listGuests() });
}
