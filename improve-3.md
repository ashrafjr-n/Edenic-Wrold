# Edenic World — the new Learn, simply

> The simple version. Small, strong, and buildable properly.
> Where this file disagrees with `improve.md` or `improve-2.md`, **this one wins**.
> Date: 2026-09-27

---

## 1. The idea in one paragraph

Learn is for children aged **5–9**. Numbers 1–9 and the alphabet are gone, because
children this age already know them. Each friend teaches one subject:
**Pinki = maths & shapes**, **Nova = English words**, **Bloo = animals & the world**.
Every lesson is the same three steps: **watch a reel → answer 5 questions → done**.
That's it.

---

## 2. How it's organised

```
Friend  →  Course  →  Lesson  →  5 questions
Pinki      Shapes      Lesson 1: Circle & Square
```

- A **friend** has a few **courses** (shown as cards, like today).
- A **course** has **5 lessons** (shown as numbered rows, like today's number list).
- A **lesson** takes about **3 minutes**.
- Lessons open **one after another**. Finishing a lesson opens the next one.
- **All three friends are open from the start.** They are different subjects, so
  a child shouldn't have to finish maths before animals.

The pages and URLs stay the same as today:

| Page | Shows |
| --- | --- |
| `/learn` | the three friends (unchanged) |
| `/learn/pinki` | Pinki's course cards |
| `/learn/pinki/shapes` | the 5 lesson rows + Continue button |
| `/learn/pinki/shapes/1` | the lesson itself |

---

## 3. One lesson, three steps

### Step 1 — Watch 🎬
The lesson's **reel** plays (a ~25 s song by the company, vertical video).
A **Next** button appears when it ends. The child can also skip it; skipping is
never punished.

### Step 2 — Play 🎮
**5 questions**, one at a time. A small progress bar on top shows 1 of 5, 2 of 5…
- **Right answer:** a happy bounce, Pinki cheers, and the button changes to **Next**.
- **Wrong answer:** no "wrong" message. The tile shakes softly, and the child
  tries again.
- **Wrong twice:** the right answer glows so the child sees it, taps it, and moves on.
  Nobody gets stuck.

### Step 3 — Done ⭐
"Well done!", one star on the lesson row, and two buttons:
**Next lesson** / **Watch again**.

---

## 4. Only three question types

Everything in every course is built from these three. Two already exist in the
code, so we lift them out of Numbers and Letters.

| Type | What the child does | Example | Already exists? |
| --- | --- | --- | --- |
| **Pick** | tap the right one of 3–4 big tiles | "Which is the triangle?" · "3 + 2 = ?" | ✅ Letters' question panel |
| **Count** | tap objects to add them until there are enough | "Put 4 cupcakes in the box" | ✅ Numbers' count stage |
| **Trace** | draw over a dotted outline with a finger | "Draw a triangle" | ✅ the tracing board |

**The one rule for every question:** a 5-year-old might not read yet, so each
question is **one short line + big pictures**, and the first question of every
lesson shows Pinki doing it once as an example.

---

## 5. Pinki in detail

### Pinki's courses

| # | Course | Lessons | Opens |
| --- | --- | --- | --- |
| 1 | **Shapes** | 5 | at the start |
| 2 | **Adding** (up to 10) | 5 | at the start |
| 3 | Taking Away (up to 10) | 5 | later release |
| 4 | Patterns | 5 | later release |

The first release is **courses 1 and 2 only: 10 lessons, 10 reels.**

### Course 1 — Shapes

| Lesson | Teaches | The reel is about | The 5 questions |
| --- | --- | --- | --- |
| 1 | circle, square | a song about round and square things | Pick ×3 ("Which is the circle?"), Trace a circle, Trace a square |
| 2 | triangle | 3 sides, 3 corners | Pick ×3, Trace a triangle, Pick "Which one has 3 corners?" |
| 3 | rectangle | long square-ish things: door, phone, book | Pick ×4 (mixing all shapes so far), Trace a rectangle |
| 4 | shapes around us | pizza, window, slice of cake, door | Pick ×5: "Which shape is this pizza?" |
| 5 | shape review | all four shapes | Pick ×4 + Count "Tap all 3 triangles" |

### Course 2 — Adding

| Lesson | Teaches | The reel is about | The 5 questions |
| --- | --- | --- | --- |
| 1 | adding is putting together | 2 apples + 1 apple | Count ×2 ("Put 3 apples in the basket"), Pick ×3 with pictures (2 🍎 + 1 🍎 = ?) |
| 2 | adding up to 5 | fingers song | Pick ×5: pictures + numbers (3 + 2 = ?) |
| 3 | adding up to 10 | cupcakes in a box | Count ×2 ("Make 7 cupcakes"), Pick ×3 |
| 4 | doubles | 2 + 2, 3 + 3, 5 + 5 | Pick ×5, numbers only, pictures as a hint |
| 5 | quick sums | a fast, fun song | Pick ×5, numbers only (4 + 3 = ?) |

The rhythm: **pictures first, then pictures + numbers, then numbers only.**

### What a child sees in Pinki's first lesson (Shapes · Lesson 1)

1. Taps the **Shapes** card, then the **1. Circle & Square** row, then **Start**.
2. The reel plays: Pinki sings about round and square things. Then **Next**.
3. Q1: "Which is the **circle**?" Pinki taps the circle once to show how.
   Then it's the child's turn with new tiles.
4. Q2–Q3: more Pick questions, with the answers in a new order each time.
5. Q4: a dotted circle; the child traces it with a finger.
6. Q5: a dotted square; trace it.
7. "Well done!" ⭐. Row 1 gets a star, and row 2 opens.

---

## 6. Nova and Bloo, in general

They use the **same three question types and the same lesson steps**. Only the
pictures and words change.

**Nova — English words.** Picture ↔ word questions using Pick: things around us
(clothes, food, home, toys), then action words (run, jump, eat), then short
sentences. Example: a picture of a hat → "Which word is this?" → `hat · cat · bat`.

**Bloo — animals & the world.** Pick questions about animals: names, where they
live, their babies, what they eat. Later: weather and my body. Example:
"Who lives in the sea?" → four animal tiles.

Details for these two come later. Pinki is built first and becomes the pattern.

---

## 7. What we need

### From the company
- **10 reels** for Pinki's first release, one per lesson (the tables in §5 say
  what each one is about).
