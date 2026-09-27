# Edenic World — Learn, v2 plan

> Second pass on `improve.md`, rebuilt around the decisions made after it.
> Shorter on theory, heavier on what we actually build, in what order, with what
> assets. Where the two files disagree, **this one wins**.
> Date: 2026-09-27
>
> **Note:** `improve-3.md` is the simpler plan we are building. It wins over this file.

---

## 0. Locked decisions

| Question | Decision |
| --- | --- |
| Age | **5–9** |
| Navigation | **Lists, not maps.** Keep today's hub/list style, closer to the three reference boards (hero banner → chips → course cards → numbered lesson rows → quiz screen), rendered in **our clay**, not their soft-neumorphic look |
| Audio | **Everything is built audio-ready. No audio ships until the rest is done.** Then we record exactly what we built (§7) |
| Numbers & Letters | **Retired from Learn.** A 5–9 year old already knows them. Their best components are kept as templates (§4.3) |
| Reels | The company already makes **short educational song reels of all three characters, near-daily, on any topic**. **Reels are the spine of Learn.** YouTube long-form is ignored here |
| Assets | Prefer **easy-to-source or AI-generated** images. The creativity goes into the **site's design**, not into bespoke illustration |

### About Nova and "Word Sky"
Nova is the **white** friend, so "Word Sky" (stars) had nothing to do with who
she is. **Drop it.** Use her real identity instead:

> **Nova is a blank page.** She is the only white friend, so words fill her
> world with colour. She is the friend you *dress, decorate and put things
> around* with English words. Her hub is **"Words with Nova"**.

That turns her look into her signature mechanic (§5.2) instead of a name on a
map. Her UI accent stays the existing lavender `--color-nova`, because white on
a white card can't carry a button.

---

## 1. What makes Edenic different (the five things to protect)

Checked against Khan Academy Kids, Lingokids, Duolingo ABC, HOMER, Lamsa and
Adam Wa Mishmish (sources in `improve.md` §15). None of them has all five:

1. **Our own characters sing every lesson.** Every competitor licenses or
   commissions a limited set of videos. We have a daily reel pipeline of the
   same three friends the child meets in the lesson. **The reel is the lesson's
   opening, its images and its reward.** Nobody else can copy this cheaply.
2. **English taught in the child's language.** Instructions, hints and praise
   come in Arabic, Badini Kurdish or English; the taught content stays English.
   A **Bridge button** reveals the word in the child's language on demand. No
   major product does this for Arabic- and Kurdish-speaking 5–9 year olds.
