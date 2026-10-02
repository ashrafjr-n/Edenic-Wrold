# Edenic World — the Learn plan

> The one plan for the new Learn. Pinki first; Nova and Bloo follow the same pattern.
> Last updated: 2026-10-02

---

## 1. The idea

Learn is for children aged **5–9**. Numbers 1–9 and the alphabet are gone, because
children this age already know them.

Three friends, three courses each (decided 2026-10-02):

- **Pinki**: Shapes · Colours · My Family
- **Nova**: Fruits & Vegetables · The Seasons · Months of the Year
- **Bloo**: Animals · The Weather · My Body

**The focus, in order:** (1) every lesson opens with a **video**; (2) **English
spelling** — a child of 5–9 learns to write every word they meet, in a way that
feels like play; (3) **fun activities**, not games for their own sake: hunts,
sorting, small challenges.

Every lesson is the same: **watch a reel → a few steps → done ⭐**. A Shapes
lesson teaches ONE shape: reel → word → trace → spell → find (§3). Every
course copies that rhythm (§6).
All three friends are open from the start. Real reels and sound are added
LAST, once every course is built (placeholders until then).

## 2. How it's organised

```
Friend → Course → Lesson (≈3 min) → 5 questions
Pinki    Shapes   1. Circle
```

| Page | Shows |
| --- | --- |
| `/learn` | the three friends (unchanged) |
| `/learn/pinki` | Pinki says hello, then one big clay card per course (phone) |
| `/learn/pinki/shapes` | a course banner, then the 5 lessons as a winding clay path + Continue (phone) |
| `/learn/pinki/shapes/1` | the lesson |

Lessons open one after another.

## 3. A lesson

**The Shapes lesson (approved flow, 2026-09-28 — later courses follow it):**

**On every step:** a round **task button** at the top, beside the back
button (no progress bar, no step list): a clay circle with the step's icon.
It makes no sound. Tapping it opens a popup in the middle of the screen with
an X, playing a short loop of how the step is done — only the first move,
never the whole answer (the first letter, the first part of the line, one
thing found). No Pinki picture or speech bubble anywhere on the steps, and
no Pinki popping in on a right or wrong answer. Every button (Next, Your
turn, Start over, Help, Play again) sits in the same spot, a little above
the bottom bar. On a desktop (2026-10-01) the lesson is an open stage — no
board, no cards around the steps — with the steps as a trail of discs across
the top (the one exception to "no step list"): done ones ticked, the current
one IS the round task button, the rest faded; the buttons sit centred under
the step.

1. **Watch 🎬**: the reel fills the whole screen on a phone (header above,
   bottom bar below; a tall 9:16 frame on tablet/desktop). A round **Skip**
   button sits in the bottom-right corner: it spins, then moves on. When the
   reel ends the lesson moves on by itself. If the browser refuses to start
   it, a big **Play** button sits in the middle.
