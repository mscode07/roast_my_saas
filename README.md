# Roast My SaaS

A free, no-signup landing-page reviewer that turns a SaaS URL into a witty conversion audit, five calibrated scores, three priority fixes, and a downloadable social card. Founders can explicitly opt into a Neon-backed **Hall of Shame**; nothing is published without that click.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, OpenAI structured outputs, Zod, Cheerio, Lucide, html-to-image, and Neon Postgres.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add an OpenAI API key to use the roast flow and a Neon connection string as `DATABASE_URL`. Apply the single leaderboard table with:

```bash
npm run db:migrate
```

The migration source is [`db/schema.sql`](db/schema.sql). `DATABASE_URL` is server-only.

## How analysis works

`POST /api/roast` normalizes and validates the URL, rejects private/internal destinations, resolves DNS, follows at most three validated redirects, limits time and response size, extracts a bounded set of visible copy, and sends only that structured context to OpenAI. The AI response is schema-validated before it reaches the UI.

The in-memory rate limit is intentionally lightweight for V1. Use a shared edge/Redis limiter for multi-instance production deployments. DNS rebinding defenses in application code reduce risk, but production egress controls remain recommended for any public URL fetcher.

## Deploy

Set the variables from `.env.example` in your hosting platform and run `npm run build`. Public roasts require Neon; private results remain stateless.

## V1 boundaries

No accounts, email collection, saved private history, SEO/performance audit, or Hall of Fame. Sites that require JavaScript to render all meaningful copy may provide too little server-visible content to analyze.
