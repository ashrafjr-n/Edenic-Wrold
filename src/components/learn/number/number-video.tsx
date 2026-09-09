"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";

interface NumberVideoProps {
  dict: Dictionary["journey"];
  src: string;
  value: number;
  /** The clay numeral, standing in as the poster until the child presses play. */
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
  const [playing, setPlaying] = useState(false);

  return (
    /* **`svh`, never `vh`.** `vh` is measured against the LARGE viewport —
        the phone with its browser chrome hidden — so a `42vh` box is taller
        than the screen actually has whenever that chrome is showing, and the
        stage overflows and jumps as the bar slides in and out. `svh` is the
        SMALL viewport, i.e. the height that is there in the worst case, so
        the frame fits at every scroll position and nothing moves. `dvh`
        would fit too, but it re-measures as the bar animates, which resizes
        the video mid-scroll — the wrong trade for a box a child is watching.
       Same call `.puzzle-upright` and `TrailSky` already make. */
    <div className="card card-clay-white relative aspect-[9/16] h-[60svh] max-h-[32rem] min-h-[15rem] shrink-0 overflow-hidden sm:h-[68svh] sm:max-h-[42rem]">
      {playing ? (
        <video
          src={src}
          autoPlay
          loop
          playsInline
          preload="none"
          aria-label={format(dict.videoAbout, { value })}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={format(dict.playVideoAbout, { value })}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* The numeral itself is the poster — a local asset that is already
              on the page, so the facade costs no extra request and can never
              show an empty grey frame while a thumbnail loads. */}
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 640px) 24rem, 16rem"
            preload
            className="select-none object-contain p-10 opacity-90"
          />

          <span
            className="clay relative flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24"
            style={
              {
                backgroundColor: "var(--brand)",
                "--clay-edge": "var(--brand-dark)",
              } as CSSProperties
            }
          >
            {/* Nudged right by a hair: a triangle's visual centre sits left of
                its bounding box, so a centred one looks off-centre. */}
            <Play
              className="ml-1 h-9 w-9 fill-current text-white sm:h-11 sm:w-11"
              strokeWidth={2}
            />
          </span>
        </button>
      )}
    </div>
  );
}
