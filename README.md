# Sleeve

A shelf, not a shop: track the physical music you own — vinyl, CDs, cassettes
— so you stop buying second copies of things already sitting at home.

```
sleeve/
├── backend/     Express API — accounts, verification, storage, sharing
│   └── schema.sql   run this once to create the database
└── frontend/    Vite + React app — everything you see and click
```

## 1. Database (Laragon)

1. Start Laragon — this starts MySQL/MariaDB.
2. Open **HeidiSQL** (Laragon's "Database" button) or phpMyAdmin, and
   connect with host `127.0.0.1`, user `root`, empty password (Laragon's
   defaults).
3. Open `backend/schema.sql` and run the whole file. It creates a `sleeve`
   database with three tables:

   | Table      | Holds |
   |------------|-------|
   | `users`    | accounts — email, username, password hash, verification status/token |
   | `items`    | the owned collection — title, artist, format, cover, year, rating, tags, recommended tracks, notes, on-repeat flag, and the public share fields (`is_public`, `share_id`) |
   | `wishlist` | things not yet owned — title, artist, format, priority, link, notes, tags |

   Full column definitions and types are in the file itself, with comments.

## 2. Backend

```
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `JWT_SECRET` — a real random value (the file shows a one-line command to generate one)
- `DB_*` — already set to Laragon's defaults; only change these if your setup differs
- `SMTP_*` — optional for local development (see below)

```
npm run dev
```

The API starts on `http://localhost:4000`.

## 3. Frontend

In a second terminal:

```
cd frontend
npm install
cp .env.example .env   # only needed if your API isn't on localhost:4000
npm run dev
```

Visit the printed local URL (usually `http://localhost:5173`).

## Email verification

New accounts must verify their email before they can sign in.

- On sign-up, Sleeve generates a verification link and emails it.
- **Without SMTP configured** (the default), the link is printed to the
  backend's console instead — open it there to verify during local testing.
- **With SMTP configured** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
  `SMTP_PASS`, `SMTP_FROM` in `backend/.env`), the email is actually sent.
  Any standard SMTP provider works (Mailtrap is a good one for testing
  without emailing real people; SendGrid, Postmark, etc. for production).
- Verification links expire after 24 hours; signing in with an unverified
  account offers a "resend verification email" option.

## Sharing an album

Any item in the collection can be made public from its detail view:
- Toggling "make shareable" generates a permanent link
  (`/share/:shareId`) that works without signing in.
- The shared page only ever shows what's meant to be public — title,
  artist, format, year, cover, rating, genres, and recommended tracks.
  Notes and where you got it stay private.
- Toggling sharing off immediately takes the link offline; toggling it
  back on reuses the same link rather than generating a new one.

## Accounts and security

- Sign up with an **email**, a **username**, and a **password** (8+ characters).
- Passwords are hashed with bcrypt before they're ever written to the
  database — the server never stores or logs the plain password.
- Signing in issues a JWT session token, valid for 30 days, checked on
  every request.
- Every library and wishlist row is tagged with the account that created
  it, and the API only ever returns rows belonging to the signed-in user.

## What this setup is (and isn't) good for

This is a solid foundation for a personal or small-group project on your
own machine or a small private server. Before putting it on the open
internet with other people's real passwords, you'd also want to:

- Serve everything over HTTPS.
- Add rate limiting on `/api/auth/login` and `/api/auth/resend-verification`
  to slow down guessing/abuse.
- Consider short-lived access tokens with a refresh-token flow instead of a
  single 30-day JWT.
- Run MySQL with a dedicated, less-privileged user rather than `root`.

None of that changes how the app is organized — it's all isolated inside
`backend/`, so the frontend wouldn't need to change.

## Features

- Email + username + password accounts, with required email verification
- Add entries with a cover photo, artist, title, format, year, genre tags,
  recommended track(s) to start with, notes, and a 5-star rating
- Live duplicate detection while adding an entry — flags an exact repeat, a
  copy on a different format, or an item already on your wishlist
- A separate wishlist that checks against what you already own
- Two library views: a literal spine-by-spine shelf, and a cover grid
- A public, shareable link for any album you choose to share
- A stats page: breakdown by format, average rating, genres tracked, most
  represented artists, what's currently on repeat
- "Spin the Shelf" — a random picker for tonight's listen, filterable by format
