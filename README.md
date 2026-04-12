# Vocab SMA

A flashcard-style vocabulary practice app for Indonesian high school students. Practice English words in context — each question shows an example sentence with the target word highlighted, then asks you to recall its Indonesian meaning.

## Features

- **Contextual practice** — sentences with target words wrapped in `[[double brackets]]` are rendered with bold + underline styling
- **Weighted spaced repetition** — words you know less (lower score) appear more often; score range is 0–5 per word
- **Self-assessment flow** — reveal the answer yourself, then mark "Sudah Hafal" or "Belum Hafal"
- **Per-user progress** — each account tracks its own word scores independently
- **Auth** — email/password registration and login via NextAuth v5 (JWT sessions)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 (Credentials + JWT) |
| ORM | Prisma v7 |
| Database | PostgreSQL (via Prisma Accelerate) |

## Data Model

```
User          — email + hashed password
VocabWord     — englishWord + indonesianMeaning (non-unique: "bank" can have multiple rows)
Sentence      — belongs to VocabWord; target word wrapped in [[brackets]]
UserProgress  — (userId, wordId) pair with score 0–5
```

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or [Prisma Postgres](https://console.prisma.io))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
# Prisma Accelerate connection string
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"

# Your app URL (required for NextAuth callbacks)
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run database migrations

```bash
npx prisma migrate deploy
```

### 4. Seed vocabulary (optional)

If you have a seed script, run it here. Otherwise, insert rows directly into `VocabWord` and `Sentence` via Prisma Studio:

```bash
npx prisma studio
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` if not authenticated, or to `/practice` if you are.

## Project Structure

```
app/
  page.tsx          — root redirect (login or practice)
  layout.tsx        — global layout + SessionProvider
  login/            — login page
  register/         — registration page
  practice/         — main flashcard UI
  api/
    auth/           — NextAuth route handler
    practice/
      question/     — GET  weighted random question for current user
      answer/       — POST submit self-assessment (correct/incorrect)
auth.ts             — NextAuth config (Credentials provider, JWT callbacks)
middleware.ts       — route protection
lib/
  prisma.ts         — Prisma client singleton
prisma/
  schema.prisma     — database schema
types/              — shared TypeScript types
```

## How the Weighting Works

When fetching a question, each word is assigned a weight of `6 - score`. A word with score 0 has weight 6; a word at max score 5 has weight 1. This means unlearned words appear roughly 6× more often than mastered ones.

Answering "Sudah Hafal" (correct) increments the score by 1 (max 5). Answering "Belum Hafal" (incorrect) decrements by 1 (min 0).

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run start     # start production server
npm run lint      # ESLint
```
