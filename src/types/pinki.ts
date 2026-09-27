/**
 * Pinki's five renders. A posture, never a decoration: `pen` is for drawing,
 * `stick` for a screen with ONE unambiguous target to point at, `celebrate`
 * a win, `think` a question, `speak` everything else.
 *
 * It lives in `types/` rather than in `pinki-guide.tsx` so a data module can
 * name a pose without importing from a component.
 */
export type PinkiPose = "speak" | "pen" | "celebrate" | "stick" | "think";

/**
 * How much of the screen Pinki is.
 *
 * - `hero`  — the biggest she ever is. Only where nothing sits under her.
 * - `lead`  — large, with her speech bubble, in the flow above the activity.
 * - `aside` — small, in the corner, absolutely positioned and SILENT: no
 *             bubble, her line carried by a screen-reader-only paragraph so
 *             it still reaches assistive tech and the future audio script.
 * - `none`  — not rendered.
 */
export type GuidePresence = "hero" | "lead" | "aside" | "none";
