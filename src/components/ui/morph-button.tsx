"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button3D, type ButtonTone } from "@/components/ui/button-3d";

/**
 * How long `AgainButton` holds the caller's handler back before running it.
 *
 * **The delay is the whole point, not a flourish.** Every replay button
 * restarts something, and the restart re-renders or outright unmounts the
 * button that asked for it in the same tick — the balloon round remounts on
 * `gameFailed`, the celebration screen leaves through the journey's own stage
 * swap, the puzzle and the memory board both re-deal. Calling `onPress`
 * straight from the click would batch the state change into the same render as
 * the spin, so the animation would never be on screen for a single frame.
 *
 * Hand-synced with the transitions on `.morph-btn*` in `globals.css`: a touch
 * longer than the 0.45s collapse, so the pill has fully closed into its disc
 * before the screen changes underneath it.
 *
 * **`NextButton` has no equivalent and must not grow one** — a forward button
 * has to answer instantly (direct request). Its collapse is whatever is left
 * on screen while the next stage mounts, which is exactly as much
 * acknowledgement as a button that is getting out of the way deserves.
 */
const SPIN_MS = 520;

/** The section's own colour, the same trio `BackButton` reads — Pinki's pink
    inside the numbers lesson, green in the puzzles, gold in Memory Match,
    with no call site naming a colour. Each route sets it on its `<main>`
    with `pageAccent()`. */
const PAGE_ACCENT: ButtonTone = {
  face: "var(--page-accent-color)",
  edge: "var(--page-accent-edge)",
  text: "var(--page-accent-ink)",
};

interface MorphButtonProps {
  /** "Again" / "Try Again" / "Next" / "Number 5", already translated. */
  label: string;
  /** Only ever the direction of the LABEL — the layout never mirrors. */
  dir?: string;
  tone?: ButtonTone;
  className?: string;
}

interface AgainButtonProps extends MorphButtonProps {
  /** Run once the press animation has played out — see `SPIN_MS`. */
  onPress: () => void;
}

interface NextButtonProps extends MorphButtonProps {
  /** Run immediately on press. Omit when `href` carries the navigation. */
  onPress?: () => void;
  /** Renders as a `Link` instead of a button, styled identically. */
  href?: string;
}

/**
 * The site's one replay button: the trace board's "Try Again", the lost
 * balloon round's "Again", the celebration screen's, a finished puzzle's and a
 * finished memory level's.
 *
 * It is the header's dark-mode chip in a pill. At rest it is the icon and the
 * word; on press three things happen at once, over the same ~0.45s — the word
 * collapses away, the button's own side padding shrinks until it is as wide as
 * it is tall, and the icon turns a FULL circle. What is left mid-press is a
 * spinning disc exactly the size of the back button in the corner, so a replay
 * reads as the screen being wound back.
 *
 * The turn is COUNTED rather than derived from any state, exactly as
 * `ThemeToggle`'s is — a rotation read off a boolean can only alternate, so it
 * would wind back on every second press.
 */
export function AgainButton({
  label,
  onPress,
  tone,
  dir,
  className = "",
}: AgainButtonProps) {
  const [turns, setTurns] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  /* The timer outlives the click, and most presses here unmount this button —
     without the cleanup the handler would fire into a dead component. */
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const press = () => {
    /* A second press mid-turn would restart the round twice and reset the
       collapse halfway through it. */
    if (spinning) return;

    setSpinning(true);
    setTurns((value) => value + 1);
    timer.current = window.setTimeout(() => {
      setSpinning(false);
      onPress();
    }, SPIN_MS);
  };

  return (
    <Button3D
      tone={tone ?? PAGE_ACCENT}
      onClick={press}
      className={["morph-btn", spinning && "is-morphed", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="morph-btn__icon" style={{ rotate: `${turns * 360}deg` }}>
        <RotateCcw className="h-5 w-5" strokeWidth={2.75} />
      </span>

      {/* The label stays in the DOM while it is collapsed — it is what names
          this button to a screen reader, and hiding it outright would leave a
          nameless circle for the half second the turn lasts. */}
      <span className="morph-btn__label morph-btn__label--trailing" dir={dir}>
        <span>{label}</span>
      </span>
    </Button3D>
  );
}

/**
 * The site's one forward button: "Next", "My turn!", "Finish!", "Number 5", a
 * finished puzzle's and a finished level's "Next".
 *
 * **The same collapse as `AgainButton`, and deliberately NOT the same turn.**
 * A direct request: the word slides away and the pill closes into a disc
 * around the arrow, so the two buttons standing side by side are visibly one
 * family — but an arrow that spun would say "start over" in the one place that
 * means the opposite. It also never defers: this button answers the press
 * immediately and the collapse is simply what is on screen while the next
 * stage arrives.
 *
 * The arrow trails the word here rather than leading it, so the label's gap
 * has to collapse from the other side — `--leading` instead of `--trailing`.
 */
export function NextButton({
  label,
  onPress,
  href,
  tone,
  dir,
  className = "",
}: NextButtonProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Button3D
      tone={tone ?? PAGE_ACCENT}
      href={href}
      onClick={() => {
        setCollapsed(true);
        onPress?.();
      }}
      className={["morph-btn", collapsed && "is-morphed", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="morph-btn__label morph-btn__label--leading" dir={dir}>
        <span>{label}</span>
      </span>

      <span className="morph-btn__icon">
        <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
      </span>
    </Button3D>
  );
}
