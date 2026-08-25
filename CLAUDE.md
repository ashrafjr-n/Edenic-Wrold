@AGENTS.md

# Edenic World

Educational website for children under 10. All UI/content is **English only**. Built with Next.js (App Router, TypeScript, Tailwind — scaffolded via create-next-app, not yet customized).

## Core concept

Home page shows 3 brand mascots: **Nova**, **Pinki**, **Bloo**, each with a "Learn With {Name}" CTA leading to that character's lesson hub.

Each character has a set of lessons/categories (e.g. for Pinki: Learn Letters, Learn Numbers, Learn Shapes, Learn Months...). Each lesson (e.g. "Learn Numbers") contains a sequence of items (e.g. 1, 2, 3...). Each item's page flow:

1. Short pre-made "reels" style video specific to that item (e.g. a video about the number 1)
2. Static image/shape of the item (e.g. the numeral "1")
3. Tracing exercise: the shape shown as a dotted outline, child traces it with mouse or touch (tablet/phone)
4. A few simple questions (young audience — likely multiple choice)
5. Celebration (stars/confetti) on completion, then advance to next item

## Progressive unlock system (two levels)

- **Across characters**: only Pinki starts unlocked. Nova and Bloo are locked until the previous character's full lesson set is completed.
- **Within a character**: lessons unlock one at a time. E.g. Pinki starts with only "Numbers" open; the next lesson (e.g. Letters) unlocks only once Numbers is fully completed.

## MVP scope

- **No audio narration in MVP.** Audio (character voice) is added after admin approval, in a later phase — architecture should not block adding audio later, but don't build it now.
- Videos are pre-made assets (mp4, local), being produced progressively — most lesson pages will reference video files that may not exist yet.
- Progress is tracked client-side (localStorage in MVP) so a returning child resumes where they left off.
- Must work well on tablet and mobile — touch is a primary input (tracing especially).

## Proposed libraries (agreed direction, not yet installed)

| Purpose | Library |
|---|---|
| Progress state + persistence | zustand + persist middleware |
| Tracing/drawing capture | react-sketch-canvas, or custom Pointer Events canvas |
| Local video playback | native `<video>`, no external library |
| Transitions/animations | framer-motion |
| Completion celebration | canvas-confetti |
| Icons | lucide-react |
| Audio (later phase only) | howler.js |

A single centralized TypeScript type should model `character → lesson → item → completed: boolean`, since this shape is reused throughout the app (nav, unlock logic, progress store).

## Current status

Fresh Next.js scaffold only (default starter page). No custom routes, components, state, or content wired up yet — intentionally paused here pending answers to open questions before real implementation starts.