3. **The child teaches the friend.** In every lesson a character gets something
   wrong and the child fixes it (§3, step 4). Learning-by-teaching (the "protégé
   effect") makes children work harder for a character than for themselves.
4. **Three friends, three kinds of help.** When a child is stuck they can
   **call a friend**: Pinki shows it with things to count, Nova says it in
   words, Bloo shows a picture. Research on feedback in early-learning games
   finds most games only say right/wrong. Ours explains, and each explanation
   comes from a character the child knows.
5. **Things you collect, never things you lose.** Each friend keeps a
   collection that fills as the child learns: Pinki's Shelf, Nova's Wardrobe,
   Bloo's Field Journal. No streak to break, no hearts, no timer.

---

## 2. Screens (list style, from the reference boards, in clay)

Routes stay **exactly as they are today**. Only what they show changes:

```
/learn                               friend picker (unchanged)
/learn/[character]                   character hub  → list of COURSES
/learn/[character]/[course]          course page    → numbered LESSONS
/learn/[character]/[course]/[lesson] lesson player
```

In code a "course" is today's `Lesson` type (`data/lessons.ts`, `totalItems`),
and a "lesson" is today's item. No routing work is needed.

### S1 — Character hub (reference: "Math" board 1, "My Courses" board 3)
- **Hero banner** (clay, character accent): the character, a headline
  ("Let's make maths fun!"), and a **"Today's reel"** thumbnail with a play
  button. It opens the newest reel for that character in a vertical 9:16 sheet.
- **Topic chips:** All · Shapes · Adding · … Filter state lives in the URL
  (`?topic=shapes`) so back/forward and sharing work.
- **Course cards:** today's `LessonCard` language: clay icon tile, title,
  one-line description, progress bar with `n / total`, round chevron button.
  Locked cards stay the white clay variant.
- **Collection card** at the bottom: "Pinki's Shelf · 7 / 24" opens S6.
- **Quick Review card** (Release 2) appears only when items are due (§6.3).

### S2 — Course page (reference: "Dinosaur World", board 2)
Today's number picker is already this layout: sticky hero, white card
overlapping it, rows, fixed Continue bar. Reuse it:
- Hero: a **still frame from the course's reel** (free art, see §8).
- Info card: subject pill, title, description, **three chips: `6 lessons` ·
  `30 min` · `6 reels`**.
- **Numbered lesson rows:** green check (done) / accent play (current) / padlock
  (locked), each with its minutes.
- Fixed **Continue lesson** bar, which resumes the current row.

### S3 — Lesson player
- **Segmented progress bar** at the top, one segment per step (board 2,
  screen 3), in the character accent.
- The step fills the middle. One fixed bottom action: `NextButton` / Check
  (`ui/morph-button.tsx`, the site's one forward button).
- Back button via `BackRow` as everywhere else.

### S4 — Question layouts (two, reused by most templates)
- **Rows:** question card with the character peeking from the side, and 2–4
  answer rows (A/B/C/D badge + picture + label). The existing Letters
  `question-panel` is already this.
- **Tiles:** 2×2 big picture tiles for picture-only answers (younger children,
  no reading needed).

### S5 — Lesson complete
Sticker reveal into the collection, one **Home Mission** line ("Find 3 circles
in your kitchen"), then *Next lesson* / *Watch the reel again*.

### S6 — Collection
One page per friend (§5): a shelf, a wardrobe, a journal. Locked slots show as
clay silhouettes, so the child can see what is still to earn.

> **Style guardrails:** the reference boards are soft-embossed purple
> neumorphism, which this project has **rejected**. Take their **structure**
> (banner → chips → cards → rows → quiz), not their surfaces. Surfaces stay
> `.card` / `.tile` / `.clay`, buttons stay `Button3D`, and the page ground stays
> the plain pale blue.

---

## 3. One lesson = one reel (5–7 minutes)

Every lesson in every course has the **same five beats**, so children learn
the rhythm once and the content team authors against one template:

| # | Beat | What happens | Time |
| --- | --- | --- | --- |
| 1 | **Watch** | The lesson's reel (~25 s song, 9:16). One **Reel Stop**: the video pauses at a timestamp and asks one question ("How many ducks?"), then plays on | ~40 s |
| 2 | **Meet** | 3–5 new items as flip cards: picture → English word. **Bridge button** shows the child's-language word. `SayItButton` slot for the word | ~60 s |
| 3 | **Play** | 5–7 exercises from the templates (§4), dealt by the seeded engine, mixing **~25% review** from earlier lessons | ~3 min |
| 4 | **Teach** | **"Is Pinki right?"** The character makes one typical mistake (says 3 + 4 = 8; calls a cow a horse; spells "cta"). The child judges it, then picks the fix | ~30 s |
| 5 | **Collect** | Sticker into the friend's collection + a Home Mission. Optional **Encore**: the reel plays again and the child now catches the words they learned | ~30 s |

Why this is realistic:
- **One reel per lesson** is what the company already produces.
- Beats 2 and 5 are the same component in every course; only the data
  changes.
- Beat 4 is the Choice template with a different frame. No new component.

---

## 4. Exercise templates

### 4.1 Rules for every template
- Takes **data only** (props from the course module). Never hard-coded content.
- Seeded dealing (existing `hash` + mulberry32 from `lib/letter-session.ts`).
  Never `Math.random()`.
- Has a **`say` slot** on every prompt and every option (§7).
- Wrong answer: never "wrong". The ladder is **hint → remove one option → the
  friend shows it**, then the same idea comes back later with different values.
- Touch-first, 44 px minimum targets, works at 390 px.

### 4.2 The ten templates

| # | Template | Used for | Existing code to start from |
| --- | --- | --- | --- |
| T1 | **Choice** (rows or tiles) | Most questions, Reel Stops, "Which is the triangle?" | `learn/letter/question-panel.tsx`, `letter-find.tsx` |
| T2 | **Judge** ("Is Pinki right?" ✓/✗ then fix) | The Teach beat everywhere | T1 with a frame |
| T3 | **Match** (pairs) | Mother ↔ baby, word ↔ picture, 3 + 4 ↔ 7 | `case-match.tsx`, Memory Match |
| T4 | **Build** (tiles into slots) | Spelling, sentences, `_ + 3 = 7` | `word-build.tsx` |
| T5 | **Sort** (drag into 2–3 baskets) | Land/sea, circle/not circle, odd/even | new |
| T6 | **Count & Fill** (put N things in) | "Give Pinki 6 cupcakes", ten-frame | Numbers' count stage |
| T7 | **Spot It** (tap every X in a scene) | "Tap all the triangles", "Tap every animal that swims" | new (scene image + hotspot list) |
| T8 | **Order** (drag into a sequence) | Life cycle, smallest → biggest, sentence order | new |
| T9 | **Pop** (tap the right ones as they float) | Quick Sums, word pop, energy change of pace | `letter-bubbles.tsx`, Numbers' balloons |
| T10 | **Dress / Place** (drag a sticker onto a character or into a room) | Nova's signature: "Put the hat on Nova", "The ball is under the bed" | new (§5.2) |

Also kept: **Trace** (the Pointer Events board) for "draw a triangle" on a
dotted outline in Pinki's Shapes course.

**New code is really four templates: T5, T7, T8, T10.** The rest are
refactors of components we already own and have tested on phones.

### 4.3 What happens to Numbers and Letters
- Remove both from Pinki's hub **when Release 1 ships**, not before (the hub
  must never go empty).
- Before deleting, lift into shared `components/learn/templates/`:
  question panel, bubbles, word build, case match, trace board, balloons,
  celebrate.
- The number journey's `discover` video stage becomes the **Watch** beat.
- Delete the rest (data modules, strokes, number-specific stages, routes' letter
  branch) in one clean-up once nothing imports them.

---

## 5. The three friends

**All three friends are open from day one.** Today's rule "Nova and Bloo unlock
after Pinki's full lesson set" made sense for a single sequential curriculum,
but maths, English and science are **parallel subjects**. A child who loves
animals shouldn't have to finish shapes first. Inside a friend, the **first
course per topic is open**, and lessons inside a course unlock one by one.
*(This changes a CLAUDE.md rule, so it needs your confirmation, §10.)*

### 5.1 Pinki — Maths with Pinki 🧁

**Signature: Pinki's Shop.** Maths is always *for something*: customers order,
Pinki packs boxes, the child fills orders. Counting with a reason.
**Collection: Pinki's Shelf.** Each course finished puts a clay trophy object
on her shelf (a cupcake, a triangle kite, a clock…).

| Course | Lessons | Teaches | Key templates |
| --- | --- | --- | --- |
| **Shapes Around Us** ⭐R1 | 6 | circle, square, triangle, rectangle, oval, star/heart; sides & corners; shapes in real things | Spot It, Sort, Trace, Choice |
| **Quick Add** ⭐R1 | 6 | adding within 10: count on, doubles, **make 10** | Count & Fill, Pop, Build `_+_`, Judge |
| Take Away | 6 | subtracting within 10 ("Bear ate 3") | Count & Fill, Choice, Judge |
| Solid Shapes | 5 | cube, sphere, cone, cylinder, pyramid ↔ real objects | Match, Sort, Choice |
| Patterns | 5 | ABAB → ABC → growing patterns; odd one out | Order, Choice |
| Add & Take to 20 | 6 | make-10 bridge, number line | Build, Pop |
| Tens & Ones | 5 | bundles of ten up to 100 | Count & Fill, Match |
| Clock & Measure | 6 | o'clock / half past; longer/shorter, heavier/lighter | Choice, Order |
| Story Sums | 5 | two-sentence word problems (reads like Nova) | Choice, Build |

**Quick Sums rule:** never timed by default (timed drills raise maths anxiety
in young children). A **"Beat Pinki"** race mode unlocks after a course is
done, and it's opt-in.

### 5.2 Nova — Words with Nova ✨

**Signature: Dress & Place (T10).** Nova is a white, blank figure. Words
**change her**: *hat* puts a hat on her, *red* paints it red, *under* puts the
ball under her bed. Children don't just see a word, they **do something to
Nova with it**. That is Endless Reader's "living words" idea made
hands-on, and it only works because Nova is white.
**Collection: Nova's Wardrobe.** Every item word learned becomes something
Nova can wear or own, and the child can dress her freely on the collection page
(a free-play toy that is also a word review).

| Course | Lessons | Teaches | Key templates |
| --- | --- | --- | --- |
| **Dress Up Nova** ⭐R1 | 6 | clothes + colours: hat, scarf, boots, dress, glasses, bag… "a red hat" | Dress, Choice, Match |
| **Action Words** ⭐R1 | 6 | run, jump, eat, sleep, swim, fly, read, sing; "Nova can jump" | Choice (reel stills), Judge, Build sentence |
| Nova's Room | 6 | home things + **in / on / under / next to** | Place, Choice, Spot It |
| Food & Lunchbox | 5 | food words; "I like / I don't like" | Dress (pack her lunchbox), Sort |
| Big & Small Words | 5 | opposites & describing words | Match, Judge |
| Little Words | 6 | sight words (Dolch pre-primer: the, a, I, is, can, see, my, go…) | Pop, Build |
| Sound It Out | 6 | CVC blending, word families (-at, -ig, -op) **(needs audio to be good, so ship it after audio)** | Build, Choice |
| Spelling Bee | 6 | picture → spell, with 3 support levels (full tiles → missing letter → free) | Build |
| Story Time | 6 | 4–6 page stories of the three friends, word highlight slot, 2 comprehension Qs | Choice, Order |

### 5.3 Bloo — World with Bloo 🧭

**Signature: Who Am I? & Zoom.** Clues appear one by one ("I am big. I am
grey. I have a long nose.") or a close-up photo zooms out. Guessing early earns
more, so the child reads and thinks instead of tapping.
**Collection: Bloo's Field Journal.** Every animal or thing discovered is a
flip card: front = clay picture + English name; back = 3 facts and one
**Big Fact** ("An octopus has three hearts!").

| Course | Lessons | Teaches | Key templates |
| --- | --- | --- | --- |
| **Farm Friends** ⭐R1 | 6 | farm animals, babies (calf, lamb, chick), what they give us | Match, Who Am I, Choice |
| **Under the Sea** ⭐R1 | 6 | fish, whale, shark, octopus, turtle, crab, starfish, dolphin | Zoom, Sort (sea / not sea), Spot It |
| Wild Animals | 6 | jungle & savanna | Who Am I, Choice |
| Desert & Mountains | 5 | **our region's animals**: camel, falcon, fox, mountain goat, bear, eagle | Who Am I, Match |
| Bugs & Birds | 5 | + butterfly life cycle | Order, Sort |
| My Body | 5 | parts, five senses, healthy habits | Place (label the body), Choice |
| Weather & Seasons | 5 | sunny, rainy, windy, snowy; "What should Bloo wear?" | Dress (on Bloo), Choice |
| Plants & Food | 5 | seed → plant, fruit & vegetables | Order, Sort |
| Colours of the World | 4 | colours & mixing | Choice, Build |
| Day, Night & Space | 5 | sun, moon, stars, planets | Choice, Order |

### 5.4 Where the friends meet
Crossovers are what make three subjects feel like one world. They cost nothing
extra, since they are just course data using another friend's items:
- **Pinki counts Bloo's animals** ("How many ducks?", in Farm Friends).
- **Bloo's Who Am I** is reading practice for Nova's words.
- **Pinki's Story Sums** read like Nova's sentences.
- **Call a friend:** the hint buttons (§1.4) bring the other two in.

---

## 6. The smart parts (lean, all client-side)

### 6.1 Progress
Per-lesson done/current/locked, like today (zustand + persist, `hydrated`
guard, keys in `lib/progress-keys.ts`). Add **per-item correctness** (right
first try, yes/no, last seen date). That one extra record powers everything
below.

### 6.2 Adaptive inside a lesson
The engine already deals sessions. Add one rule: **two misses on the same item
→ swap in an easier variant** (fewer options, smaller numbers, picture support
on). That is enough adaptivity for Release 1. No placement test needed while
all courses start open.

### 6.3 Quick Review (Release 2)
A 3-minute mixed round per friend, fed by simple Leitner boxes (missed → back
tomorrow; right → 3, 7, 14 days). Shows as a hub card **only when something
is due**, so it never nags.

### 6.4 Call a friend (hints)
Each item's data carries up to three hint forms, and each is optional:
`count` (Pinki: show it with objects), `words` (Nova: a clue sentence),
`picture` (Bloo: highlight/zoom the image). The UI shows a friend's face for
every hint that exists.

### 6.5 Honest limits
No accounts, so progress lives on one device. No parent report until sign-in
exists. Collections are **local lesson progress**, not a profile score, which
keeps the rule "no profile/points/stars before sign-in".

---

## 7. Audio-ready now, recorded last

We build as if audio exists and ship silent. Then we **generate the recording
script from the code**, so the voice team records exactly what's used,
nothing more:

1. **Every spoken line is a data field**, never a string buried in JSX:
   `prompt.say`, `option.say`, `hint.say`, `word.say`.
2. `SayItButton` / Letters' `CueButton` renders wherever a `say` exists:
   visible but inert (the current `TODO(audio)` slot). Adding clips later means
   **no layout change** (existing rule).
3. A small script walks the course modules and writes an **audio manifest**:
   one row per unique line → file id, text, language, who speaks it
   (Pinki/Nova/Bloo/narrator).
   - Taught English words and sentences: **English only**, one clip each, reused
     everywhere.
   - Instructions, hints and praise: **three languages** (en/ar/ku).
4. Hand the manifest (a CSV) to the voice team. Clips come back named by id,
   get dropped into `public/audio/`, then howler.js plays them.

**Reels already have sound.** Watch, Reel Stops and Encore are fully audible
from day one. Only the exercise lines wait for recordings.

---

## 8. Assets: what we need and where it comes from

### 8.1 Sources, cheapest first
1. **Already have:** the three friend PNGs, the clay icon set
   (`public/assets/icons/`), puzzle art (scenes of the three friends), Pinki
   pose art, 9 number reels.
2. **From the reels (free, on-brand):** still frames with
   `ffmpeg -ss <t> -i reel.mp4 -frames:v 1 out.png`. Used for course heroes,
   reel posters, Reel Stop images and "What did Bloo hold?" recall questions.
   They already show our characters in our style.
3. **AI-generated clay objects:** every vocabulary picture, shape, animal and
   sticker. One style prompt (§8.3) keeps them matching the existing icon set
   (glossy vinyl-toy clay, pastel, the giraffe in `icons/` is the reference).
4. **AI-generated scenes:** backgrounds for Spot It, Nova's room, the sea, the
   farm. Only a few, reused across many lessons.
5. **CSS, not images:** colour variants (§8.4), progress bars, chips, confetti,
   collection slots.

### 8.2 Release 1 shopping list (6 courses, 36 lessons)

| Asset | Count | Source | Notes |
| --- | --- | --- | --- |
| Reels (1 per lesson) | **36** | company pipeline | 9:16, ~25 s, one topic each; plus a tagging sheet (§9) |
| Reel stills | ~50 | ffmpeg | posters + course heroes + Reel Stop images |
| Course icon tiles | 6 | AI clay | the tile on each course card (board style: 123, shapes, flask) |
| **Pinki** shape tokens (2D) | 8 | AI clay | circle, square, triangle, rectangle, oval, star, heart, diamond |
| **Pinki** real-world shape objects | ~20 | AI clay | pizza, clock, window, door, kite, sign, egg, book… |
| **Pinki** shop manipulatives | ~8 | AI clay | cupcake, cookie, donut, box (10 slots), tray, apple, orange, sweet |
| **Nova** base poses (front, neutral, arms slightly out) | 2 | **must match Nova exactly**: AI from `nova.png` as reference, or a frame from a reel | the "mannequin" for Dress |
| **Nova** wearables | ~14 | AI clay, **in white/light grey** | hat, cap, scarf, boots, shoes, dress, T-shirt, glasses, bag, crown, bow, gloves, coat, umbrella |
| **Nova** action pictures | 8 | reel stills first, AI if missing | Nova running, jumping, eating… |
| **Bloo** farm animals + babies | ~14 | AI clay | cow/calf, sheep/lamb, hen/chick, horse/foal, goat/kid, duck/duckling, dog, cat |
| **Bloo** sea animals | ~10 | AI clay | fish, whale, shark, octopus, turtle, crab, starfish, dolphin, jellyfish, seahorse |
| Field Journal "Big Fact" art | reuse | same animal PNGs | the back of the card is text + the same image, smaller |
| Spot It scenes | 4 | AI clay scene | a kitchen (shapes), a street (shapes), a farm, a reef, each with a hotspot list |
| Stickers / trophy objects | 6 | AI clay | one per course for the collections |
| Collection backgrounds | 3 | CSS + 1 AI texture each | a shelf, a wardrobe rail, a journal page |
| **Total new images** | **~115** | | about 3–4 days of generation + clean-up for one person |

### 8.3 The AI prompt kit (use the same wording every time)

**Objects / animals:**
```
A single {OBJECT} as a cute 3D clay toy, glossy soft vinyl finish, rounded
chunky shapes, pastel colours, soft studio lighting, front three-quarter view,
centred, isolated on a plain pure white background, no text, no ground shadow,
children's app icon style.
```
Add for animals: `big friendly eyes with purple irises, gentle smile`, which
matches `icons/giraffe.png` and the friends' eyes.

**Nova wearables (tintable):**
```
A single {ITEM} as a 3D clay toy accessory, matte white clay, soft grey
shading, rounded chunky shapes, front view, centred, isolated on plain white
background, no text, no shadow.
```

**Scenes (Spot It):**
```
A cosy {PLACE} scene for children, 3D clay diorama style, pastel colours,
soft lighting, clearly separated objects, clean uncluttered layout, wide
16:10, no people, no text.
```

**Consistency rules:** generate in one tool with one fixed style reference image
(`icons/giraffe.png`); same aspect (1024×1024 for objects); reject anything with
text, logos or extra limbs; generate 4 and pick 1.

### 8.4 Clean-up pipeline (our existing rules apply)
1. Remove the background, then **un-matte** (the white-halo rule in
   `viewport-and-images.md`).
2. Trim to content, export PNG (no AVIF), keep the source 1024 px.
3. Put it under `public/assets/learn/{friend}/{course}/…` and **import it
   statically** (`import cow from "…/cow.png"`) for cache busting. Never a
   `/public` path string.
4. Declare the **painted size** on `next/image`; `fill` images get `sizes`.

**One tintable asset, many colours.** Nova's white wearables are coloured in
CSS: the item PNG as a `mask-image`, with a colour layer blended over it by
`multiply`. So "red hat", "blue hat" and "green hat" are **one file**. Any drop
shadow goes on the parent (the `filter`-before-`mask` rule).

---

## 9. How a lesson is authored (so content scales without developers)

The content team fills **one row per reel** in a shared sheet:

| reel file | friend | course | lesson | words taught | stop time | stop question | stop answer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bloo-farm-03.mp4` | bloo | farm-friends | 3 | cow, calf, milk | 00:14 | How many cows? | 3 |

A developer (or a script) turns the sheet into the course module. A lesson
entry stays small:

```ts
// data/courses/bloo/farm-friends.ts
{
  id: "babies",
  reel: { src: farm03, poster: farm03Still, stop: { at: 14, ask: "howManyCows", answer: "3" } },
  meet: ["cow", "calf", "hen", "chick"],          // item ids from the shared item bank
  play: ["match:mother-baby", "choice:who-am-i", "sort:gives-milk"],
  teach: { friend: "bloo", claim: "calf-is-baby-horse", fix: "calf-is-baby-cow" },
  collect: { sticker: "milk-bottle", mission: "farmBreakfast" },
}
```

- **Items live once** in an item bank (`cow`: image, English word, `say`,
  translations, hints, Big Fact). Lessons reference ids, so a picture is added
  once and used by every friend.
- Sentences shown to the child (`howManyCows`, `farmBreakfast`) are dictionary
  keys, in all three languages, as pure data (the existing rule).

**Realistic effort once the templates exist:** about 1–2 hours per lesson
(tagging + data + images already in the bank), so a 6-lesson course is ~2 days.

---

## 10. Changes to current project rules (need your OK)

1. **Across-character unlock:** "only Pinki starts unlocked" → **all three
   open** (§5).
2. **Numbers & Letters retired** from Learn when Release 1 ships (§4.3).
3. **`LessonId` union** (`numbers | letters | colors | shapes`) becomes the
   course list per friend.
4. **Character taglines:** Nova's "Turns letters into stories" → something like
   "Turns words into things you can wear, play with and read". Pinki's and
   Bloo's taglines already fit.

---

## 11. Release plan

### Release 0 — foundations (≈2 weeks)
- Shared course/lesson/item types + item bank + seeded engine (generalised
  from `letter-session.ts`).
- Lesson player shell: segmented bar, the five beats, `NextButton`, `say` slots.
- Templates T1–T4 lifted from existing code.
- The tagging sheet agreed with the content team; first 12 reels tagged.

### Release 1 — six courses, 36 lessons (≈5–6 weeks)
- New templates **T5 Sort, T7 Spot It, T8 Order, T10 Dress/Place**, plus
  **Reel Stop**.
- Pinki: *Shapes Around Us*, *Quick Add*. Nova: *Dress Up Nova*, *Action
  Words*. Bloo: *Farm Friends*, *Under the Sea*.
- S1–S6 screens; three collections; Call a friend; Bridge button.
- ~115 images (§8.2).
- **Playtest with 5–8 children (ages 5–9) before calling it done**; fix what
  confuses them.
- Then Numbers & Letters are removed.

### Release 2 — depth (≈6–8 weeks)
- 2–3 more courses per friend; Quick Review; "Beat Pinki" mode; Encore beat.
- Playtest every 2–3 weeks.

### Release 3 — voice (when content settles)
- Generate the audio manifest, record, drop in. Then ship the audio-dependent
  courses: *Sound It Out*, *Story Time* read-along.

---

## 12. Risks and how we handle them

| Risk | Handling |
| --- | --- |
| Reels don't match lesson needs exactly | The sheet (§9) is agreed **before** production; each reel gets a one-line brief ("teach cow/calf/milk, sing each word twice, show 3 cows at ~0:14") |
| AI images drift in style | One style reference, fixed prompt, pick-1-of-4, a short style checklist at review |
| English-only exercises feel hard before audio | Release 1 courses are all **picture-first** (shapes, sums, clothes, animals), so they work silently. Reading-heavy courses wait for audio |
| Teach beat confuses 5-year-olds | Keep the character's mistake obvious and visual. The protégé and error-correction studies are with older children (grades 5–8), so **playtesting decides** whether it stays in every lesson or only from age 7 |
| Scope creep | Release 1 is six courses. New course ideas go into this file's tables, not into the sprint |

---

## 13. New sources (in addition to `improve.md` §15)

- Chase, Chin, Oppezzo & Schwartz (2009), *Teachable Agents and the Protégé
  Effect*: [Stanford PDF](https://stacks.stanford.edu/file/druid:zm369yx3532/Teachable-Agents-Chase_Chin_Oppezzo_Schwartz.pdf) ·
  [ERIC](https://eric.ed.gov/?id=EJ855299) · [AAA Lab](http://aaalab.stanford.edu/research/social-foundations-of-learning/teachable-agents/)
- Learning from erroneous examples: [Learning Scientists — Learning math from errors](https://www.learningscientists.org/blog/2023/7/27) ·
  [ScienceDirect — erroneous examples in a web tutor](https://www.sciencedirect.com/science/article/abs/pii/S0747563214001757) ·
  [Narciss 2025, BJEP](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjep.12716)
- Songs and vocabulary in young EFL learners:
  [Songs and vocabulary retention in preschool ELLs](https://www.researchgate.net/publication/305819119_The_effect_of_songs_on_vocabulary_retention_of_preschool_young_English_language_learners) ·
  [Kumar 2022, Education Research International](https://onlinelibrary.wiley.com/doi/10.1155/2022/3384067) ·
  [TESL-EJ — practice modes with songs](https://tesl-ej.org/wordpress/issues/volume28/ej111/ej111a9/) ·
  [ERIC — educational songs in EFL](https://files.eric.ed.gov/fulltext/EJ1310659.pdf)
