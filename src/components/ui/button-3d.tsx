import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import Link from "next/link";

export interface ButtonTone {
  /** Solid fill, and the base the playful gradient is mixed from. */
  face: string;
  /** Tints the playful drop shadow. Ignored by `calm`; defaults to `face`. */
  edge?: string;
  text?: string;
}

type ToneVars = CSSProperties & {
  "--btn-face"?: string;
  "--btn-edge"?: string;
  "--btn-text"?: string;
};

/** `playful` — gradient face that scales on hover/tap, for the kid-facing CTAs.
    `calm` — solid face, no motion, soft shadow only, for the header chrome. */
export type ButtonVariant = "playful" | "calm";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: ButtonTone;
  variant?: ButtonVariant;
  /** Renders as a `Link` styled identically to the button, for navigation. */
  href?: string;
  /** Link branch only. `"_blank"` for a CTA that leaves the site — the
      Activities page's YouTube card is the one that does. Always pair it with
      `rel="noreferrer noopener"`. */
  target?: string;
  rel?: string;
  children: ReactNode;
}

export function Button3D({
  tone,
  variant = "playful",
  href,
  target,
  rel,
  className = "",
  children,
  style,
  ...props
}: Button3DProps) {
  const toneVars: ToneVars = {
    "--btn-face": tone.face,
    "--btn-edge": tone.edge ?? tone.face,
    "--btn-text": tone.text ?? "#fff",
    ...style,
  };

  const classes = ["btn3d", variant === "calm" && "btn3d--calm", className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={classes}
        style={toneVars}
        aria-label={props["aria-label"]}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      style={toneVars}
      {...props}
    >
      {children}
    </button>
  );
}
