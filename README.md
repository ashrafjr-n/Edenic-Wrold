# Edenic World

An educational web app for children aged 5–9. Three brand mascots — **Pinki**,
**Nova**, and **Bloo** — each teach three courses: Pinki shapes, colors and
family; Nova fruits and vegetables, the seasons and the months; Bloo animals,
the weather and the body. A course is a short run of lessons the child opens one
after another, each starting with a video and centred on spelling the English
words it teaches.

The interface reads in **English, Arabic and Badini Kurdish**. What is being
*taught* stays English in every language — the shape names, the words, and the
friends' own names — since that is the subject, not the chrome.

The plan for Learn lives in `edenic-plan.md`.

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — hero, an introduction to the three friends, and the two ways into the site |
| `/learn` | Friend picker: choose Pinki, Nova or Bloo |
| `/learn/[character]` | That friend's courses: the friend says hello, then one big clay card per course (three each; all three friends are open) |
| `/learn/[character]/[lesson]` | A course: on a phone, a banner and its lessons as a winding clay path (unlocked one at a time); a card grid on wider screens; a Continue button to the next one |
| `/learn/[character]/[lesson]/[item]` | One lesson (`/1` … `/5`): a full-screen reel, then its steps (a Shapes lesson: meet the word, trace the shape, build the word, find the shapes), then "Lesson complete!". On a desktop the steps play on an open stage, with a trail of the lesson's steps across the top. A lesson not written yet shows a "Pinki is getting this lesson ready" card |
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
  orange, Colors blue; the other courses borrow the `colors`, `numbers` and `letters` tokens
  until they get their own. It is used on the lesson hub from tablet width up,
  so the courses read apart at a glance, and it is kept separate from the
  mascot colors.
- Inside a lesson on a desktop nothing wraps the step: no board, no card. The
  step stands on the page ground, so the one thing to play with is the biggest
  thing on screen.
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
                      course path and lesson grid, their progress bar and
                      Continue button
    learn/lesson/     The lesson player: the task button and its how-to
                      demos, the tablet task and lesson panels, the desktop step trail,
                      the full-screen reel, the word card, the tracing board, the
                      spelling board, Find-the-shapes, pick and count, the
                      done screen, and the pieces they are built from
    activities/       The Play page's cards, plus the puzzle and
                      memory-match grids and boards
    trail/            The trail sky and Nova's welcome
    layout/           Header, nav, language switcher, footer
    ui/               Shared primitives (Button3D, BackButton, Cloud, Logo,
                      confetti, the progress bar, the page transition)
  data/               Characters, courses and their lessons (data/courses),
                      the taught shapes, the Find scenes, puzzles, memory levels,
                      navigation, socials, home panels
  lib/                Dictionaries and locale, trace scoring, jigsaw piece
                      and outline maths, the memory deal, the audio cue
                      player, the shared /learn route resolver
  store/              Progress, theme and page-transition state (zustand)
  types/              Shared TypeScript types
tools/
  picnic-scene/       Renders every clay picture in three.js (headless
                      Chromium): the Find scenes, the paint pots and the
                      things to paint, then crops them into layers — not
                      part of the site build
public/
  hero.webp           Home hero scene
  edenic-logo.png     Logo (imported statically, never referenced by path)
  assets/learn.jpg    Learn panel artwork
  assets/friends/     Mascot artwork
  assets/icons/       3D icons — Memory Match's card faces, the Play panel art
  assets/nav-icons/   The phone bottom bar's four masked icons
  assets/learn-with-pinki/  Pinki's poses
  assets/learn/pinki/       Course card art (placeholders until the course
                            art arrives), then each course's pictures and
                            reels (shapes/reels/1–4.mp4 are placeholders cut
                            from Big Buck Bunny, CC BY 3.0 Blender Foundation,
                            until the real reels replace them by name;
                            shapes/find/ holds the rendered Find scenes:
                            the circles' picnic, then squares/, triangles/
                            and rectangles/; colors/ holds the ten paint
                            pots, the things to paint (grey and painted),
                            the five color picnics and the same placeholder
                            reels. All pictures are rendered by
                            tools/picnic-scene — none come from outside)
  assets/play/              The fifteen puzzle pictures, the Memory Match
                            scene, the trail cloud and Nova's trail poses
