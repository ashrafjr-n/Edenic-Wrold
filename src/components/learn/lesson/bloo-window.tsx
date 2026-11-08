import Image from "next/image";
import type { WindowFx, WindowView } from "@/types/course";

/* A fixed table, never `Math.random()` (it renders on the server too):
   each bit's place across the window (%), its delay and its duration (s),
   and its size. */
const BITS: readonly (readonly [number, number, number, number])[] = [
  [6, 0, 9, 1], [18, 3.2, 11, 0.8], [29, 1.4, 8.5, 1.15], [41, 5.1, 10, 0.9],
  [52, 2.3, 9.5, 1], [63, 6.4, 12, 0.75], [72, 0.8, 8, 1.1], [83, 4.2, 10.5, 0.85],
  [93, 2.9, 9, 1], [12, 7.3, 11.5, 0.9], [47, 8.1, 9.8, 1.05], [77, 6.9, 10.2, 0.8],
];

/** Rain falls fast: its bits run in a fraction of the others' time. */
const SPEED: Record<WindowFx, number> = { petals: 1, glow: 1, leaves: 1, snow: 1, rain: 0.12, wind: 0.5 };

function Fx({ fx }: { fx: WindowFx }) {
  if (fx === "glow") return <span className="bloo-window__glow" />;
  return (
    <>
      {BITS.map(([x, delay, duration, size], i) => (
        <span
          key={i}
          className={`bloo-window__bit bloo-window__bit--${fx}`}
          style={{
            left: `${x}%`,
            animationDelay: `${-delay * SPEED[fx]}s`,
            animationDuration: `${duration * SPEED[fx]}s`,
            scale: size,
          }}
        />
      ))}
    </>
  );
}

/**
 * Bloo's round window (Seasons and Weather, 2026-11-08): the course's calm
 * world. One still room wall in Bloo's blue, one big round window; only
 * what is OUTSIDE changes — the season, then the weather — a slow fade
 * between stills from the lesson's own reels, with one gentle CSS layer
 * (petals, leaves, snow, rain, wind, a sun's glow). No camera, no clips.
 * Behind the steps, over the classroom's wall, never over the header —
 * like `LessonWorldView`.
 */
export function BlooWindow({ view }: { view: WindowView }) {
  return (
    <div className="bloo-window -z-[5]" aria-hidden>
      <div className="bloo-window__glass">
        {/* Keyed by the view: a new one fades in over the last. */}
        <div key={view.src.src} className="bloo-window__view">
          <Image src={view.src} alt="" fill sizes="(min-width: 1024px) 80svh, 94vw" className="object-cover" preload />
          {view.fx && <Fx fx={view.fx} />}
        </div>
      </div>
    </div>
  );
}
