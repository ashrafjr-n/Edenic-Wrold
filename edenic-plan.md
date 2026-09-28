# Edenic World — the Learn plan

> The one plan for the new Learn. Pinki first; Nova and Bloo follow the same pattern.
> Last updated: 2026-09-28

---

## 1. The idea

Learn is for children aged **5–9**. Numbers 1–9 and the alphabet are gone, because
children this age already know them.

- **Pinki** teaches maths & shapes
- **Nova** teaches English words
- **Bloo** teaches animals & the world

Every lesson is the same: **watch a reel → a few steps → done ⭐**. A Shapes
lesson teaches ONE shape: reel → word → trace → spell (§3).
All three friends are open from the start.

## 2. How it's organised

```
Friend → Course → Lesson (≈3 min) → 5 questions
Pinki    Shapes   1. Circle
```

| Page | Shows |
| --- | --- |
| `/learn` | the three friends (unchanged) |
| `/learn/pinki` | Pinki's course cards (today's card style) |
| `/learn/pinki/shapes` | 5 lesson rows + Continue (today's Numbers page layout) |
| `/learn/pinki/shapes/1` | the lesson |

Lessons open one after another.

## 3. A lesson

**The Shapes lesson (approved flow, 2026-09-28 — later courses follow it):**

**On every step:** a **task chip** at the top — a clay pill with an icon, one
verb in the child's language ("Draw") and the English word it is about;
tapping it says the instruction. No Pinki picture, speech bubble or separate
speaker up there, and no step list: Pinki **peeks in from the screen edge** to
cheer a right answer or think along after a miss, then slides away.

1. **Watch 🎬**: the reel fills the whole screen on a phone (header above,
   bottom bar below; a tall 9:16 frame on tablet/desktop). A round **Skip**
   button sits in the bottom-right corner: it spins, then moves on. When the
   reel ends the lesson moves on by itself. If the browser refuses to start
   it, a big **Play** button sits in the middle.
2. **Word 🔊**: one big speaker button (the word's sound, when audio lands),
   the shape itself, and the English word under it, every letter its own clay
   colour. **Next**.
3. **Trace ✏️**: Pinki draws it, then the child — in **one stroke**, from a
   clay start disc whose arrow shows the way, with chevrons round the dots.
   Lifting the finger ends the attempt: it passes only if the stroke went
   round the whole shape (90%, easing to 80% after misses) AND stayed on the
   line (85%); otherwise it flashes red and clears. A pass fills the shape
   with colour, then it turns into a real thing (circle → ball, square →
   toast, triangle → cheese, rectangle → book).
4. **Spell 🔤**: the word on top, empty spaces under it, and its letters as
   shuffled clay tiles under those. **Tap** a tile → it flies to the first
   empty space; **drag** a tile → any space (a taken space swaps). Tap a placed
   tile to send it back. Nothing is judged until every space is full: right →
   celebrate + **Next**; wrong → the misplaced tiles wiggle and fly back
   (the right ones stay) and the child tries again, as often as they like.
   From the **second** miss **Help** also appears where Next goes (optional);
   Help puts the word together in order, then Next.
5. **Find 🔍** (when a scene has enough of the shape — the circle lesson for
   now): a 3D picnic scene; tap every thing that is the shape. Each find gets
   a ring and flies into a tray of sockets; wrong taps wiggle; after two
   misses the next one glows. All found → they all jump → **Next**.
6. **Done ⭐**: Pinki cheering with confetti; the shape beside the child's own
   drawing and the word; a green pill whose padlock springs open on the next
   lesson. *Play again* / *Next lesson*.

**Other lessons (Adding, the review):**

1. **Watch 🎬**: as above.
2. **Play 🎮**: questions with a progress bar on top.
   - Right: bounce + Next.
   - Wrong: soft shake, try again. Never the word "wrong".
   - Wrong twice: the right answer glows. Nobody gets stuck.
3. **Done ⭐**: a star on the lesson row, then *Next lesson* / *Watch again*.

## 4. Three question types only

| Type | The child | Example |
| --- | --- | --- |
| **Pick** | taps 1 of 3–4 big tiles | "Which is the triangle?" · "3 + 2 = ?" |
| **Count** | taps objects in until there are enough | "Put 4 cupcakes in the box" |
| **Trace** | draws over a dotted outline | "Draw a circle" |

**Rule:** each question is one short line + big pictures. In the first question
of each lesson, Pinki shows how once. A child who can't read yet must still
understand every question.

## 5. Pinki's content (release 1: 2 courses, 10 lessons)

### Shapes — one shape per lesson
| # | Lesson | Steps |
| --- | --- | --- |
| 1 | Circle | Reel, Word, Trace, Spell `circle`, Find the circles (picnic) |
| 2 | Square | Reel, Word, Trace, Spell `square` |
| 3 | Triangle | Reel, Word, Trace, Spell `triangle` |
| 4 | Rectangle | Reel, Word, Trace, Spell `rectangle` |
| 5 | Shape review | Pick ×4 (all four shapes) |

### Adding (up to 10)
| # | Lesson | Questions |
| --- | --- | --- |
| 1 | Putting together | Count ×2, Pick ×3 (pictures) |
| 2 | Up to 5 | Pick ×5 (pictures + numbers) |
| 3 | Up to 10 | Count ×2, Pick ×3 |
| 4 | Doubles | Pick ×5 (numbers, pictures as hint) |
| 5 | Quick sums | Pick ×5 (numbers only) |

Later courses: Taking Away, Patterns.

## 6. Nova and Bloo (general)
Same lesson steps, same three question types. Only the pictures change.
- **Nova:** picture ↔ English word (clothes, food, home, toys), then action words,
  then short sentences.
- **Bloo:** animals: names, homes, babies, food. Later: weather, my body.

## 7. Sound
None yet. Every line a child should hear gets a `say` field and a silent speaker
button. When all content is done, we list every `say` line and record them in one go.

## 8. Not now (on purpose)
Collections, "Is Pinki right?", hint friends, translate button, questions inside
the reel, review rounds, more question types. Add one only if testing with
children shows it's needed.

---

## 9. Build plan: Pinki

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
- [ ] A Find scene for squares, triangles and rectangles (lessons 2–4) —
      same pipeline, `tools/picnic-scene`.
- [ ] The 4 real reels replace the placeholders (same file names).
- [ ] Shape pictures in place (§10), if still wanted.
- [ ] Play it through on a phone; test with one child aged 5–6 and one aged 8–9.

### Phase 5 — Adding course
- [ ] 5 reels + ~6 pictures.
- [ ] 5 lessons of data.
- [ ] Same test round.

### Phase 6 — Finish
- [ ] Fix what the tests showed.
- [ ] Final docs pass. Pinki becomes the pattern Nova and Bloo copy.

---

## 10. Assets for Pinki

**Pictures** (AI clay, same style as `public/assets/icons/giraffe.png`):

```
A single {THING} as a cute 3D clay toy, glossy soft vinyl finish, rounded shapes,
pastel colours, soft light, centred, plain white background, no text, no shadow.
```

| Folder | Files |
| --- | --- |
| `public/assets/learn/pinki/shapes/` | `circle.png` `square.png` `triangle.png` `rectangle.png` · `pizza.png` `clock.png` `window.png` `door.png` `book.png` `cake-slice.png` `kite.png` `plate.png` `phone.png` `ball.png` |
| `public/assets/learn/pinki/adding/` | `apple.png` `cupcake.png` `basket.png` `box.png` `star.png` `ball.png` |
| `public/assets/learn/pinki/` | `course-shapes.png` `course-adding.png` (card icons) |

**Find scene** (in place): `public/assets/learn/pinki/shapes/find/` —
`picnic.jpg` (the empty scene) and one PNG per thing (plate, donut, cookie,
ball, toast, cheese, book, kite), rendered by `tools/picnic-scene` (three.js,
pastel clay materials, one camera and light). Low-poly downloaded models
(Kenney CC0) were tried and rejected: their "circles" are hexagons.

**Reels** (from the company, vertical mp4, ~25 s):

| Folder | Files |
| --- | --- |
| `public/assets/learn/pinki/shapes/reels/` | `1.mp4` … `4.mp4` (circle, square, triangle, rectangle; placeholders in place now) |
| `public/assets/learn/pinki/adding/reels/` | `1.mp4` … `5.mp4` |

PNG with or without background is fine: background removal and un-matting are
done on our side. Pictures are imported in code; reels are played by path.
