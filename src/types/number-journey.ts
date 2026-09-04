/**
 * The stages of one number's journey, in order.
 *
 * Named rather than numbered so the pipeline can be reordered or extended
 * without every component having to know its index. `celebrate` is the score
 * screen and is not a step the child works at, which is why the step rail
 * counts the ones before it.
 */
export const JOURNEY_STAGES = [
  "discover",
  "reveal",
  "demo",
  "trace",
  "find",
  "count",
  "game",
  "celebrate",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];

/** The stages the child actually works through — what the step rail counts. */
export const WORKING_STAGES = JOURNEY_STAGES.filter(
  (stage) => stage !== "celebrate",
);

/**
 * Pinki's five renders. A posture, never a decoration: `pen` is the two
 * drawing stages, `think` the one stage that asks the child to CHOOSE rather
 * than to listen, `stick` a stage with ONE unambiguous target to point at,
 * `celebrate` a win, `speak` everything else.
 *
 * It lives here rather than in `pinki-guide.tsx` because `data/number-guide.ts`
 * has to name a pose for every stage, and a data module must not import from a
 * component. `pinki-guide.tsx` re-exports it, so every existing import of it
 * from there still resolves — the same call `store/progress.ts` makes for the
 * key builders it keeps in `lib/`.
 */
export type PinkiPose = "speak" | "pen" | "celebrate" | "stick" | "think";

/**
 * How much of the screen Pinki is, at one stage.
 *
 * She is the teacher, not a fixed ornament, so her size is a statement about
 * whose moment this is. When she is genuinely helping — explaining, pointing,
 * celebrating — she leads. When the CONTENT is the lesson (the reel, a game
 * the child has to concentrate on) she gets out of its way, because a guide
 * standing in front of the thing she is introducing is not guidance.
 *
 * - `hero`  — the biggest she ever is. Only where nothing sits under her.
 * - `lead`  — large, with her speech bubble, in the flow above the activity.
 * - `aside` — small, in the corner, absolutely positioned and SILENT: no
 *             bubble, her line carried by a screen-reader-only paragraph so
 *             it still reaches assistive tech and the future audio script.
 *             Costs the stage no height at all.
 * - `none`  — not rendered.
 */
export type GuidePresence = "hero" | "lead" | "aside" | "none";

/**
 * What Pinki says at each point of one number's journey.
 *
 * Every line is written to be read aloud later: audio is not built yet, but
 * the flow is designed as though it were, so adding a clip per line changes no
 * layout. Keep them short — a child under ten reads a phrase, not a sentence.
 */
export interface NumberScript {
  /** The number as a word: "One". Shown, and later spoken. */
  word: string;
  discover: string;
  /** Said while the numeral itself is on screen, before any drawing starts. */
  reveal: string;
  /** How the numeral is written, in the order the strokes are drawn. */
  strokeHint: string;
  traceInvite: string;
  /** Shown when a trace attempt does not land. Never says "wrong". */
  traceMiss: string;
  find: string;
  findMiss: string;
  count: string;
  countHow: string;
  game: string;
  celebrate: string;
}
