interface NumberVideoProps {
  videoId: string;
  value: number;
}

/* `youtube-nocookie.com` rather than `youtube.com`, and every parameter that
   turns the player down: no end-screen suggestions from other channels
   (`rel=0`), reduced branding, no annotations. This is a page for children —
   nothing on it should offer a way off the site.

   `mute=1` is not a preference, it is what makes `autoplay=1` work at all:
   browsers block an unmuted autoplay outright.

   `cc_load_policy=0` keeps captions off by default — a short with a burned-in
   caption track on top was reading as cluttered for this audience.
   `loop=1` needs `playlist` set to the SAME id or YouTube ignores it; this is
   a Short with no end screen or "next" action, so it should keep replaying
   rather than freezing on its last frame. */
function embedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
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
      {/* Opens the connection to YouTube before the iframe even requests
          anything, instead of waiting for the browser to discover it from the
          iframe's `src` — the DNS lookup, TLS handshake and redirect that
          `youtube-nocookie.com` does to `youtube.com` are what make the embed
          feel slow to start. A `<link>` rendered anywhere in a Server
          Component's output gets hoisted into `<head>` automatically. */}
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />

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