- ffmpeg can take a picture out of a reel to use as the course cover (free).

### Pictures (AI-generated, clay style)
Same style as the existing icons (see `public/assets/icons/giraffe.png`).

| For | What | How many |
| --- | --- | --- |
| Shapes | circle, square, triangle, rectangle as clay shapes | 4 |
| Shapes | real things: pizza, clock, window, door, book, slice of cake, kite, plate, phone, ball | 10 |
| Adding | apple, cupcake, basket, box, star, ball | 6 |
| Course cards | one icon per course | 2 |
| **Total** | | **~22 pictures** |

The prompt to use every time:

```
A single {THING} as a cute 3D clay toy, glossy soft vinyl finish, rounded shapes,
pastel colours, soft light, centred, plain white background, no text, no shadow.
```

After generating: remove the background, fix the white edge (the "un-matte" rule
in `viewport-and-images.md`), and import the file in code (never a `/public`
path string).

### Sound
**None yet.** Every line a child should hear gets a `say` field in the data and a
speaker button that does nothing for now. When all content is finished, we list
every `say` line and record them all at once.

---

## 8. How it's built (for the developer)

**The content is data. The screens never change per lesson.**

```ts
// data/courses/pinki-shapes.ts
{
  id: 1,
  reel: shapesReel1,                 // imported mp4
  questions: [
    { type: "pick",  ask: "whichCircle", answer: "circle", options: ["circle", "square", "triangle"] },
    { type: "pick",  ask: "whichSquare", answer: "square", options: ["circle", "square", "star"] },
    { type: "pick",  ask: "whichCircle", answer: "circle", options: ["square", "circle", "heart"] },
    { type: "trace", shape: "circle" },
    { type: "trace", shape: "square" },
  ],
}
```

- `ask` is a dictionary key, so the line shows in English, Arabic or Kurdish.
- Option order is shuffled with the existing seeded shuffle. Never `Math.random()`.
- Progress uses the same store as today: lesson done, star earned.

**Build order:**
1. Lift **Pick**, **Count** and **Trace** out of Numbers/Letters into shared components.
2. Build the **lesson player**: reel → 5 questions → done.
3. Write the data for **Shapes** (5 lessons) and test it with a child.
4. Write the data for **Adding** (5 lessons).
5. Swap Pinki's hub from Numbers/Letters/Colors to **Shapes/Adding**, then delete
   the old Numbers and Letters code.

Adding a new course later = new pictures + new reels + one data file. No new code.

---

## 9. Not now (on purpose)

These were in the earlier plans. They're good ideas, but they wait until the
simple version works and children like it:

- collections (shelf, wardrobe, journal)
- "Is Pinki right?" teaching step
- call-a-friend hints, translate button
- pausing the reel with a question
- review rounds, adaptive difficulty
- more question types (sort, spot-it, dress-up)

**Rule:** add one of these only when testing with real children shows it's needed.
