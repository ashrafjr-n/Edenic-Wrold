# Edenic World

An educational web app for children under 10. Three brand mascots — **Pinki**,
**Nova**, and **Bloo** — each guide a set of lessons, and children work through
them one item at a time.

The interface reads in **English, Arabic and Badini Kurdish**. What is being
*taught* stays English in every language — the numerals, the letters, the colour
names and the friends' own names — since that is the subject, not the chrome.

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — hero, an introduction to the three friends, and the two ways into the site |
| `/learn` | Friend picker: choose Pinki, Nova or Bloo |
| `/learn/[character]` | That friend's lesson hub |
| `/learn/[character]/[lesson]` | Number picker — 1 to 9 with a progress bar and star record, unlocked one at a time |
| `/learn/[character]/[lesson]/[item]` | One number's journey — eight stages, guided by Pinki |
| `/play` | Play — the Edenic Trail card, then Puzzle Time and Memory Match |
| `/play/puzzle` | The fifteen puzzle stages, unlocked one at a time |
| `/play/puzzle/[stage]` | One jigsaw puzzle: the board, and a heap of loose pieces to carry into it |
| `/play/memory-match` | The twelve Memory Match levels, unlocked one at a time |
| `/play/memory-match/[level]` | One level: the level number, the clock, and the grid of cards |
| `/trail` | The Edenic Trail — the sky and its stage clouds, with Nova welcoming a child onto it |

This section was called **Activities** and lived at `/activities`; every old
path 308-redirects to its `/play` twin (`next.config.ts`), so existing links
still work.

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

## Deployment

The app has **no environment variables, no database and no external services** —
`npm run build` and deploy. It is built for Vercel and needs no configuration
there:

- Every route is server-rendered on demand, because the chosen language is a
  cookie and reading it opts the route into dynamic rendering. That is expected,
  not a misconfiguration.
- The link-preview card resolves to an absolute URL on its own: Next derives a
  `metadataBase` from Vercel's own environment. If a custom domain is added
  later, set `metadataBase: new URL("https://<domain>")` in
  `src/app/layout.tsx` — nothing else changes.
- Progress is stored in the visitor's browser, so nothing needs migrating and
  no deploy can lose it.

## Tech stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** — configured in `src/app/globals.css`, no `tailwind.config.js`
- **Fredoka** via `next/font/google` for Latin, plus one Arabic-script face
  chosen by `<html lang>` — Baloo Bhaijaan 2 for Arabic, Vazirmatn for Kurdish
  (Baloo has no glyph for four of the commonest Kurdish letters). Each locale
  downloads only its own face
- **lucide-react** for icons, and **@icons-pack/react-simple-icons** for platform
  brand marks (lucide v1 dropped its brand icons)
- **zustand** with the `persist` middleware for lesson progress, saved to
  `localStorage` — there are no accounts yet, so progress lives on the device
- Entrance and idle animation are plain CSS keyframes — no animation library.
  Below-the-fold sections reveal with a CSS scroll-driven timeline
  (`animation-timeline: view()`), gated behind `@supports`, so no JavaScript and no
  Client Components are involved

## Design system

Claymorphism with a sky blue and a bubblegum pink as the two hero colors: soft
rounded shapes, generous radii, wide low-contrast shadows and pale pastel fills.

- The page ground is a very pale blue — close to white, but never actually white.
  White cards sit on top of it, and that narrow contrast is what gives them their
  lift, so card shadows are tuned to carry it.
- Colored surfaces carry a fine grain, blended into the fill, so they read as clay
  rather than as flat plastic. White chips deliberately have none.
- Sky blue carries every primary action; pink is its counterweight. Character
  colors are reserved for identity and only ever appear as a pale tile tint.
- Each section of the site carries its own colour, and shared chrome inherits it
  rather than naming one: a route sets `--page-accent-color` on its `<main>`, so
  the one back button is green in the puzzles, gold in Memory Match, and each
  friend's own accent on their lesson pages.
