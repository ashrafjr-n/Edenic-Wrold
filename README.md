# Edenic World

An educational web app for children under 10. Three brand mascots — **Pinki**,
**Nova**, and **Bloo** — each guide a set of lessons, and children work through
them one item at a time.

All UI and content is English only.

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — hero, an introduction to the three friends, and the two ways into the site |
| `/learn` | Friend picker: choose Pinki, Nova or Bloo |
| `/learn/[character]` | That friend's lesson hub |
| `/learn/[character]/[lesson]` | Number picker — 1 to 9, unlocked one at a time |
| `/learn/[character]/[lesson]/[item]` | One number's journey — eight stages, guided by Pinki |

`Activities` appears in the navigation and footer but has no page yet, so it is
rendered as disabled "soon" text rather than a link.

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
- **lucide-react** for icons, and **@icons-pack/react-simple-icons** for platform
  brand marks (lucide v1 dropped its brand icons)
- **zustand** with the `persist` middleware for lesson progress, saved to
  `localStorage` — there are no accounts yet, so progress lives on the device
- Entrance and idle animation are plain CSS keyframes — no animation library.
  Below-the-fold sections reveal with a CSS scroll-driven timeline
  (`animation-timeline: view()`), gated behind `@supports`, so no JavaScript and no
  Client Components are involved

## Design system

Claymorphism with a deep purple and a bubblegum pink as the two hero colors: soft
rounded shapes, generous radii, wide low-contrast shadows and pale pastel fills.

- The page ground is a very pale violet — close to white, but never actually white.
  White cards sit on top of it, and that narrow contrast is what gives them their
  lift, so card shadows are tuned to carry it.
- Colored surfaces carry a fine grain, blended into the fill, so they read as clay
  rather than as flat plastic. White chips deliberately have none.
- Purple carries every primary action; pink is its counterweight. Character colors
  are reserved for identity and only ever appear as a pale tile tint.
- Everything is built from three blocks: `.card` (white panel), `.tile` (pale pastel
  square behind an icon or character) and `.clay` (a colored, softly inflated shape).
  `.card` and `.tile` are unlayered, so a Tailwind `rounded-*` utility cannot
  override them — use the `.card-pill` / `.tile-round` modifiers instead.
- The palette is sampled from the character artwork itself. Each mascot owns a
  color: Pinki → pink, Nova → lavender, Bloo → blue.
- Lesson subjects own a second, parallel palette (`--color-subject-*`): numbers
  pink, letters violet, colors blue, shapes amber. It is used on the lesson hub
  from tablet width up, so the four lessons read apart at a glance, and it is kept
  separate from the mascot colors — a subject means the same thing on every hub.
- The lesson hub is the one page that is not a flat single-color ground: it takes
  the character's own color edge to edge, bending through lavender into a pale
  tint of itself from tablet width up.
- Nova's body is cream rather than white, so she is never placed on a plain white
  surface — her tile is always tinted.
- Rendered art appears in two places and never as a plain rectangle: the home hero
  is cut to a wavy silhouette (`.hero-clip`, an SVG path used as a mask), and the two
  home panels bed their art into the fill (`.panel-art`). Everywhere else there are
  no decorative shapes, textures or background art.
- Nothing moves on hover except the character cards — buttons and chips respond with
  shadow and color instead.

Tokens live in `src/app/globals.css`.

## Project structure

```text
src/
  app/
    layout.tsx                    Root layout: font, header
    page.tsx                      Home page
    learn/page.tsx                Friend picker
    learn/[character]/page.tsx    Character lesson hub
    learn/[character]/[lesson]/   Number picker, and the per-number pages
    globals.css                   Design tokens, blocks, hero mask, keyframes
  components/
    home/             Hero, friends introduction, Learn/Activities panels
    learn/            Friend picker, character cards, lesson cards, intro icons
    learn/number/     Numerals, the tracing board, the quizzes, stars
    layout/           Header, nav, footer
    ui/               Shared primitives (Button3D, SocialLinks, Logo)
  data/               Characters, lessons, numbers, navigation, socials, home panels
  lib/                Trace scoring, quiz decoys, the shared /learn route resolver
  store/              Lesson progress (zustand + persist)
  types/              Shared TypeScript types
public/
  hero.jpg            Home hero scene
  edenic-logo.png     Logo (imported statically, never referenced by path)
  assets/learn.jpg    Learn panel artwork
  assets/friends/     Mascot artwork
  assets/icons/       Decorative 3D icons
  assets/learn-with-pinki/  Pinki's teaching poses, the clay numerals 1-9, props
```

## Current status

The home page, the friend picker, Pinki's lesson hub and the Numbers lesson are
built, and all are still being iterated on visually. Only Pinki has lesson
content; Nova and Bloo are locked, and Numbers is the only lesson with items.

Each number is one journey of eight stages, guided by Pinki throughout: meet the
number in a short video, see it standing still and say it aloud, watch her
write it, trace it, find it among others, give her one apple and say how many
she has, pop the right balloon, and earn one to three stars for the whole
journey. Finishing a number unlocks the next.

Tracing is a custom SVG and Pointer Events board, scored on how much of the
numeral the child covered and how much of their drawing stayed on it — no
drawing library. The bar drops with every attempt, so a child always gets
through, and nothing on these pages ever tells a child they are wrong. The video
is a `youtube-nocookie.com` embed with suggestions and branding turned down, so
nothing on the page offers a way off the site.

**Number 1 is the designed one.** Numbers 2–9 run on the same pipeline but have
no video yet, and their handwriting paths have not been tested.

Audio is planned and designed for — the "say the word" button, its states and
its timing are already built — but no clips exist yet.

The header's language, dark-mode and "Join Edenic World" controls are presentation
only — none of them have behavior yet. "Join Edenic World" is also the profile entry
point, so no progress, streaks or points appear anywhere before sign-in.

Planned, in order:

1. Voice for Pinki and for each number word
2. The same journey for numbers 2 to 9
3. Progressive unlocking across characters and lessons (it works within a lesson)
4. The Activities section
5. Accounts, and the profile the "Join Edenic World" button leads to
6. A real dark mode (needs a second token set across `globals.css`)

Audio narration is deliberately out of scope for the MVP, but the experience is
built around where it will go.
