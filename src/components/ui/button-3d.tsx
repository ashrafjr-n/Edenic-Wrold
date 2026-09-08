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

interface Button3DProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  tone: ButtonTone;
  /** Fires on BOTH branches — the `<button>` and the `<Link>`. Deliberately
      argument-less: the two elements hand back different event types, and no
      caller on the site has ever needed the event itself. Anything that does
      (the Play page's trail card, which has to let a modified click through)
      uses a raw `<Link>` rather than this component. */
  onClick?: () => void;
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
        /* Forwarded because a LINK can still want to react to its own press
           — `NextButton` collapses its label the moment it is clicked, on the
           way to the page it is pointing at. Navigation is still the `href`'s
           job; this only lets the button acknowledge the tap. */
        onClick={props.onClick}
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
