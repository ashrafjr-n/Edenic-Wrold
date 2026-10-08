# Edenic World — the Learn plan

> The one plan for the new Learn. Pinki first; Nova and Bloo follow the same pattern.
> Last updated: 2026-10-08

---

## 1. The idea

Learn is for children aged **5–9**. Numbers 1–9 and the alphabet are gone, because
children this age already know them.

Three friends, two courses each (decided 2026-10-02; Months of the Year and
My Body removed 2026-10-08, direct request):

- **Pinki**: Shapes · Colors (My Family cancelled 2026-10-02 — rethink from the videos)
- **Nova**: Fruits & Vegetables · The Seasons
- **Bloo**: Animals · The Weather

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
| `/learn/pinki/shapes` | a course banner, then the 5 lessons as a box of things (like Colors) + Continue |
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

## 5. The courses (release 1: 6 courses)

Decided 2026-10-02: **American English** everywhere a word is taught (color,
fall, mom — the most widespread spelling), **1–2 new words per lesson**, and
the courses are built ONE AT A TIME: build → the user checks → fix → next.
Order: Colors → Fruits & Vegetables → The Seasons → Animals → The Weather.
Words come from the Cambridge Pre A1 Starters list where the topic has one
(seasons are A2 words — the hardest, so they come last in Nova's set).

### Pinki · Shapes — one shape per lesson (BUILT)
| # | Lesson | Steps |
| --- | --- | --- |
| 1 | Circle | Reel, Word, Trace, Spell `circle`, Find the circles (picnic) |
| 2 | Square | Reel, Word, Trace, Spell `square`, Find the squares (mint picnic) |
| 3 | Triangle | Reel, Word, Trace, Spell `triangle`, Find the triangles (blue picnic) |
| 4 | Rectangle | Reel, Word, Trace, Spell `rectangle`, Find the rectangles (round yellow picnic) |
| 5 | Shape review | Sort ×8 things, Pick the word ×2 (square, rectangle), Trace a triangle |

### Pinki · Colors — one color per lesson (BUILT, 2026-10-02)
Direct request: "each color on its own", plus a new activity only colors can
have, and a course page that is not a map. The colors in the order children
are taught them: the three primaries, what they make, then the rest. A color
is shown as a **clay paint pot** in that color (word card, paint buttons,
sort boxes, done screen, the course page).

| # | Lesson | Steps |
| --- | --- | --- |
| 1 | Red | Reel · Meet · Spell · Paint (apple, strawberry) · Pop the red balloons · Find the red things |
| 2 | Blue | … · Paint (fish, whale) · Pop · Find |
| 3 | Yellow | … · Paint (duck, banana) · Pop · Find |
| 4 | Green | … · Paint (frog, pear) · **Mix: blue + yellow = ?** · Pop · Find |
| 5 | Orange | … · Paint (carrot, orange) · **Mix: red + yellow = ?** · Pop · Find |
| 6 | Purple | … · Paint (grapes, eggplant) · **Mix: red + blue = ?** · Pop · Find |
| 7 | Pink | … · Paint (pig, ice cream) · Pop · Find |
| 8 | Brown | … · Paint (teddy bear, acorn) · Pop · Find |
| 9 | Black | … · Paint (hat, ant) · Pop · Find |
| 10 | White | … · Paint (snowman, sheep) · Pop · Find |
| 11 | Color review | Sort ×8 into four color boxes · Pick the color a word names ×2 (brown, orange) · Spell from the pot alone ×2 (green, pink) |

- **Meet → Spell** straight away; the word in its own color.
- **Paint**: the color word in plain dark letters, the thing in grey clay,
  a row of pots (the lesson's color + ones already learned). Tap the pot the
  WORD names → the paint spreads. Two things, BOTH in the lesson's own color
  (direct request: every step of a lesson is about its one color — other
  colors only appear as choices).
- **Pop the balloons** (new, colors only): balloons of many colors rise up a
  patch of sky; pop the four of the lesson's color, leave the rest. The color
  is the only thing that tells them apart.
- **Mix** (green, orange, purple — the colors made from ones already met).
- **Find**: a rendered picnic per color, four things of it among others.
- **The course page is a box of paint pots, not a map**: ten pots and the
  review. A pot is empty grey clay with a padlock until its lesson opens;
  the open one shows its paint, a ring in its color and "Start"; a learned
  one keeps its paint, its word in its color and a tick. Back from a
  finished lesson, the next pot fills with paint as its lock springs off.

### The other four (lesson titles provisional until each is built)
| Friend | Course | Lessons |
| --- | --- | --- |
| Pinki | ~~My Family~~ | CANCELLED 2026-10-02 (family words are relationships, not things) — rethink from the videos |
| Nova | Fruits & Vegetables | Apple · Banana · Orange · Grapes · Carrot · Broccoli · Corn · Potato · Market review (built 2026-10-02; reworked 2026-10-03; its third step is **Nova's cups** since 2026-10-08 — the food under one of three cups, a random one every round, the cups swap and the child finds it; one miss and the round starts again. Grow it, its step from 2026-10-07, was replaced. The foods are drawn the friends' way: chubby velvet clay with the buttons' grain and the friends' face. Review: a mixed juice, a soup, "Do you like…?", two picture spells, then the exam — pick Nova's list off three plants into one basket, twice) |
| Nova | The Seasons | Spring · Summer · Fall · Winter · Seasons review (built 2026-10-02; reworked 2026-10-04: word → spell → make the season come on Nova's tree island; review: sort eight things into four season boxes, order the four, two picture spells) |
| Bloo | Animals | Cat · Dog · Cow · Fish · Animals review (built 2026-10-07, one animal a lesson: word → spell → **feed it** since 2026-10-08 — three bites of its own food, dragged or tapped into its mouth; Fill the word, its step from 2026-10-07, was replaced. The animals, their homes and their food are drawn the friends' way: velvet clay with the buttons' grain and the friends' face. Review: sort eight animals — each in two coats — into their four homes, then two picture spells) |
| Bloo | The Weather | Sunny · Rainy · Windy · Snowy · Weather review (built 2026-10-08, one weather a lesson — Cloudy dropped: two words in one lesson, and nothing of its own to do: word → spell → **make it by hand** since the same day (the user did not like Dress Bloo and chose this from four options): tap the cloud and it rains, push the clouds off the sun, swipe the sky and the wind blows, shake the cloud and it snows — three goes each. Each weather is the same place, Bloo's hill, under it. Review: sort eight things a child needs for the weather into the four weathers, read two weathers' words and pick their pictures, two picture spells) |

**Removed 2026-10-08 (direct request "احذفها نهائيا"):** Nova's Months of the
Year (its year wheel, its art and its strings — in git history, `months wheel
V1.0–V2.5`) and Bloo's My Body (never written: its "coming soon" lessons,
strings and the hand/foot art).

## 6. How every course is built

### 6.1 One rhythm for every lesson (Shapes' flow, generalised)

**Watch 🎬 → (Meet 🔊 → Spell 🔤) per word → Do 🖐️ → Hunt 🔍 → Done ⭐**,
about 3 minutes.

- **Watch**: the reel (placeholder until Phase 6).
- **Meet**: the Word card — picture + the word in clay letters (+ its sound
  later). **1–2 words per lesson.**
- **Spell**: right after the word is met. The core of every lesson (§6.2).
- **Do**: the course's own hands-on step (trace, paint, mix, dress, touch…).
- **Hunt**: a short challenge in a rendered scene — find, sort, put in order.
- **Review lesson** (last of every course): no reel; it re-asks every word of
  the course **from the picture only** (retrieval beats re-reading) and ends
  with the course's biggest hunt.

### 6.2 The spelling ladder (one engine, data picks the rung)

| Rung | What the child does | Used for |
| --- | --- | --- |
| 1 | Spell with only the word's letters, the word shown (today's Spell) | every first meeting |
| 2 | A few letters already placed, fill the gaps | long words |
| 3 | The word's letters + 2 decoy letters | later reviews |
| 4 | Picture only, word hidden — spell from memory | review lessons |
| 5 | Type it on the keyboard (desktop already has this) | ages 8–9 / desktop |

### 6.3 Activity library (reuse first, few new pieces)

| Activity | Status | Where |
| --- | --- | --- |
| Word, Spell, Trace, Pick, Count, Sort, Find (3D scene) | built | everywhere |
| Find / Sort by color (not only shape) | Colors | Colors, Fruits, Animals |
| Word card and Spell with a picture (rung 4: picture, no word) | Colors | every course |
| **Paint**: read the word, tap its pot, the paint spreads | Colors (new) | Colors |
| **Mix**: a Pick of pots — red + yellow = ? | Colors (Pick) | Colors |
| ~~Dress Bloo~~: what a weather needs onto Bloo's own picture | removed 2026-10-08 (the same day — not liked) | — |
| **Make the weather by hand**: three goes on Bloo's hill, each weather its own gesture — tap the cloud (rain), push the clouds off the sun, swipe the sky (wind), shake the cloud (snow); a tap always works too | built (`weather`) | Weather |
| **Put in order**: tap them in order into numbered spaces | built (`order`) | Seasons review |
| **Make it**: drag the thing the word names into Nova's blender (juice) or soup pot (soup) | built (`make`) | Fruits review |
| ~~Fill the word~~: rub each empty letter and it fills with small pictures of the thing | removed 2026-10-08 | Fruits dropped it 2026-10-07 ("not suitable"), Animals 2026-10-08 — its last course |
| **Feed it**: three bites of the animal's own food lie in front of it (milk, a bone, grass, fish food); drag one onto it or tap it and it flies into its mouth — it munches, a heart floats up | built (`feed`) | Animals |
| **The magic button**: the picture starts bare; tap the glowing spot and the next part spreads over it from there — Make it {season} (grass, leaves, blossoms…) | built (`change`) | Seasons (Fruits' Grow it and Months' wheel went with them, 2026-10-08) |
| **Nova's cups**: the thing goes under one of three cups (a random one every round), they swap places at a medium speed, the child taps the right cup; one miss and the round starts again, a little slower | built (`cups`) | Fruits |
| **Pick Nova's list** (an exam): three plants, one basket, a list — "3 apples · 2 oranges · 1 banana" — read each line and count; one too many wiggles back | built (`harvest`) | Fruits review |
| **Touch it**: tap a part on one big picture | later (Find on one picture) | My Family |

### 6.4 The other courses, in short (detailed when each is built)

- **My Family** (simplest): mom, dad, brother, sister, grandma, grandpa, baby,
  me. `mom`/`dad` are the easiest first spells. Touch it on a family photo;
  review: put the family in order, oldest → youngest.
- **Fruits & Vegetables** (BUILT as "Nova's market", 2026-10-02, reworked
  2026-10-03, its Fill the word replaced by Grow it 2026-10-07, and Grow it
  by **Nova's cups** 2026-10-08 — see §5 and `learn-courses.md`; what
  follows was the first idea): Count into a basket ("Put 3 bananas in the
  basket"), find them on a market stall, sort fruit / vegetable; review: a
  shopping list to read and fill.
- **The Seasons** (BUILT 2026-10-02, reworked 2026-10-04 — see §5 and
  `learn-courses.md`): the same tree with a face on a clay island, four
  times; each lesson makes its season come on it, step by step.
- **Animals** (BUILT 2026-10-07, "simple, like the rest"; reworked
  2026-10-08): cat, dog, cow, fish — chibi animals in the friends' look
  (velvet clay, the grain, the friends' face); each lesson is reel → word →
  spell → **feed it** (its own food, a bite at a time — something you DO
  with an animal; it replaced Fill the word, which the user had called "not
  suitable" for Fruits). The first idea, a Find in a farm/sea scene, was
  dropped: finding the cat among others is choosing inside a one-thing
  lesson. Review: sort the four, each in two coats, into their
  homes (cat bed, kennel, barn, fishbowl — each box labelled with the
  animal's word), then spell dog and fish from a picture.
- **The Weather** (BUILT 2026-10-08, on request "weather الان" to the plan
  of the same day): sunny, rainy, windy, snowy — all four end in `-y`.
  Each is ONE place, Bloo's hill (his blue-roofed house, a round tree),
  under the weather (the Seasons rule: the difference between the
  pictures IS the weather). Each lesson is reel → word ("It is sunny!") →
  spell → **make it by hand** (2026-10-08, the user's pick after Dress
  Bloo — "not really liked"): three goes, each weather its own gesture —
  tap the cloud and it rains harder (puddles grow), push the three clouds
  off the sun (the hill brightens), swipe across the sky (the tree bends,
  leaves and the kite fly), shake the cloud (snow until the hill is white
  and a snowman stands). Close to the Seasons' magic button, which the
  user was told and chose anyway ("نفذ هاي اشوف"). Review: sort eight
  things a child needs for the weather into four weather boxes (three hats
  to tell apart), read "rainy" and "windy" and pick their pictures, spell
  sunny and snowy from the picture.

Sources: Cambridge Pre A1 Starters wordlist (cambridgeenglish.org);
retrieval/spaced practice in child word learning (PMC8084525, PMC11087082);
letter-tile and missing-letter spelling apps (Letter Tiles, Spelling City);
color-mixing and color-hunt activities for 4–7 year olds
(littlebinsforlittlehands.com, empoweredparents.co).

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

### Phase 5 — The other courses, one at a time
- [x] Adding dropped; Pinki's courses are Shapes · Colors · My Family; Nova
      and Bloo open, each with three courses whose lessons show "coming
      soon" (titles provisional, 2026-10-02).
- [x] §5–§6 approved with changes (2026-10-02): American English, 1–2
      words a lesson, one course at a time, the user checks each.
- [x] **Colors** (2026-10-02): ten paint pots, eight things to paint (grey
      + painted) and five color picnics rendered; Find/Sort by color,
      picture Word/Spell (rung 4), Paint, Mix; color words in their own
      color (Meet/Spell) or plain ink (Paint, Pick — they must be read);
      six lessons of data; all six played through at 375x667, 390x844,
      820x1180, 1440x900, dark mode checked.
- [x] The user checked Colors (2026-10-02): one color per lesson, a new
      colors-only activity (Pop the balloons), the course page as a box of
      paint pots — done the same day, all 11 lessons played through.
- [ ] The user checks Colors again → fixes.
- [x] My Family built (2026-10-02), then CANCELLED the same day — family
      words are relationships, not things; rethink it from the videos.
- [x] Nova's three built at once on request (2026-10-02): Fruits &
      Vegetables, The Seasons, Months (order-based) — all 19 lessons
      played through headless.
- [x] Fruits restructured as "Nova's market" (2026-10-02, on request, after
      research): bag → cut → shopping list → spell; review: salad, soup,
      "Do you like…?", spelling.
- [x] Fruits reworked (2026-10-03, on request): the word card (picture +
      speaker) → spell → **Make it** (drag the fruit the word names into
      Nova's 3D blender → its juice rises and a glass pours out; a
      vegetable goes into the soup pot) → the shopping list from lesson 2;
      the bag and the cut removed (neither needed the word). Review: a
      mixed juice and a soup from word-only recipes, "Do you like…?", two
      picture spells. All 9 played through headless at 375x667 → 1440x900.
- [x] Fruits steps 4–5 replaced (2026-10-03, on request: "no choosing —
      the child knows it is the apple lesson; consolidate the word"):
      **Fill the word** (rub the empty letters, they fill with the thing)
      → **Pick them** (Nova's garden: a tree, a banana plant, a vine, a
      vegetable bed, corn — five into her basket, the word at each, its
      plural at the end). The juice and the soup are the review's only;
      the shopping list went. All 8 lessons + the review played through
      headless (375x667 → 1440x900, en/ar/ku).
- [x] Fruits review on a phone tidied and the pick made an exam
      (2026-10-03, on request): the recipes' words stand whole across the
      top, bigger pictures, the thumbs beside the thing over their plates;
      the pick left the eight lessons (they end with Fill the word) and
      closes the review twice — three plants and one basket, "3 apples ·
      2 oranges · 1 banana", then "1 potato · 3 carrots · 2 bananas". All
      played through headless (360x640 → 1920x1080, no scroll).
- [x] The exam made prettier (2026-10-04, on request: "the basket out
      of the trees' card"): Nova's basket stands on the page beside her
      list (under it on a desktop), rendered on its own and larger; the
      gardens lost their empty bottom grass; the list is three rows, a
      full line's speaker turning into a tick; a picked one flies out of
      the garden over the basket and drops in. Played through headless
      (360x640 → 1920x1080, both gardens, en/ar/ku, no scroll).
- [x] Seasons reworked (2026-10-04, direct request "video, sound, letters,
      then one simple useful activity; the 3D pictures make no sense —
      clearer, like the Edenic friends, clay"): every season is the SAME
      island with a tree that has the friends' face, rendered frame by
      frame; lessons are reel → word → spell → **Make it {season}** (tap
      four glowing spots, the season spreads over the island); the pick
      and the picnic Find left the lessons (no choosing in a one-thing
      lesson). Review: Sort eight new things, Order, two picture spells.
      Played through headless (360x640 → 1920x1080, en/ar/ku, dark).
- [ ] The user checks Seasons → fixes.
- [x] Months reworked as Nova's year train (2026-10-04, direct request
      "نفذ" to the plan): every month a wagon of Nova's engine (gold, the
      friends' face), its number on its side, in its season's color with
      the Seasons course's things as cargo; lessons are reel → 3 words →
      spell → **Build the train** (the old text-tile Order and the
      "after" pick left the lessons). Review on plain wagons (names only):
      the train (Jan/Apr/Jul/Oct), Feb/May/Aug/Nov into the four season
      islands, after December, spell June. The 12-wagon "missing wagons"
      train of the plan did not fit a phone (a wagon ~26px) — four wagons,
      one per lesson, test the same order. Played through headless
      (360x640 → 1440x900, en/ar/ku, dark).
- [x] The user checks Months → closed: Months removed 2026-10-08.
- [x] The user's verdict on every course's extras (2026-10-07): every
      lesson opens with video → sound → spell; Shapes, Colors and Seasons'
      extras are right; Fruits' Fill the word "not suitable"; Months "all
      bad". Colors already had its sound card (checked in the app). The
      Seasons magic-button step lost its speaker (on request).
- [x] **Fruits: Grow it** (2026-10-07, "grow it جميل نفذها"): each food
      grows on a clay island in four magic-button taps — seed → sprout →
      young plant → in flower → the food (a root pulled up); eight foods
      rendered from Nova's existing plants; Fill the word and its fill
      pictures left Fruits. Played through headless (360x640 → 1440x900,
      en/ar).
- [x] **Months: Nova's year wheel** (2026-10-07, "نفذ الي بتشوفو مناسب"):
      the train, its art and its step deleted; lessons are 3 words →
      spell → add the months (the magic button on the wheel); review:
      order, sort (months marked on a plain wheel), after December, spell
      June. Played through headless (360x640 → 1440x900, en/ar/ku, dark).
- [x] The user checked Fruits' Grow it and the Months wheel (2026-10-08):
      Months and Bloo's My Body removed entirely; Grow it replaced (below).
- [x] **Animals** built (2026-10-07, "بسيط نفس الباقي"): Bloo's blue; four
      chibi clay animals with the friends' face (two coats each) and their
      four homes rendered; lessons reel → word → spell → fill; review: sort
      eight into the homes, spell dog and fish from the picture. Played
      through headless (360x640 → 1440x900, en/ar/ku, dark).
- [x] The user checks Animals (2026-10-07): "later" — then (2026-10-08)
      the plan to replace Fill the word with Feed it and redraw the
      animals the friends' way was approved ("جميل نفذ اقتراح animals").
- [x] **Fruits: Nova's cups + the friends' look** (2026-10-08, direct
      request): the third step is a cups game — the food under one of
      three cups (a random one every round), the cups swap at a medium
      speed, tap the right one; a miss shows where it went and starts the
      round again, a little slower; the task button's demo never shows
      where the food is. Grow it, its 40 frames and its render mode
      deleted. The eight foods re-rendered the friends' way (chubby velvet
      clay, the buttons' grain, the friends' face — their own files, the
      Colors course keeps its paint pictures) and the review's two gardens
      re-rendered with them. Played through headless (360x640 → 1440x900).
- [ ] The user checks Fruits' cups and the new fruit → fixes.
- [x] **Animals: Feed it + the friends' look** (2026-10-08): the third
      step is now Feed it — the animal, and three bites of its own food in
      front of it (a bottle of milk, a bone, a tuft of grass, fish food);
      drag one onto the animal or tap it and it flies into its mouth, the
      animal munches and a heart floats up; three → its word is said and
      it jumps. Nothing to choose, nothing wrong — a bite let go anywhere
      else goes back. The task button's demo feeds one bite. Fill the word
      deleted (its step, demo, strings, CSS and pictures — Animals was its
      last course). The eight animals and their four homes re-rendered the
      friends' way (velvet clay, the buttons' grain, the friends' face; the
      dog's and the cow's smile on their muzzle) and the four foods
      rendered. All four lessons + the review played through headless
      (360x640 → 1440x900, en/ar/ku, dark), the Feed step by tap, drag
      and keyboard.
- [ ] The user checks Animals' Feed it and the new animals → fixes.
- [x] **The Weather** (2026-10-08, "weather الان"): four lessons + the
      review (above). Art: Bloo's hill under each weather and the eight
      things he wears, rendered the friends' way; his horns cut out of his
      own picture so a hat sits under them; where each thing lies fitted
      on his picture. The Dress step and its demo; the weather comes as
      falling, drifting or twinkling icons. The "coming soon" Weather and
      its borrowed art (`data/course-art.ts`, `learn/art/`) deleted. All
      five played through headless (360x640 → 1440x900, en/ar/ku, dark).
- [x] The user checks The Weather (2026-10-08): "not really liked" →
      four options offered (catch the weather, make it by hand, Vehicles,
      Toys); the user chose **make it by hand** ("نفذ هاي اشوف"). Built
      the same day: each weather's hill rendered step by step with its
      sky on layers of its own (`render.cjs weathersteps`), the drops,
      flakes, leaves, swirls and sparkles; the step (`weather`) and its
      gesture demo. Dress Bloo deleted (its step, demo, strings, CSS, the
      horns cut-out); his eight things stay as the review's. All five
      played through headless with the real gestures and with taps
      (360x640 → 1440x900, en/ar/ku, dark).
- [ ] The user checks the weather made by hand → fixes.

### Phase 6 — Reels, sound, finish
- [ ] Every course's reels replace the placeholders (same file names).
- [ ] Audio: every taught word recorded (§7), `playCue` wired.
- [ ] Test with one child aged 5–6 and one aged 8–9; fix what it shows.
- [ ] Final docs pass.

---

## 10. Assets

**Every picture and scene is made on our side** (decided 2026-10-02 — the
user's own pictures were weaker than the rendered ones, so none are expected
from them): clay things are modelled and rendered in three.js by
`tools/picnic-scene` (one camera, light and clay for the whole site), and
anything else is downloaded with a free licence (CC0 / CC BY, noted in the
README). Only the **reels** come from outside.

| Folder | Files |
| --- | --- |
| `public/assets/learn/pinki/shapes/` | `circle.png` `square.png` `triangle.png` `rectangle.png` · `pizza.png` `clock.png` `window.png` `door.png` `book.png` `cake-slice.png` `kite.png` `plate.png` `phone.png` `ball.png` |
| `public/assets/learn/pinki/` | `course-shapes.png` (card icon) |
| `public/assets/learn/pinki/colors/` | `pots/<color>.png` (ten paint pots) · `paint/<thing>.png` + `<thing>-blank.png` · `find/<lesson>/` scenes |
| `public/assets/learn/{friend}/{course}/` | each later course's pictures, rendered the same way |

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

Pictures are imported in code; reels are played by path.