```

## Current status

The home page, the friend picker, Pinki's lesson hub and the puzzles are built,
and all are still being iterated on visually.

**Learn is being rebuilt for children aged 5–9.** The old Numbers (1–9) and
Letters (A–Z) lessons were removed: children this age already know them. Pinki
has three courses — **Shapes**, **Colors** and **My Family** — and Nova and Bloo
are open with three each (Fruits & Vegetables, The Seasons, Months of the Year;
Animals, The Weather, My Body). Shapes and Colors are written; the other seven
list their lessons and show "coming soon". Every taught word is American
English (color, fall, mom).
Their pages are real. On a phone, the hub is Pinki saying hello above one big
clay card per course (its things piled on it, a play button, a progress bar),
and a course page is a banner over a winding clay path: one stop per lesson,
wearing that lesson's thing — ticked when done, bigger with a "Start" bubble
when it is next, padlocked after that. Inside a course only two hero colours
are used — Pinki's pink and the course's own colour (yellow for Shapes) — with
green kept for "Next". Tablets and desktops get their own layouts that fill
the screen: on the hub, Pinki greets the child beside an "Up next" card and
big course cards; a course's path winds across a board on a desktop; and a
lesson shows how its step is played and which lesson it is in panels beside
the step. On a desktop a lesson is an open stage: no board and no cards — the step stands straight on the page, the lesson's steps run as a trail of little discs across the top (done ones ticked, the current one its round task button, the rest faded), and the step's buttons sit centred under it. Both
pages have a Start / Continue / Next Lesson button.

**Shapes is fully written: one shape per lesson** — Circle, Square, Triangle,
Rectangle, then a Shape review. Every step has a round **task button** beside
the back button (no progress bar on a phone or tablet): a clay circle with the step's icon.
It is silent; tapping it opens a popup with a close button that plays a short
loop of how the step is done — only the first move, never the whole answer.
On a desktop the same button is the current stop of the step trail.
Every button of a step (Next, Your turn, Start over, Help, Play again) sits in
one spot, a little above the bottom bar. With a keyboard, Enter presses the way
onward (Skip, Your turn, Next) whenever nothing else has focus.

A shape lesson plays its reel full-screen — on a desktop, as a tall frame on
the same open stage as the steps (a round Skip button spins and moves
on; the lesson also moves on by itself when the reel ends, and a big Play button
appears if the browser refuses to start it). Then the word card: a big speaker,
the shape itself (large, on no tile, in soft clay with grain and shading, no shadow), and the word with each letter in its own clay colour. Then the
child traces the shape **in one stroke** from a marked start, following
direction arrows; lifting the finger ends the attempt, and it only passes if the
stroke went round the whole shape and stayed on the line. The line is drawn in
grained pink clay, like the start marker; a passed shape fills in the same clay
and turns into a real thing (a circle becomes a ball). Then the
child builds the word from shuffled letter tiles — tap a tile to send it to the
first empty space, or drag it into any space; with a keyboard, typing a letter
sends its tile and Backspace takes the last one back. On a desktop the tiles
wait in one row, each under a space. Only once every space is full is
the word checked: misplaced letters wiggle and fly back (the right ones stay),
and from the second miss an optional Help button puts the word together. A
Start over button sends every placed letter back.

Every shape lesson ends with **Find the shapes**: a 3D picnic scene where the
child taps every thing of that shape — four of them among clearly different
things, on a different blanket each time (circles: a plate, a donut, a cookie,
a beach ball; squares: toast, a present, a cracker, a die; triangles: cheese,
pizza, a sandwich, a flag; rectangles: a book, a chocolate bar, a juice box, a
ruler). Each find gets a ring and flies into a tray of sockets; wrong taps
wiggle, and after two the next one glows. The scenes are modelled and rendered
in three.js so every shape is true and everything shares one light and style.

The lesson-complete screen celebrates in three beats: a big Pinki cheering with
confetti, then the shape beside the child's own drawing of it and the word,
then a green pill whose padlock springs open on the next lesson (on a
desktop these sit side by side: Pinki big on the left, the rest on the
right, with no card around them). Its
**Next shape** button (Next lesson when the next one is not a shape) goes back
to the course path first: the finished stop takes its tick, the track draws on
to the next stop, its padlock springs off, and then
the next lesson opens by itself.

The **Shape review** brings the four shapes together. First a sorting game:
eight things from the picnics (a donut, a present, a slice of pizza, a
chocolate bar…) arrive one at a time and the child taps — or drags them into —
the box of their shape; the boxes fill up as they go. Then two picks where the
word ("square", "rectangle") is shown in clay letters above four shapes, and
finally one more drawing, a triangle. The done screen shows all four shapes
beside the child's drawing. The reels are placeholders until
the real clips arrive.

**Colors is written: one color per lesson** — red, blue, yellow, green,
orange, purple, pink, brown, black, white, then a Color review. A color is
shown as a clay paint pot of that color. Each color is met (the pot, and the
word written in its own color) and spelled straight away; then the child
**paints**: the color word appears in plain dark letters over a thing in grey
clay and a row of paint pots, and tapping the pot the word names spreads the
paint over the thing — it is reading, not guessing — then a second thing in
the same color: every step of a lesson is about its one color. Green, orange and purple are also **mixed** (blue + yellow = ?)
from colors already met. Then **Pop the balloons**: balloons of many colors
float up a patch of sky and the child pops only the ones of the lesson's
color. Every lesson ends by finding the things of its color in a picnic, and
the review sorts things into four color boxes, names a color from its word,
and spells two colors from the pot alone, with no word on screen.

The Colors course page is not a path but a **box of paint pots**: one pot per
color, empty grey clay with a padlock until its lesson opens, filled with its
paint (and its word in that color) once learned. Coming back from a finished
lesson, the next pot fills with paint as its padlock springs off, and then
the lesson opens by itself.

Other lessons use pick the right tile or count things into a basket, and on
the first one Pinki shows how. A wrong
answer only wiggles; after two, the right one glows, so nobody gets stuck.
Finishing a lesson opens the next. A lesson that is not written yet shows
its friend saying it is on its way. The shapes
are drawn from their own tracing outlines until their clay pictures arrive. Audio is designed
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

1. The other seven courses' lessons, one at a time, on the Shapes and Colors pattern (`edenic-plan.md` §5–§6)
2. Every course's real reels, then voice for every taught word, once the content is done
3. The trail itself — the path, the stage pages, and progress along it
4. Accounts, and the profile the "Join Edenic World" button and the Profile tab lead to

Audio narration is deliberately out of scope for the MVP, but the experience is
built around where it will go.
