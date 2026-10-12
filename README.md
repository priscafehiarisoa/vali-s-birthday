# 🐱🌙 Vali's Pyjama Party — RSVP

Next.js (App Router) + TypeScript + Tailwind + Framer Motion + SQLite (`better-sqlite3`).

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

Note: SQLite needs a persistent disk — host on a VPS / Railway / Fly.io rather than Vercel serverless.
