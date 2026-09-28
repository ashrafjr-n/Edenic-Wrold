# Edenic World

An educational web app for children aged 5–9. Three brand mascots — **Pinki**,
**Nova**, and **Bloo** — each teach one subject: Pinki maths and shapes, Nova
English words, Bloo animals and the world. Each friend has a few courses, and a
course is a short run of lessons the child opens one after another.

The interface reads in **English, Arabic and Badini Kurdish**. What is being
*taught* stays English in every language — the shape names, the words, and the
friends' own names — since that is the subject, not the chrome.

The plan for Learn lives in `edenic-plan.md`.

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — hero, an introduction to the three friends, and the two ways into the site |
| `/learn` | Friend picker: choose Pinki, Nova or Bloo |
| `/learn/[character]` | That friend's courses (Pinki: Shapes and Adding) |
| `/learn/[character]/[lesson]` | A course: its lessons as rows, unlocked one at a time, with a Continue button to the next one |
| `/learn/[character]/[lesson]/[item]` | One lesson (`/1` … `/5`): a full-screen reel, then its steps (a Shapes lesson: meet the word, trace the shape, build the word), then "Lesson complete!". A lesson not written yet shows a "Pinki is getting this lesson ready" card |
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
  friend's own accent on their lesson pages. It also sits in the same spot on
  every page — the edge of the page's content, just under the header — and
  stays there while the page scrolls; one shared row places it, not each page.
- Everything is built from three blocks: `.card` (white panel), `.tile` (pale pastel
  square behind an icon or character) and `.clay` (a colored, softly inflated shape).
  `.card` and `.tile` are unlayered, so a Tailwind `rounded-*` utility cannot
  override them — use the `.card-pill` / `.tile-round` modifiers instead.
- The palette is sampled from the character artwork itself. Each mascot owns a
  color: Pinki → pink, Nova → lavender, Bloo → blue.
- Course subjects own a second, parallel palette (`--color-subject-*`): Shapes
  orange, Adding pink (the `numbers` token). It is used on the lesson hub from
  tablet width up, so the courses read apart at a glance, and it is kept separate
  from the mascot colors — a subject means the same thing on every hub. (The
  violet and blue subject tokens now only colour puzzle stages.)
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
    learn/[character]/[lesson]/   A course's lesson list, and the per-lesson pages
    play/page.tsx                 Play
    play/puzzle/                  The stage grid, and one puzzle per stage
    play/memory-match/            The level grid, and one memory level per level
    trail/page.tsx                The Edenic Trail
    globals.css                   Design tokens, blocks, hero mask, keyframes
  components/
    home/             Hero, friends introduction, Learn/Play panels
    learn/            Friend picker, character cards, course cards, the
                      lesson list and its Continue button
    learn/lesson/     The lesson player: Pinki's coach line, the full-screen
                      reel, the word card, the spelling board, the three
                      question types (pick, count, trace), the done card, and
                      the pieces they are built from
    activities/       The Play page's cards, plus the puzzle and
                      memory-match grids and boards
    trail/            The trail sky and Nova's welcome
    layout/           Header, nav, language switcher, footer
    ui/               Shared primitives (Button3D, BackButton, Cloud, Logo,
                      confetti, the progress bar, the page transition)
  data/               Characters, courses and their lessons (data/courses),
                      the taught shapes, puzzles, memory levels,
                      navigation, socials, home panels
  lib/                Dictionaries and locale, trace scoring, jigsaw piece
                      and outline maths, the memory deal, the audio cue
                      player, the shared /learn route resolver
  store/              Progress, theme and page-transition state (zustand)
  types/              Shared TypeScript types
public/
  hero.webp           Home hero scene
  edenic-logo.png     Logo (imported statically, never referenced by path)
  assets/learn.jpg    Learn panel artwork
  assets/friends/     Mascot artwork
  assets/icons/       3D icons — Memory Match's card faces, the Play panel art
  assets/nav-icons/   The phone bottom bar's four masked icons
  assets/learn-with-pinki/  Pinki's teaching poses and her hub banner
  assets/learn/pinki/       Course card art (placeholders until the course
                            art arrives), then each course's pictures and
                            reels (shapes/reels/1–4.mp4 are placeholders cut
                            from Big Buck Bunny, CC BY 3.0 Blender Foundation,
                            until the real reels replace them by name)
  assets/play/              The fifteen puzzle pictures, the Memory Match
                            scene, the trail cloud and Nova's trail poses
```

## Current status

The home page, the friend picker, Pinki's lesson hub and the puzzles are built,
and all are still being iterated on visually.

**Learn is being rebuilt for children aged 5–9.** The old Numbers (1–9) and
Letters (A–Z) lessons were removed: children this age already know them. Pinki
now has two courses, **Shapes** and **Adding**, five lessons each, both open.
Their pages are real — the hub's course cards, and each course's lesson list,
which keeps the old number picker's layout (a pinned Pinki with a white sheet of
rows over her on a phone, a sidebar beside a card grid on a desktop) and its
Start / Continue / Next Lesson button.

**Shapes is fully written: one shape per lesson** — Circle, Square, Triangle,
Rectangle, then a Shape review. A shape lesson plays its reel full-screen (a
round Skip button spins and moves on; the lesson also moves on by itself when
the reel ends), then shows the word with a big speaker button and each letter in
its own clay colour, then the child traces the shape, then builds the word from
its shuffled letter tiles — tap a tile to send it to the first empty space, or
drag it into any space. Only once every space is full is the word checked: the
misplaced letters wiggle and fly back to the tray (the right ones stay), and the
child can try again as often as they like. From the second miss a Help button
also appears where Next would be; it puts the word together in order. The review lesson is four "which one is the …?"
picks. The reels are placeholders until the real clips arrive.

Other lessons use three kinds of question — pick the right tile, count things
into a basket, or trace a shape — and on the first one Pinki shows how. A wrong
answer only wiggles; after two, the right one glows, so nobody gets stuck.
Finishing a lesson opens the next. Adding has lesson 1 written (Putting
together); the other four show Pinki saying they are on their way. The shapes
are drawn from their own tracing outlines until their clay pictures arrive. Nova and Bloo come after Pinki, on the same pattern. Audio is designed
for but not recorded: every button that will play a sound already calls
`lib/cue.ts`.

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
the URL it already had, and the taught content itself (shape names, words and
the friends' names) stays English in all three, since that is what is being
taught. "Join Edenic World" is still presentation only, and it doubles as the
profile entry point, as does the Profile tab on the phone's bottom bar — so no
progress, streaks or points appear anywhere before sign-in.

The **Edenic Trail** is the newest and least finished part: `/trail` is the sky,
its stage clouds and Nova's welcome, and nothing else — no path between the
stops, no per-stage pages and no progress yet. Around thirty stages are the
eventual plan.

Planned, in order:

1. The real Shapes reels and pictures, then the Adding content (`edenic-plan.md`)
2. Nova's and Bloo's courses, on the same pattern
3. Voice for every line a child should hear, recorded once the content is done
4. The trail itself — the path, the stage pages, and progress along it
5. Accounts, and the profile the "Join Edenic World" button and the Profile tab lead to

Audio narration is deliberately out of scope for the MVP, but the experience is
built around where it will go.
