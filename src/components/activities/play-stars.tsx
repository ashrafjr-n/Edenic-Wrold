"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { format } from "@/lib/format-dict";
import { usePlayStars } from "@/store/progress";
import chestStar from "../../../public/assets/learn/chest-star.png";

/**
 * Play's star bank, at the right of the back row: the white clay chip
 * (`.clay-chip`, a size up — its classes are unlayered, so the size rides
 * on `style`) with the chest's gold star and how many stars are left to
 * spend. `data-star-bank` is where an opening game's two stars fly from
 * (`PlayLock`). Shows 0 until the store has read localStorage.
 */
export function PlayStars({ label }: { label: string }) {
  const { left } = usePlayStars();
  return (
    <span
      role="img"
      aria-label={format(label, { n: left })}
      data-star-bank
      className="clay-chip"
      style={{ fontSize: "1.35rem", padding: "0.4rem 1.1rem 0.4rem 0.55rem", gap: "0.45rem" } as CSSProperties}
    >
      <Image src={chestStar} alt="" sizes="40px" className="h-9 w-9 object-contain" />
      <span aria-hidden dir="ltr">
        {left}
      </span>
    </span>
  );
}