- Everything is built from three blocks: `.card` (white panel), `.tile` (pale pastel
  square behind an icon or character) and `.clay` (a colored, softly inflated shape).
  `.card` and `.tile` are unlayered, so a Tailwind `rounded-*` utility cannot
  override them — use the `.card-pill` / `.tile-round` modifiers instead.
- The palette is sampled from the character artwork itself. Each mascot owns a
  color: Pinki → pink, Nova → lavender, Bloo → blue.
- Lesson subjects own a second, parallel palette (`--color-subject-*`): numbers
  pink, letters violet, colors blue. It is used on the lesson hub from tablet
  width up, so the three lessons read apart at a glance, and it is kept separate
  from the mascot colors — a subject means the same thing on every hub.
- Every page sits on the same flat, pale ground. The lesson hub used to take the
  character's colour edge to edge; that was removed, and the colour now lives on
  the lesson cards themselves — the open one is the saturated card, the locked
  ones are white clay.
- Nova's body is cream rather than white, so she is never placed on a plain white
  surface — her tile is always tinted.
- Rendered art appears in two places and never as a plain rectangle: the home hero
  is cut to a wavy silhouette (`.hero-clip`, an SVG path used as a mask), and the two
  home panels bed their art into the fill (`.panel-art`). Everywhere else there are
  no decorative shapes, textures or background art.
- Nothing moves on hover except cards that opt into the lift — buttons and chips
  respond with shadow and color instead.
- The site has a full dark mode. It is one `data-theme` attribute on `<html>`,
  set before the first paint so a returning visitor never sees a flash of the
  wrong theme.

Tokens live in `src/app/globals.css`.

## Project structure

```text
src/
  app/
    layout.tsx                    Root layout: fonts, header, metadata, theme
    page.tsx                      Home page
    icon.png / apple-icon.png     Favicon and touch icon (Next file conventions)
    opengraph-image.jpg           The link-preview card, with its .alt.txt
    learn/page.tsx                Friend picker
    learn/[character]/page.tsx    Character lesson hub
    learn/[character]/[lesson]/   Number picker, and the per-number pages
    play/page.tsx                 Play
    play/puzzle/                  The stage grid, and one puzzle per stage
    play/memory-match/            The level grid, and one memory level per level
    trail/page.tsx                The Edenic Trail
    globals.css                   Design tokens, blocks, hero mask, keyframes
  components/
    home/             Hero, friends introduction, Learn/Play panels
    learn/            Friend picker, character cards, lesson cards
    learn/number/     Numerals, the tracing board, the quizzes, stars
    activities/       The Play page's cards, plus the puzzle and
                      memory-match grids and boards
    trail/            The trail sky and Nova's welcome
    layout/           Header, nav, language switcher, footer
    ui/               Shared primitives (Button3D, BackButton, Cloud, Logo,
                      confetti, stars, the progress bar, the page transition)
  data/               Characters, lessons, numbers, puzzles, memory levels,
                      navigation, socials, home panels
  lib/                Dictionaries and locale, trace scoring, quiz decoys,
                      jigsaw piece and outline maths, the memory deal,
                      the shared /learn route resolver
  store/              Progress, theme and page-transition state (zustand)
  types/              Shared TypeScript types
public/
  hero.png            Home hero scene
  edenic-logo.png     Logo (imported statically, never referenced by path)
  assets/learn.jpg    Learn panel artwork
  assets/friends/     Mascot artwork
  assets/icons/       3D icons — Memory Match's card faces, the Play panel art
  assets/png/         The phone bottom bar's four masked icons
  assets/learn-with-pinki/  Pinki's teaching poses, the clay numerals 1-9, props
  assets/activity-page/     The Play card art, the fifteen puzzle pictures,
                            the Memory Match scene and Nova's trail poses
```

## Current status

The home page, the friend picker, Pinki's lesson hub, the Numbers lesson and the
puzzles are built, and all are still being iterated on visually. Only Pinki has
lesson content; Nova and Bloo are locked, and Numbers is the only lesson with
items.

