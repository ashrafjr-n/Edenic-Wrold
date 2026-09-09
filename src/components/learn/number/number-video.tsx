"use client";

import Image from "next/image";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";

interface NumberVideoProps {
  dict: Dictionary["journey"];
  src: string;
  value: number;
  /** The clay numeral, standing in as a placeholder behind the clip. */
  image: string;
}

/**
 * The number's short, behind our own play button.
 *
 * **The `<video>` does not mount until the child presses play** — the same
 * facade the old YouTube embed used, kept because it still does the job:
 * nothing is fetched until the tap (this is the lazy load, no extra
 * attribute needed), and because playback starts inside that click's own
 * user gesture, the browser allows it to autoplay WITH sound rather than
 * forcing it muted.
 *
 * Sized by HEIGHT, not width: the source is a vertical clip, so the frame is
 * as tall as the viewport comfortably allows and its width follows.
 */
export function NumberVideo({ src, value, image, dict }: NumberVideoProps) {
  return (
    <div className="card card-clay-white relative aspect-[9/16] h-[60svh] max-h-[32rem] min-h-[15rem] shrink-0 overflow-hidden sm:h-[68svh] sm:max-h-[42rem]">
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 640px) 24rem, 16rem"
        preload
        className="select-none object-contain p-10 opacity-90"
      />

      <video
        src={src}
        loop
        playsInline
        preload="none"
        aria-label={format(dict.videoAbout, { value })}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
