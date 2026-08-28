interface NumberVideoProps {
  videoId: string;
  value: number;
}

/* `youtube-nocookie.com` rather than `youtube.com`, and every parameter that
   turns the player down: no end-screen suggestions from other channels
   (`rel=0`), reduced branding, no annotations. This is a page for children —
   nothing on it should offer a way off the site.

   `mute=1` is not a preference, it is what makes `autoplay=1` work at all:
   browsers block an unmuted autoplay outright. */
function embedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
    iv_load_policy: "3",
    playsinline: "1",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

/**
 * The number's short, playing the moment the page opens.
 *
 * This used to be a click-to-load facade so nothing reached YouTube for a
 * child who never pressed play; opening straight into the video was asked for
 * instead, so the embed now loads on arrival. `nocookie` is what is left doing
 * that job — it holds tracking cookies back until playback actually starts.
 *
 * Sized by HEIGHT, not width: the source is a vertical Short, so the frame is
 * as tall as the viewport comfortably allows and its width follows. Grown
 * noticeably from `sm` up — this is the reel and the hero of its stage, and
 * with the CTAs moved to sit beside it instead of underneath (see
 * `NumberJourney`'s `discover` stage), nothing below it caps how tall it can
 * get.
 */
export function NumberVideo({ videoId, value }: NumberVideoProps) {
  return (
    <div className="card relative aspect-[9/16] h-[42vh] max-h-[24rem] min-h-[15rem] shrink-0 overflow-hidden sm:h-[68vh] sm:max-h-[42rem]">
      <iframe
        src={embedUrl(videoId)}
        title={`A short video about the number ${value}`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
