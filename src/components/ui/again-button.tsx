"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button3D, type ButtonTone } from "@/components/ui/button-3d";

/**
 * How long the press animation runs before the caller's own handler fires.
 *
 * **The delay is the whole point, not a flourish.** Every one of these
 * buttons restarts something, and a restart re-renders (or outright unmounts)
 * the button that asked for it in the same tick — the balloon round remounts
 * on `gameFailed`, the celebration screen fades out through the journey's own
 * stage swap, the puzzle and the memory board both re-deal. Calling `onPress`
 * straight from the click would batch the state change into the same render
 * as the spin, so the animation would never be on screen for a single frame.
 * Holding the change back until the turn has finished is what makes it
 * visible everywhere instead of only where the button happens to survive.
 *
 * Hand-synced with the transitions on `.again-btn*` in `globals.css`: a touch
 * longer than the 0.45s collapse so the pill has fully closed into its disc
 * before the screen changes underneath it.
 */
const SPIN_MS = 520;

interface AgainButtonProps {
  /** "Again" / "Try Again", already translated by the caller. */
  label: string;
  /** Run once the press animation has played out. */
  onPress: () => void;
  /**
   * The face this button wears. Defaults to the section's own
   * `--page-accent-*` trio — the same colour the back button in the corner
   * takes, so inside the numbers lesson it is Pinki's pink with nothing at
   * the call site naming a colour.
   *
   * Pass a tone (with the matching class in `className`) only where the
   * section colour is already spoken for by the button NEXT to this one — a
   * finished puzzle's green "Next", a finished level's gold one — and two
   * buttons of the same hue side by side would lose the hierarchy between
   * them.
   */
  tone?: ButtonTone;
  /** Only ever the direction of the LABEL — the layout never mirrors. */
  dir?: string;
  className?: string;
}

/**
 * The site's one replay button: the trace board's "Try Again", the lost
 * balloon round's "Again", the celebration screen's, a finished puzzle's and
 * a finished memory level's.
 *
 * It is the header's dark-mode chip in a pill: pressing it collapses the word
 * away, shrinks the button into a disc and turns the icon a full circle, all
 * at the same time (`.again-btn` in `globals.css` owns every one of those).
 * The turn is COUNTED rather than derived from any state, exactly as
 * `ThemeToggle`'s is — a rotation read off a boolean can only alternate, so
 * it would wind back on every second press.
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
      tone={
        tone ?? {
          face: "var(--page-accent-color)",
          edge: "var(--page-accent-edge)",
          text: "var(--page-accent-ink)",
        }
      }
      onClick={press}
      className={["again-btn", spinning && "is-spinning", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="again-btn__icon" style={{ rotate: `${turns * 360}deg` }}>
        <RotateCcw className="h-5 w-5" strokeWidth={2.75} />
      </span>

      {/* The label stays in the DOM while it is collapsed — it is what names
          this button to a screen reader, and hiding it outright would leave a
          nameless circle for the half second the turn lasts. */}
      <span className="again-btn__label" dir={dir}>
        <span>{label}</span>
      </span>
    </Button3D>
  );
}