Each number is one journey of eight stages: meet the number in a short video,
see it standing still and say it aloud, watch Pinki write it, trace it, find it
among others, pick one apple and say how many were picked, pop the right
balloon, and finish on a celebration screen. Pinki guides five of the eight —
the video, the tracing board and the balloon game are left to the child alone.
One to three stars are scored for the whole journey and shown back on the
picker. Finishing a number unlocks the next.

The picker that leads into them shows the whole set at once: a "Numbers - 0 / 9"
bar, then each numeral on its own cell with three star slots under it. The stars
are empty until a number is actually finished and turn gold one at a time after
that, so a child can see both what has been earned and what is still on offer;
numbers that are not open yet keep the same padlock the friend picker uses.

Tracing is a custom SVG and Pointer Events board, scored on how much of the
numeral the child covered and how much of their drawing stayed on it — no
drawing library. The bar drops with every attempt, so a child always gets
through, and nothing on these pages ever tells a child they are wrong. The video
is a `youtube-nocookie.com` embed with suggestions and branding turned down, so
nothing on the page offers a way off the site.

**Number 1 is the designed one.** Numbers 2–9 run on the same pipeline; 2–7 have
their own video, 8–9 do not yet, and none of their handwriting paths has been
trace-tested.

Audio is planned and designed for — the "say the word" button, its states and
its timing are already built — but no clips exist yet.

All fifteen puzzles are playable, and the stage grid shows the child where
they are: every stage is a clay card in its own colour showing its picture and
its level number, marked with a green tick when finished, or blurred behind a
pale wash and a padlock while it is still locked. Each puzzle is one
picture cut into real interlocking jigsaw pieces — SVG clip paths over crops of a single image, no
piece files — and a stage gets harder only by being cut into more of them,
from nine up to seventy-two. Stages 4–15 use square pictures so that the board
and the heap of loose pieces both fit one phone screen: a child who had to
scroll between the two could not drag a piece from one to the other. A piece counts as placed as soon as it overlaps its own hole, so
nothing has to be lined up, and puzzles are not scored: the finished picture is
the reward.

**Memory Match** adds twelve levels of matching pairs, from four cards up to
twenty, every board laid out as a compact block rather than a long row. The
card count is only half of what makes a level harder: the early
levels use plainly different pictures, while the later ones deal look-alikes —
the same ball in two colours, three letters in the same lettering, the three
friends in the same silhouette — so the game turns from recognising into
remembering. Each level carries a target time shown as a countdown dial, and
nothing else: the clock stops at zero and goes quiet, the board stays playable,
and a child can always finish. The level cards are gold in one of three shades,
and the shade says what the card is rather than where it sits: finished levels
share one gold, the level to play next is deeper and carries a small "Next"
label, and locked ones are drained. Levels are not scored yet — finishing one marks it done and opens the
next.

The header's language switcher and dark-mode toggle both work. The site reads in
English, Arabic and Badini Kurdish — the choice is a cookie, so every page keeps
the URL it already had, and the taught content itself (numbers, letters, colours
and the friends' names) stays English in all three, since that is what is being
taught. "Join Edenic World" is still presentation only, and it doubles as the
profile entry point, as does the Profile tab on the phone's bottom bar — so no
progress, streaks or points appear anywhere before sign-in.

The **Edenic Trail** is the newest and least finished part: `/trail` is the sky,
its stage clouds and Nova's welcome, and nothing else — no path between the
stops, no per-stage pages and no progress yet. Around thirty stages are the
eventual plan.

Planned, in order:

1. The trail itself — the path, the stage pages, and progress along it
2. Voice for Pinki and for each number word
3. Videos for numbers 8 and 9, and trace-testing every number's handwriting path
4. Letters and Colours, then Nova's and Bloo's lessons
5. Progressive unlocking across characters and lessons (it works within a lesson)
6. Accounts, and the profile the "Join Edenic World" button and the Profile tab lead to

Audio narration is deliberately out of scope for the MVP, but the experience is
built around where it will go.
