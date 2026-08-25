import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export interface ButtonTone {
  face: string;
  edge: string;
  text?: string;
}

type ToneVars = CSSProperties & {
  "--btn-face"?: string;
  "--btn-edge"?: string;
  "--btn-text"?: string;
};

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: ButtonTone;
  brand?: boolean;
  children: ReactNode;
}

export function Button3D({
  tone,
  brand = false,
  className = "",
  children,
  style,
  ...props
}: Button3DProps) {
  const toneVars: ToneVars = {
    "--btn-face": tone.face,
    "--btn-edge": tone.edge,
    "--btn-text": tone.text ?? "#fff",
    ...style,
  };

  return (
    <button
      type="button"
      className={`btn3d ${brand ? "btn3d--brand" : ""} ${className}`}
      style={toneVars}
      {...props}
    >
      {children}
    </button>
  );
}
