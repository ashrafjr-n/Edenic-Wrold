# Edenic World

An educational web app for kids aged 5–9. Three mascots — Pinki, Nova and Bloo — teach short video-led courses (real clips, compressed to 720p H.264 by `tools/reels/encode.sh`), and a Play section adds puzzles, a memory game and Nova's cups game. A course's lessons can happen in a pre-rendered 3D world of their own (Pinki's felt-land shape garden and pastel colour land, Nova's kitchen and her candy-pink garden, Bloo's sunny farm for Animals and his floating island of the year for Seasons and Weather) — each season's lessons turn the whole island into that season (the review shows all four quarters at once), and after the weather's reel it rains, shines, blows or snows there, and a course page can itself be a 3D world of stops where scrolling moves the camera (Shapes, Colors, Nova's Vegetables and My Garden, and Bloo's Animals and Seasons and Weather): each activity is a camera shot of it, the moves between them are rendered camera moves, and the lesson ends there with the friend celebrating; a course without a world ends back on the friend's chalkboard with the path it walked. The interface reads in English, Arabic and Badini Kurdish.

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
