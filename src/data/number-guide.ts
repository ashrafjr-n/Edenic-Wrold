import type { CountActivityKind } from "@/types/count-activity";
import type {
  GuidePresence,
  JourneyStage,
  NumberScript,
  PinkiPose,
} from "@/types/number-journey";

/** Pinki's whole appearance at one moment of the journey. */
export interface StageGuide {
  presence: GuidePresence;
  pose: PinkiPose;
  line: string;
}

/** The stage-dependent facts `guideFor` needs but cannot know: which of the
    four `count` activities this number uses, and where the child has got to
    inside the stage on screen. Grouped rather than passed as four loose
    booleans — the caller already holds them together. */
export interface GuideState {
  countKind: CountActivityKind;
  /** `give` only: the item is in the basket and the question has begun. */
  appleGiven: boolean;
  traceMissed: boolean;
  pickMissed: boolean;
}

/**
 * How much of the screen Pinki is at each stage, and what she is doing there.
 *
 * **This table is the whole design, so read it as one thing rather than eight.**
 * Her size is not decoration that happens to vary — it says whose moment this
 * is. She leads wherever her being there is the help (explaining, pointing,
 * cheering) and steps aside wherever the CONTENT is the lesson.
 *
 * The two `aside` rows are the ones worth defending:
 *
 * - `discover` is the reel and nothing else, sized as the hero of its own
 *   screen (`sm:h-[68vh]`). A large Pinki above it would push the very video
 *   she is introducing off the fold — the same mistake `NumbersIntro` was
 *   rebuilt to avoid on the picker, where a banner-sized guide hid the
 *   numerals it pointed at.
 * - `game` is five drifting balloons the child has to track and choose
 *   between. That is concentration, and a guide talking over it competes with
 *   the thing being asked.
 *
 * `celebrate` is the only `hero`: it is the emotional peak AND the one screen
 * with no activity underneath her to cover.
 */
const STAGE_GUIDE: Record<
  JourneyStage,
  { presence: GuidePresence; pose: PinkiPose }
> = {
  discover: { presence: "aside", pose: "speak" },
  reveal: { presence: "lead", pose: "speak" },
  demo: { presence: "lead", pose: "pen" },
  trace: { presence: "lead", pose: "pen" },
  find: { presence: "lead", pose: "think" },
  /* Overridden per activity below — `count` is four different exercises. */
  count: { presence: "lead", pose: "stick" },
  game: { presence: "aside", pose: "speak" },
  celebrate: { presence: "hero", pose: "celebrate" },
};

/**
 * The `count` stage is four different activities in one slot, so the pose is
 * chosen per activity rather than per stage.
 *
 * **`stick` is only ever used where there is exactly ONE thing to point at.**
 * The stick's angle is fixed in the artwork — `NumbersIntro` documents that
 * aiming it takes a rotation tuned by hand to one composition, and that a
 * deeper lean aims it WORSE — so a single pose cannot point at four different
 * layouts. `give` has the basket and `complete` has the gap; both are one
 * unambiguous target, and both get a matching glow on that target so the
 * gesture lands somewhere real. `path` and `color` have no single target and
 * would leave the stick pointing at nothing, which reads worse than no stick.
 *
 * `path` has a second, harder reason: the child DRAGS a Pinki token along it
 * (`number-path.tsx`), whose own comment records the rule — "two Pinkis on one
 * board read as two characters, not as a hint". So the guide there stays a
 * plain speaking Pinki and never mirrors the token's gesture.
 */
const COUNT_POSE: Record<CountActivityKind, PinkiPose> = {
  give: "stick",
  complete: "stick",
  path: "speak",
  color: "speak",
};

function poseFor(
  stage: JourneyStage,
  basePose: PinkiPose,
  state: GuideState,
): PinkiPose {
  if (stage !== "count") return basePose;

  /* Giving has two beats: point at the basket, then be pleased with what is
     in it while the child says how many. */
  if (state.countKind === "give") {
    return state.appleGiven ? "celebrate" : COUNT_POSE.give;
  }

  return COUNT_POSE[state.countKind];
}

function countLine(script: NumberScript, state: GuideState): string {
  if (state.countKind === "give") {
    if (state.pickMissed) return script.findMiss;
    return state.appleGiven ? script.countHow : script.count;
  }

  /* `complete` is a drag, so a miss is answered the way a missed trace is —
     an offer to go again, not a verdict. */
  if (state.countKind === "complete" && state.pickMissed) {
    return script.traceMiss;
  }

  return script.count;
}

function lineFor(
  stage: JourneyStage,
  script: NumberScript,
  state: GuideState,
): string {
  switch (stage) {
    case "discover":
      return script.discover;
    case "reveal":
      return script.reveal;
    case "demo":
      return script.strokeHint;
    case "trace":
      return state.traceMissed ? script.traceMiss : script.traceInvite;
    case "find":
      return state.pickMissed ? script.findMiss : script.find;
    case "count":
      return countLine(script, state);
    case "game":
      return state.pickMissed ? script.findMiss : script.game;
    case "celebrate":
      return script.celebrate;
  }
}

/**
 * Pinki's presence, pose and line for the stage on screen.
 *
 * One function rather than a branch in the journey's markup: this used to be a
 * forty-line nested ternary inside `NumberJourney`'s body, which put content
 * and layout decisions in the same place as the JSX. Keeping it here also
 * keeps the answer in ONE place — the stage table above is the only thing that
 * decides how big she is, so her size can never disagree between the component
 * that renders her and the stage that asked for her.
 */
export function guideFor(
  stage: JourneyStage,
  script: NumberScript,
  state: GuideState,
): StageGuide {
  const base = STAGE_GUIDE[stage];

  return {
    presence: base.presence,
    pose: poseFor(stage, base.pose, state),
    line: lineFor(stage, script, state),
  };
}

/**
 * Whether the stage on screen should mark the thing the child has to act on.
 *
 * Only where Pinki is actually pointing (`stick`) is there a gesture for a
 * highlight to complete — everywhere else the glow would be a loose light with
 * nothing aiming at it. Derived from the same pose the guide already resolved,
 * so the stick and the glow can never appear without each other.
 */
export function pointsAtTarget(guide: StageGuide): boolean {
  return guide.pose === "stick";
}
