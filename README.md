# 🐱🌙 Vali's Pyjama Party — RSVP

Next.js (App Router) + TypeScript + Tailwind + Framer Motion + SQLite via `@libsql/client` (local file in dev, [Turso](https://turso.tech) in production).

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

`data/guests.db` is created automatically on first request, using `data/schema.sql`.

## Pages

| Route | What |
|---|---|
| `/` | Invitation — "No" shrinks & disappears after the last message, "Yes" grows |
| `/thanks` | Confetti + RSVP form (name, allergies) |
| `/info` | Informations / Rules / Contacts with a floating bottom nav |
| `/guest` | Password-protected guest list |

## Customising

- **All texts, image paths and theme colours**: `data/content.json`
- **Contacts (names / phone numbers)**: stored in the `contacts` table, managed from `/guest` once logged in
- **Cat images**: `public/cats/` (see `public/cats/README.md`)
- **/guest password**: seeded from `GUEST_PAGE_PASSWORD` the first time, stored hashed in the `settings` table. Change it with `npm run set-password -- newPassword`.

## Tree

```
app/
  page.tsx              invitation
  thanks/page.tsx       thank-you + form
  info/page.tsx         3 sections + bottom nav
  guest/page.tsx        guest list (password)
  api/guests/route.ts   POST rsvp, GET list (auth)
  api/guest-auth/route.ts  login / logout
  api/contacts/route.ts GET contacts (public), POST/DELETE (auth)
components/             CatImage, FloatingDecor
lib/db.ts               SQLite access (server only)
lib/content.ts          content.json loader
data/content.json       all texts
data/schema.sql         tables
scripts/set-password.mjs
public/cats/            your cat GIFs
```

## Deploying on Vercel

Vercel's disk is read-only, so production uses a hosted Turso database:

1. `turso db create vali-birthday`, then `turso db show vali-birthday --url` and `turso db tokens create vali-birthday`
2. In Vercel → Settings → Environment Variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET` (and optionally `GUEST_PAGE_PASSWORD`)
3. Redeploy. Tables are created on the first request.
4. Optional: copy local contacts/guests to Turso with `npm run db:push` (Turso vars in `.env`).
