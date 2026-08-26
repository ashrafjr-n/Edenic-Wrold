# Edenic World

An educational web app for children under 10. Three brand mascots — **Pinki**,
**Nova**, and **Bloo** — each guide a set of lessons, and children work through
them one item at a time.

All UI and content is English only.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Tech stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** — configured in `src/app/globals.css`, no `tailwind.config.js`
- **Fredoka** via `next/font/google`
- **lucide-react** for icons
- Entrance and idle animation are plain CSS keyframes — no animation library

## Design system

The characters are the only 3D on the site. Every piece of UI around them is flat,
so nothing competes with the renders for attention — the one exception is a solid
chunky edge on buttons and cards that presses down when tapped, because a physical
press is the clearest affordance for this audience.

On the home page each mascot owns a full-height panel — their world — rather than
sitting on a card, and the character overflows above its panel's top edge.

- The palette is sampled from the character artwork itself. Each mascot owns a
  world: Pinki → pink, Nova → lavender, Bloo → blue.
- Nova's body is cream rather than white, so she is never placed on a plain white
  surface — her stage is always tinted.
- Gold, taken from the horns all three characters share, is the signature accent.
  It marks whatever is unlocked and available, and nothing else.
- Backdrops are soft gradients with large blurred organic shapes. No photographic
  backgrounds or textures.

Tokens live in `src/app/globals.css`.

## Project structure

```text
src/
  app/
    layout.tsx                    Root layout: font, header
    page.tsx                      Home page
    learn/[character]/page.tsx    Character lesson hub
    globals.css                   Design tokens, button and stage styles, keyframes
  components/
    home/             Hero, character cards, stage backdrop, intro icon animation
    learn/            Lesson cards
    layout/           Header
    ui/               Shared primitives (Button3D)
  data/               Character and lesson definitions
  types/              Shared TypeScript types
public/assets/
  friends/            Mascot artwork
  icons/              Decorative 3D icons
```

## Current status

The home page and the character lesson hub (`/learn/pinki`) are built, and both are
still being iterated on visually. Only Pinki has lesson content; Nova and Bloo are
locked. Per-item lesson pages, progress state, and lesson content are not built yet.

Planned, in order:

1. Character lesson hubs and per-item pages (video → shape → tracing → questions)
2. Client-side progress tracking, so a returning child resumes where they left off
3. Progressive unlocking, across characters and within each character's lessons

Audio narration is deliberately out of scope for the MVP.
