# Edenic World — the Learn plan

> The one plan for the new Learn. Pinki first; Nova and Bloo follow the same pattern.
> Last updated: 2026-09-27

---

## 1. The idea

Learn is for children aged **5–9**. Numbers 1–9 and the alphabet are gone, because
children this age already know them.

- **Pinki** teaches maths & shapes
- **Nova** teaches English words
- **Bloo** teaches animals & the world

Every lesson is the same: **watch a reel → answer 5 questions → done ⭐**.
All three friends are open from the start.

## 2. How it's organised

```
Friend → Course → Lesson (≈3 min) → 5 questions
Pinki    Shapes   1. Circle & Square
```

| Page | Shows |
| --- | --- |
| `/learn` | the three friends (unchanged) |
| `/learn/pinki` | Pinki's course cards (today's card style) |
| `/learn/pinki/shapes` | 5 lesson rows + Continue (today's Numbers page layout) |
| `/learn/pinki/shapes/1` | the lesson |

Lessons open one after another.

## 3. A lesson

1. **Watch 🎬**: the reel plays (~25 s, vertical). The child can skip it.
2. **Play 🎮**: 5 questions with a progress bar on top.
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

### Shapes
| # | Lesson | Questions |
| --- | --- | --- |
| 1 | Circle & Square | Pick ×3, Trace circle, Trace square |
| 2 | Triangle | Pick ×3, Trace triangle, Pick "3 corners?" |
| 3 | Rectangle | Pick ×4 (all shapes so far), Trace rectangle |
| 4 | Shapes around us | Pick ×5 ("Which shape is this pizza?") |
| 5 | Shape review | Pick ×4, Count "Tap all 3 triangles" |

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
- [ ] Delete Letters completely: components, data, lib, types, assets, dictionary
      namespaces, CSS, routes' letter branches.
- [ ] Delete Numbers' **content**, but keep its **layout**: the course page
      (sticky hero + white sheet + rows + Continue, phone and desktop trees)
      becomes a generic **course page**, and `NumberList` becomes **`LessonList`**.
- [ ] Keep the pieces the new lessons reuse and move them to
      `components/learn/lesson/`: trace board + scoring, the video player, the
      question panel, the count-into-a-container interaction, the speaker slot,
      the progress bar, Pinki's speech bubble.
- [ ] Pinki's hub shows two course cards: **Shapes** (open) and **Adding** (open).

### Phase 2 — Data model
- [ ] Types: `Course`, `LessonDef`, `Question` (`pick | count | trace`), each with
      `say` fields.
- [ ] `data/courses/pinki-shapes.ts` and `pinki-adding.ts` (titles + reels first,
      questions filled in Phase 4–5).
- [ ] Seeded shuffle moved to `lib/seeded.ts` (no `Math.random()`).
- [ ] Progress: reuse the store; key `pinki.shapes.1`, star on finish.

### Phase 3 — Lesson player
- [ ] One client component: **Watch → Play (5) → Done**.
- [ ] **Pick**, **Count**, **Trace** as three components fed only by data.
- [ ] Wrong/right/wrong-twice behaviour (§3), Pinki's "show once" on question 1.
- [ ] Dictionary strings in en / ar / ku.
- [ ] Measured at 390 / 820 / 1440; back button in its one spot.

### Phase 4 — Shapes course
- [ ] 5 reels + ~14 pictures in place (§10).
- [ ] 5 lessons of data.
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

**Reels** (from the company, vertical mp4, ~25 s):

| Folder | Files |
| --- | --- |
| `public/assets/learn/pinki/shapes/reels/` | `1.mp4` … `5.mp4` |
| `public/assets/learn/pinki/adding/reels/` | `1.mp4` … `5.mp4` |

PNG with or without background is fine: background removal and un-matting are
done on our side. Pictures are imported in code; reels are played by path.
