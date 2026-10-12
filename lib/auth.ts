import { cookies } from "next/headers";
import { sessionToken } from "@/lib/db";

export const SESSION_COOKIE = "guest_session";

/** True when the request carries a valid /guest session cookie. */
export async function isAuthed() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token === (await sessionToken());
}
