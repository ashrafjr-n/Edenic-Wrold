import type { CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

interface BackButtonProps {
  href: string;
  /** Reads out as the destination — "Back to Pinki's lessons". The button
      carries no visible text, so this is the only thing announcing it. */
  label: string;
}

/** The three variables a route hands down to colour its own section. */
export type PageAccentVars = CSSProperties & {
  "--page-accent-color"?: string;
  "--page-accent-edge"?: string;
  "--page-accent-ink"?: string;
};

/**
 * Builds the style a route puts on its `<main>` to claim a colour for
 * everything section-coloured beneath it.
 *
 * `ink` is what sits ON the face and defaults to white — pass
 * `var(--color-ink)` for a face too pale to carry white type, which on this
 * site means gold.
 */
export function pageAccent(face: string, edge: string, ink?: string) {
  return {
    "--page-accent-color": face,
    "--page-accent-edge": edge,
    ...(ink ? { "--page-accent-ink": ink } : {}),
  } satisfies PageAccentVars;
}

/**
 * The one back button on the site — the same chip on all seven pages that
 * have one, in **the colour of the section it is standing in**.
 *
 * It reads `--page-accent-color` / `--page-accent-edge` /
 * `--page-accent-ink` (`globals.css`) rather than naming a colour, and each
 * route sets those on its own `<main>` with `pageAccent()`. So the button is
 * green in the puzzles, gold in Memory Match, and each character's own accent
 * on their hub — the same thing the lesson cards already do, where a card
 * takes its character's colour instead of hardcoding Pinki's.
 *
 * **This replaced seven copies of the same JSX, every one of them hardcoding
 * `--accent`.** That pink was a deliberate choice once — it is what tells
 * "go back" apart from the white achievements crown sitting in the same row —
 * and that still holds, because the crown is white on every page whatever
 * colour this button takes. What it was NOT is a per-page decision: it was
 * Pinki's page copied outward, so the puzzles and Memory Match wore her pink
 * for no reason of their own.
 *
 * The arrow carries no colour class: it inherits `.btn3d`'s own
 * `--btn-text`, which is where `--page-accent-ink` arrives.
 */
export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Button3D
      tone={{
        face: "var(--page-accent-color)",
        edge: "var(--page-accent-edge)",
        text: "var(--page-accent-ink)",
      }}
      href={href}
      aria-label={label}
      className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
    >
      <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.75} />
    </Button3D>
  );
}
