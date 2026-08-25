import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

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
  children: ReactNode;
}

export function Button3D({
  tone,
  variant = "playful",
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
