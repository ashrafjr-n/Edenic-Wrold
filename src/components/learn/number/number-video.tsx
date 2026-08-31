"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface NumberVideoProps {
  videoId: string;
  value: number;
  /** The clay numeral, standing in as the poster until the child presses play. */
  image: string;
}

/* `youtube-nocookie.com` rather than `youtube.com`, and every parameter that
   turns the player down: no end-screen suggestions from other channels
   (`rel=0`), reduced branding, no annotations. This is a page for children —
   nothing on it should offer a way off the site.

   `autoplay=1` with NO `mute`: this URL is only ever built after the child has
   pressed our own play button, so the document is inside a user gesture and
   the browser allows sound. That is the whole reason the facade exists — an
   autoplaying embed on arrival can only ever be silent.

   `cc_load_policy=0` keeps captions off. `loop=1` needs `playlist` set to the
   SAME id or YouTube ignores it; this is a Short with no end screen, so it
   replays rather than freezing on its last frame. */
function embedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
    iv_load_policy: "3",
    cc_load_policy: "0",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

/**
 * The number's short, behind our own play button.
 *
 * **The iframe does not exist until the child presses play.** This went
 * through three rounds before landing here: a click-to-load facade, then a
 * silent autoplaying embed, then a bare embed with no autoplay at all — and
 * that last one was simply broken on a phone. Tapping YouTube's own poster
 * did nothing at all there (verified in a real browser), because the player
 * decides for itself whether a tap counts, and a child left staring at a
 * dead thumbnail has no way forward.
 *
 * Owning the play button fixes all three complaints at once: the button is
 * ours, so a tap always responds; nothing is fetched from YouTube until that
 * tap, so the page no longer waits on the player's own bundle to appear; and
 * because the iframe is created inside the click, `autoplay=1` is allowed to
 * run WITH sound, which a page-load autoplay never could.
 *
 * Sized by HEIGHT, not width: the source is a vertical Short, so the frame is
 * as tall as the viewport comfortably allows and its width follows.
 */
export function NumberVideo({ videoId, value, image }: NumberVideoProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="card relative aspect-[9/16] h-[42vh] max-h-[24rem] min-h-[15rem] shrink-0 overflow-hidden sm:h-[68vh] sm:max-h-[42rem]">
      {/* Opens the connection to YouTube while the child is still looking at
          the poster, so pressing play doesn't also pay for the DNS lookup,
          TLS handshake and the `nocookie` → `youtube.com` redirect. A `<link>`
          rendered in a component's output is hoisted into `<head>`. */}
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />

      {playing ? (
        <iframe
          src={embedUrl(videoId)}
          title={`A short video about the number ${value}`}
          /* `autoplay` has to be in `allow` as well as in the URL — the URL
             asking and the frame being permitted are two different things,
             and without this the player stays paused. */
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play the video about the number ${value}`}
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
            priority
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
