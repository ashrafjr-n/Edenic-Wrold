"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface NumberVideoProps {
  videoId: string;
  /** The clay numeral, used as the poster behind the play button. */
  posterImage: string;
  value: number;
  accent: string;
  accentDark: string;
}

/* `youtube-nocookie.com` rather than `youtube.com`, and every parameter that
   turns the player down: no end-screen suggestions from other channels
   (`rel=0`), reduced branding, no annotations. This is a page for children —
   nothing on it should offer a way off the site. */
function embedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
    iv_load_policy: "3",
    playsinline: "1",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

/**
 * A click-to-load facade in front of the embed.
 *
 * The iframe is not rendered until the child taps play, so YouTube is not
 * contacted — and sets nothing — for a child who never watches. That is the
 * same reason `nocookie` is used, taken one step further: privacy-enhanced
 * mode still loads on arrival, this does not. It also keeps the page light,
 * since an embed is far heavier than everything else here put together.
 */
export function NumberVideo({
  videoId,
  posterImage,
  value,
  accent,
  accentDark,
}: NumberVideoProps) {
  const [playing, setPlaying] = useState(false);

  return (
    /* Portrait: the source is a YouTube Short, so a 16/9 frame would letterbox
       it down to a sliver. Capped by height as well, or it runs past the fold
       on a phone. */
    <div className="card relative aspect-[9/16] w-full max-w-[11rem] shrink-0 overflow-hidden sm:max-w-[13rem]">
      {playing ? (
        <iframe
          src={embedUrl(videoId)}
          title={`A short video about the number ${value}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play the video about the number ${value}`}
          className="group/play absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 18%, #ffffff)`,
          }}
        >
          <Image
            src={posterImage}
            alt=""
            width={414}
            height={600}
            className="absolute inset-0 h-full w-full object-contain p-8 opacity-45"
          />

          <span
            className="btn3d relative h-16 w-16 sm:h-20 sm:w-20"
            style={{
              "--btn-face": accent,
              "--btn-edge": accentDark,
              "--btn-text": "#fff",
            } as React.CSSProperties}
          >
            {/* Filled, like the hub's crown — an outlined glyph breaks up
                against the clay renders around it. */}
            <Play
              className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8"
              strokeWidth={1.5}
            />
          </span>
        </button>
      )}
    </div>
  );
}