2. **Word 🔊**: one big speaker button (the word's sound, when audio lands),
   the shape itself (big, no tile behind it), and the English word under it,
   every letter its own clay colour. **Next**.
3. **Trace ✏️**: Pinki draws it, then the child — in **one stroke**, from a
   clay start disc whose arrow shows the way, with chevrons round the dots.
   Lifting the finger ends the attempt: it passes only if the stroke went
   round the whole shape (90%, easing to 80% after misses) AND stayed on the
   line (85%); otherwise it flashes red and clears. The line is pink clay
   with grain, like the start disc; a pass fills the shape in the same clay,
   then it turns into a real thing (circle → ball, square →
   toast, triangle → cheese, rectangle → book).
4. **Spell 🔤**: the word on top, empty spaces under it, and its letters as
   shuffled clay tiles under those. **Tap** a tile → it flies to the first
   empty space; **drag** a tile → any space (a taken space swaps). Tap a placed
   tile to send it back. Nothing is judged until every space is full: right →
   celebrate + **Next**; wrong → the misplaced tiles wiggle and fly back
   (the right ones stay) and the child tries again, as often as they like.
   From the **second** miss **Help** also appears where Next goes (optional);
   Help puts the word together in order, then Next. **Start over** shows as
   soon as a letter is in, and sends every letter back.
5. **Find 🔍**: a 3D picnic scene, a different blanket per shape, four
   things of the shape among clearly different ones; tap every thing that
   is the shape. Each find gets
   a ring and flies into a tray of sockets; wrong taps wiggle; after two
   misses the next one glows. All found → they all jump → **Next**.
6. **Done ⭐**: a big Pinki cheering with confetti, high on the screen; the shape beside the child's own
   drawing and the word; a green pill whose padlock springs open on the next
   lesson. *Play again* / *Next shape* (*Next lesson* before the review).
   Next goes back to the course path, which walks on to the next stop
   (tick, track draws on, padlock springs off) and then
   opens that lesson by itself.

**The Shape review (lesson 5, approved design 2026-09-28):** no reel; every
step SHOWS what it is about, so nothing depends on hearing the question.

1. **Sort 🧺**: eight things from the four picnics (donut, ball, present,
   die, pizza, sandwich, chocolate bar, juice box) come one at a time; the
   child taps the box of its shape — or drags the thing onto it. Four clay
   boxes, each with its shape and word; a right box swallows the thing and
   keeps it as a little picture (the boxes filling up are the progress); a
   wrong box only wiggles the thing; after two misses the right box glows.
   All in → the boxes jump → **Next**.
2. **Pick the word 🔤** ×2: the word in clay letters ("square", then
   "rectangle" — the pair children mix up) above four shape tiles.
3. **Trace ✏️**: a triangle, as in the lessons.
4. **Done ⭐**: all four shapes and the child's triangle; *Finish*.

**Feedback in every step:** right → bounce + Next; wrong → soft shake, try
again, never the word "wrong"; wrong twice → the right answer glows. Nobody
gets stuck.

## 4. Question types

| Type | The child | Example |
| --- | --- | --- |
| **Pick** | taps 1 of 3–4 big tiles | "Which is the triangle?" |
| **Count** | taps objects in until there are enough | "Put 3 bananas in the basket" |
| **Trace** | draws over a dotted outline | "Draw a circle" |
| **Sort** | puts each thing in its shape's box (review) | "Put each thing in its shape's box" |

(Shapes also use its own Word, Spell and Find steps — §3.)

**Rule:** each question is one short line + big pictures. In the first question
of each lesson, Pinki shows how once. A child who can't read yet must still
understand every question.

## 5. The courses (release 1: 9 courses)

Only **Shapes** is built and approved. The other eight show their lessons as
"coming soon"; their titles below are a **proposal (§6), not yet approved**.
Words follow **British English** (colour, autumn, mum), the spelling Iraq's
school English uses, and come from the Cambridge Pre A1 Starters list where
the topic has one (months and seasons are A2 Flyers words — harder, so they
come last in Nova's set).

### Pinki · Shapes — one shape per lesson (BUILT)
| # | Lesson | Steps |
| --- | --- | --- |
| 1 | Circle | Reel, Word, Trace, Spell `circle`, Find the circles (picnic) |
| 2 | Square | Reel, Word, Trace, Spell `square`, Find the squares (mint picnic) |
| 3 | Triangle | Reel, Word, Trace, Spell `triangle`, Find the triangles (blue picnic) |
| 4 | Rectangle | Reel, Word, Trace, Spell `rectangle`, Find the rectangles (round yellow picnic) |
| 5 | Shape review | Sort ×8 things, Pick the word ×2 (square, rectangle), Trace a triangle |

### The other eight (lesson titles provisional)
| Friend | Course | Lessons |
| --- | --- | --- |
| Pinki | Colours | Red & Blue · Yellow & Green · Orange & Purple · Pink & Brown · Black & White · Colour review |
| Pinki | My Family | Mum & Dad · Brother & Sister · Grandma & Grandpa · Baby & Me · Family review |
| Nova | Fruits & Vegetables | Apple, Banana, Orange · Grape, Pear, Mango · Carrot, Tomato, Potato · Onion, Pea, Corn · Fruit or vegetable? · Market review |
| Nova | The Seasons | Spring · Summer · Autumn · Winter · Seasons review |
| Nova | Months of the Year | January–March · April–June · July–September · October–December · Months review |
| Bloo | Animals | Pets · On the farm · In the wild · In the sea · Babies & homes · Animals review |
| Bloo | The Weather | Sunny · Rainy · Cloudy & Windy · Snowy · Weather review |
| Bloo | My Body | My face · Head & hair · Arms & hands · Legs & feet · Body review |

## 6. Proposal: what goes inside every course (2026-10-02, awaiting approval)

### 6.1 One rhythm for every lesson (Shapes' flow, generalised)

**Watch 🎬 → Meet 🔊 → Do 🖐️ → Spell 🔤 → Hunt 🔍 → Done ⭐**, about 3 minutes.

- **Watch**: the reel (placeholder until Phase 6).
- **Meet**: the Word card — picture + the word in clay letters (+ its sound
  later). A lesson teaches **2–3 words**, never more (Shapes teaches 1).
- **Do**: the course's own hands-on step (trace, colour, dress, touch, mix…).
- **Spell**: the core. Every taught word is spelled (§6.2).
- **Hunt**: a short challenge in a scene — find, sort, put in order.
- **Review lesson** (last of every course): no reel; it re-asks every word of
  the course **from the picture only** (retrieval beats re-reading) and ends
  with the course's biggest hunt.
- **Warm-up (cheap spaced repetition):** from lesson 2 on, the first step is
  one word from the previous lesson, spelled from its picture.

### 6.2 The spelling ladder (one engine, data picks the rung)

| Rung | What the child does | Used for |
| --- | --- | --- |
| 1 | Spell with only the word's letters (today's Spell) | every first meeting |
| 2 | A few letters already placed, fill the gaps | long words: `February`, `September`, `vegetable`, `grandfather` |
| 3 | The word's letters + 2 decoy letters | review lessons |
| 4 | Picture only, word hidden — spell from memory | review lessons, warm-ups |
| 5 | Type it on the keyboard (desktop already has this) | ages 8–9 / desktop |

Months start with a **capital letter** — the first tile is the capital.

### 6.3 Activity library (reuse first, few new pieces)

| Activity | Status | Where |
| --- | --- | --- |
| Word, Spell, Trace, Pick, Count, Sort, Find (3D scene) | built | everywhere |
| **Find by tag**: Find with any target (a colour, an animal), not only a shape | small change | Colours, Fruits, Animals, Body |
| **Sort into any boxes** (season, home, fruit/veg, colour bucket) | small change | most reviews |
| **Spell rungs 2–4** (given letters, decoys, hidden word) | small change | §6.2 |
| **Colour it**: pick a paint pot, tap the thing | new | Colours |
| **Dress up**: drag things onto the friend (coat, umbrella, sunglasses) | new (drop-onto-zones) | Seasons, Weather |
| **Put in order**: a train of cards to arrange | new | Months, Colours (rainbow), Family (oldest→youngest) |
| **Touch it**: tap a part on one big picture ("Touch the nose") | Find on one picture | My Body, My Family |

### 6.4 Per course

**Pinki · Colours** — words: red, blue, yellow, green, orange, purple, pink,
brown, black, white. *Do*: **Colour it** (tomato → red, sea → blue). *Hunt*:
find every red thing in the picnic scene (Find by tag). Lesson 3 adds a
**mixing** Pick: red + yellow = ? (paint blobs). *Review*: sort things into
colour buckets, then put the rainbow in order.

**Pinki · My Family** (the simplest) — words: mum, dad, brother, sister,
grandma, grandpa, baby, me. Three-letter `mum`/`dad` make the easiest first
spells. *Do*: **Touch it** on a family photo ("Touch Grandma"). *Hunt*: who's
missing from the photo? *Review*: put the family in order, oldest → youngest,
then spell from the picture only.

**Nova · Fruits & Vegetables** — 3 words per lesson (apple, banana, orange,
grape, pear, mango, carrot, tomato, potato, onion, pea, corn). *Do*: **Count**
into a basket ("Put 3 bananas in the basket" — numbers sneak back in). *Hunt*:
find them on a market stall. Lesson 5: **Sort** fruit / vegetable. *Review*:
a shopping list — read the words, put the right things in the basket
(reading, not just spelling).

**Nova · The Seasons** — words: spring, summer, autumn, winter + one sign each
(flower, sun, leaf, snow). *Do*: **Dress up** Nova for the season. *Hunt*: the
same tree four times — tap the winter one. *Review*: sort things into four
season boxes; put the seasons in order round a circle.

**Nova · Months of the Year** (hardest words, comes after Seasons) — three
months a lesson; short ones (`May`, `June`, `July`) spelled whole, long ones on
rung 2. *Do*: **Put in order** (a month train). *Hunt*: "Which season is
December?" — months sorted into seasons (links to the course before).
*Review*: the whole year train + "When is your birthday?" (tap your month;
visual only, nothing stored).

**Bloo · Animals** — words: cat, dog, fish · cow, sheep, duck, horse · lion,
monkey, elephant, giraffe · whale, shark, octopus · puppy, kitten, nest.
*Do*: **shadow match** — which animal makes this shadow? (Pick; works with no
sound; becomes "who says moo?" once audio lands). *Hunt*: find the animals in
a farm / safari / sea scene. *Review*: sort animals into their homes.

**Bloo · The Weather** — words: sun, rain, cloud, wind, snow, then sunny,
rainy, cloudy, windy, snowy (the `-y` ending is a spelling lesson by itself).
*Do*: **Dress up** Bloo (umbrella, sunglasses, scarf). *Hunt*: "Make it
rainy" — pick what changes the sky. *Review*: weather report — read a short
sentence ("It is windy.") and pick its picture.

**Bloo · My Body** — words: eye, ear, nose, mouth, face, head, hair, arm,
hand, leg, foot. *Do*: **Touch it** on Bloo ("Touch the ear"). *Hunt*:
**build a monster** — "give it 3 eyes and 2 noses" (silly, counting + words).
*Review*: drag the words onto the body (label it), then spell from memory.

### 6.5 Open questions

- British spelling (`colour`, `autumn`, `mum`) — confirm.
- 2–3 words per lesson, or keep Shapes' one?
- New activities to build: Colour it, Dress up, Put in order — all three, or
  start with one?

Sources: Cambridge Pre A1 Starters wordlist (cambridgeenglish.org);
retrieval/spaced practice in child word learning (PMC8084525, PMC11087082);
letter-tile and missing-letter spelling apps (Letter Tiles, Spelling City);
months/seasons ESL lesson ideas (eslkidstuff.com).

## 7. Sound
None yet. Only the taught English words will be recorded (the word card's big
speaker). Step instructions are not spoken: the round task button SHOWS how
instead (decided 2026-09-28).

## 8. Not now (on purpose)
Collections, "Is Pinki right?", hint friends, translate button, questions inside
the reel, question types beyond §6.3. Add one only if testing with
children shows it's needed.

---

## 9. Build plan

Each phase ends with typecheck + lint passing, the dev server clean, and the
docs (README, CLAUDE.md, `claude-docs/`) updated.

### Phase 1 — Clean-up
- [x] Delete Letters completely: components, data, lib, types, assets, dictionary
      namespaces, CSS, routes' letter branches.
- [x] Delete Numbers' **content**, but keep its **layout**: the course page
      (sticky hero + white sheet + rows + Continue, phone and desktop trees)
      becomes a generic **course page**, and `NumberList` becomes **`LessonList`**.
- [x] Keep the pieces the new lessons reuse and move them to
      `components/learn/lesson/`: trace board + scoring, the video player, the
      question panel, the count-into-a-container interaction, the speaker slot,
      the progress bar, Pinki's speech bubble.
- [x] Lesson pages show a "Pinki is getting this lesson ready" card until
      Phase 3.
- [x] Pinki's hub shows two course cards: **Shapes** (open) and **Adding** (open).

### Phase 2 — Data model
- [x] Types: `LessonDef`, `Question` (`pick | count | trace`), `Face`
      (`types/course.ts`). A course is the existing `Lesson` type. The audio id
      of each line is derived from where it sits (`lessonCue` in `lib/cue.ts`)
      instead of a stored `say` field — one source, nothing to drift.
- [x] `data/courses/pinki-shapes.ts` and `pinki-adding.ts`. Lesson 1 of each is
      written (to prove all three question types); lessons 2–5 are empty and
      show the "on its way" card until Phase 4–5.
- [x] Seeded shuffle moved to `lib/seeded.ts` (no `Math.random()`).
- [x] Progress: reuse the store; key `pinki.shapes.1`, star on finish.

### Phase 3 — Lesson player
- [x] One client component: **Watch → Play (5) → Done** (`LessonPlayer`). Watch
      is skipped while a lesson has no reel.
- [x] **Pick**, **Count**, **Trace** as three components fed only by data.
- [x] Wrong/right/wrong-twice behaviour (§3), Pinki's "show once" on question 1.
- [x] Dictionary strings in en / ar / ku (Kurdish needs a native check).
- [x] Measured at 390 / 820 / 1440 in a headless browser: both written lessons
      play through with no page scroll, no overflow, no console errors; back
      button in its one spot.

### Phase 4 — Shapes course
- [x] New flow (§3): full-screen reel + Skip, word card, spelling board with
      tap/drag and Help. Measured at 375/390/820/1440, en/ar/ku, dark mode.
- [x] 5 lessons of data (one shape each + review).
- [x] Task chip + Pinki peek replace the coach; one-stroke accurate tracing
      with start/arrows and fill → thing; Find the circles (3D picnic scene);
      new done screen; Play fallback for a blocked reel. Phone measured at
      375x667 and 390x844.
- [x] A Find scene for squares, triangles and rectangles (lessons 2–4) —
      same pipeline, `tools/picnic-scene`, each on its own blanket.
- [x] Polish round (phone): round silent task button with a how-to popup,
      no Pinki peek, clay trace line and fill, Start over on Spell, every
      button in one raised spot, bigger raised Pinki on Done.
- [x] Shape review (lesson 5) rebuilt: Sort (new), two word picks, a
      trace — measured at 375x667 and 390x844.
- [x] Desktop pass (2026-09-30): one three-column workspace of one height,
      the reel and every step on a board in the course colour, the lesson
      list, a two-column done screen, keyboard (type the word, Enter goes
      on) — measured 1024x768 to 1920x1080, phone pixel-identical.
- [x] Desktop open stage (2026-10-01): no board, no wrapping cards, a step
      trail on top, buttons centred under the step.
- [ ] The 4 real reels replace the placeholders (same file names).
- [ ] Shape pictures in place (§10), if still wanted.
- [ ] Play it through on a phone; test with one child aged 5–6 and one aged 8–9.

### Phase 5 — The other eight courses
- [x] Adding dropped; Pinki's courses are Shapes · Colours · My Family; Nova
      and Bloo open, each with three courses whose lessons show "coming
      soon" (titles provisional, 2026-10-02).
- [ ] §6 proposal approved (or changed) — then lesson titles fixed.
- [ ] Engine additions (§6.3), each built once and fed by data.
- [ ] Pictures + scenes per course, then lesson data, in this order:
      Colours → My Family → Fruits & Vegetables → The Seasons → Months →
      Animals → The Weather → My Body.
- [ ] Play each course through on a phone.

### Phase 6 — Reels, sound, finish
- [ ] Every course's reels replace the placeholders (same file names).
- [ ] Audio: every taught word recorded (§7), `playCue` wired.
- [ ] Test with one child aged 5–6 and one aged 8–9; fix what it shows.
- [ ] Final docs pass.

---

## 10. Assets

**Pictures** (AI clay, same style as `public/assets/icons/giraffe.png`):

```
A single {THING} as a cute 3D clay toy, glossy soft vinyl finish, rounded shapes,
pastel colours, soft light, centred, plain white background, no text, no shadow.
```

| Folder | Files |
| --- | --- |
| `public/assets/learn/pinki/shapes/` | `circle.png` `square.png` `triangle.png` `rectangle.png` · `pizza.png` `clock.png` `window.png` `door.png` `book.png` `cake-slice.png` `kite.png` `plate.png` `phone.png` `ball.png` |
| `public/assets/learn/pinki/` | `course-shapes.png` (card icon) |
| `public/assets/learn/{friend}/{course}/` | each new course's pictures, same prompt (§6.4 lists the words) |

**Find scenes** (in place): `public/assets/learn/pinki/shapes/find/` —
`picnic.jpg` (the circles' empty scene) and one PNG per thing (plate, donut,
cookie, ball, toast, cheese, book, kite); `squares/`, `triangles/`,
`rectangles/` each hold a `ground.jpg` and their things. All rendered by
`tools/picnic-scene` (three.js, pastel clay materials, one camera and light). Low-poly downloaded models
(Kenney CC0) were tried and rejected: their "circles" are hexagons.

**Reels** (from the company, vertical mp4, ~25 s):

| Folder | Files |
| --- | --- |
| `public/assets/learn/pinki/shapes/reels/` | `1.mp4` … `4.mp4` (circle, square, triangle, rectangle; placeholders in place now) |
| `public/assets/learn/{friend}/{course}/reels/` | `1.mp4` … `n.mp4`, one per lesson (placeholders until Phase 6) |

PNG with or without background is fine: background removal and un-matting are
done on our side. Pictures are imported in code; reels are played by path.
