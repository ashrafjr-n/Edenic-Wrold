import type { CountActivityKind } from "@/types/count-activity";
import type {
  GameActivityKind,
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
  /** Which exercise the `game` stage is running for this number. */
  gameKind: GameActivityKind;
  /** `give` only: the item is in the basket and the question has begun. */
  appleGiven: boolean;
  /** `path`/`color` only: the child has already reached the target or filled
      the outline in — swaps her pose to `celebrate` and the line to praise,
      the same "be pleased with the result" beat `give` already has. */
  solved: boolean;
  traceMissed: boolean;
  pickMissed: boolean;
  /** `game` only: every balloon rose off the screen with the right one still
      floating. The round is over and she comes back on to offer another. */
  gameFailed: boolean;
}

/**
 * How much of the screen Pinki is at each stage, and what she is doing there.
 *
 * **This table is the whole design, so read it as one thing rather than seven.**
 * Her size is not decoration that happens to vary — it says whose moment this
 * is. She leads wherever her being there is the help (explaining, pointing,
 * cheering) and steps aside wherever the CONTENT is the lesson.
 *
 * `discover` is the row worth defending: it is the reel and nothing else,
 * sized as the hero of its own screen (`sm:h-[68svh]`). She used to sit in its
 * bottom-left corner at `aside` — small, silent, out of the flow — and was
 * taken off it entirely on direct request. The reasoning that put her there
 * still holds and is why she must not come back: a guide standing in front of
 * the thing she is introducing is not guidance, and the video is the whole
 * stage.
 *
 * `celebrate` is the only `hero`: it is the emotional peak AND the one screen
 * with no activity underneath her to cover.
 *
 * `game` is the one row this table cannot state on its own — see `guideFor`
 * below, which puts her back on it at `lead` once the round has been LOST.
 */
const STAGE_GUIDE: Record<
  JourneyStage,
  { presence: GuidePresence; pose: PinkiPose }
> = {
  /* The video is the stage — she is not on it at all. */
  discover: { presence: "none", pose: "speak" },
  reveal: { presence: "lead", pose: "speak" },
  demo: { presence: "lead", pose: "pen" },
  /* The child's own drawing is the stage, and the board is now sized as the
     whole screen — she is off it entirely so nothing leans over the surface
     being drawn on. A missed attempt is answered by the board itself (the
     red shake in `TraceBoard`), not by a line from her. */
  trace: { presence: "none", pose: "pen" },
  /* Overridden per activity below — `count` is four different exercises. */
  count: { presence: "lead", pose: "stick" },
  /* The balloons are the stage while they are still rising. She sat small and
     silent in its bottom-left corner and was taken off it on direct request —
     the concentration this asks for is exactly what a guide beside it competes
     with. `guideFor` overrides this twice: to `lead` once every balloon has
     escaped, and for the whole of the `complete` game, which is a board with
     one target to point at rather than a race. */
  game: { presence: "none", pose: "speak" },
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
  /* The `complete` game is the `complete` count board under another name — one
     unambiguous gap to aim at, so she holds the stick there exactly as she
     does at `count`, and `pointsAtTarget` lights the gap to match. */
  if (stage === "game") {
    return state.gameKind === "complete" && !state.gameFailed
      ? COUNT_POSE.complete
      : basePose;
  }

  if (stage !== "count") return basePose;

  /* Giving has two beats: point at the basket, then be pleased with what is
     in it while the child says how many. */
  if (state.countKind === "give") {
    return state.appleGiven ? "celebrate" : COUNT_POSE.give;
  }

  /* `path`/`color` have no single target to point the stick at (see
     `COUNT_POSE` above), so a plain `speak` is all they had once solved too —
     she never actually said anything different. Now that she does
     (`script.countDone`), the pose has to change with it or a celebrate line
     would come out of a speaking pose. `complete` needs no such branch: it
     is `"none"` before this function even runs (see `guideFor`). */
  if ((state.countKind === "path" || state.countKind === "color") && state.solved) {
    return "celebrate";
  }

  return COUNT_POSE[state.countKind];
}

function countLine(script: NumberScript, state: GuideState): string {
  if (state.countKind === "give") {
    if (state.pickMissed) return script.findMiss;
    return state.appleGiven ? script.countHow : script.count;
  }

  /* `complete` is a drag, so a miss is answered the way a missed trace is —
     an offer to go again, not a verdict. Moot in practice now that `complete`
     renders no guide at all (see `guideFor`), kept for the day it might. */
  if (state.countKind === "complete" && state.pickMissed) {
    return script.traceMiss;
  }

  if ((state.countKind === "path" || state.countKind === "color") && state.solved) {
    return script.countDone;
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
    case "count":
      return countLine(script, state);
    case "game":
      if (state.gameFailed) return script.gameRetry;
      if (state.gameKind === "complete") {
        /* A drag, so a miss is answered the way a missed trace is — an offer
           to go again, not a verdict. Same call `countLine` makes. */
        return state.pickMissed ? script.traceMiss : script.gameComplete;
      }
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

  /* **`complete` gets no guide at all, on `count` or on `game` — direct
     request.** The drag-the-piece board is the whole activity now; what used
     to be her pointing at the gap is a looping demo on the piece itself
     instead (see `NumberComplete`'s own `complete-hint` animation), and the
     gap's `.guide-target` halo (still lit — `pointsAtTarget` reads the pose
     below, not this) is enough of a "look here" without her standing over
     it. `gameFailed` can never be true in the same beat as `gameKind ===
     "complete"` — that branch never mounts `BalloonPop`, so nothing ever
     sets it — but `"none"` is checked first regardless, so the two can never
     race. */
  const presence =
    stage === "count" && state.countKind === "complete"
      ? "none"
      : stage === "game"
        ? state.gameKind === "complete"
          ? "none"
          : state.gameFailed
            ? "lead"
            : base.presence
        : base.presence;

  return {
    presence,
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
