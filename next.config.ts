import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  /* **Optimized images are cached for 31 days, not the default 4 hours.**
     Every picture on this site is a fixed asset that only changes when
     someone repaints it, so re-optimizing one every four hours buys nothing
     and costs the first visitor after each expiry a cold encode — which is
     exactly the "sometimes the images take a moment to appear" that was
     reported from a phone. `formats` is deliberately left at its default
     (`['image/webp']`): AVIF is ~50% slower to encode (see
     `next/dist/docs/.../image.md`), so adding it would make that first view
     slower, not faster, for a 20% file saving nobody is waiting on. */
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 31,
    /* Episode thumbnails on /watch come from YouTube. */
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  /* `/public` files are served `max-age=0` by default: every visit
     re-asked the server for each of a world's hundreds of frames. A file
     whose URL carries `?v=<hash>` (frames, world clips, chest crops — the
     generators bump it on every re-render) never changes under that URL, so
     it is cached for good. The rest (reels, their posters, the nav icons)
     can change in place: a day, then refreshed in the background. The last
     matching rule wins, so the `?v=` one comes second. */
  headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/assets/:path*",
        has: [{ type: "query", key: "v" }],
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  /* The Play section lived at `/activities` until it was renamed. A child
     who bookmarked a puzzle, or anyone holding a link to one, must still
     land on it — so both the section itself and everything under it are
     redirected, permanently (308, which preserves the request method; see
     `next/dist/docs/.../redirects.md`).

     Two rules, not one: `/activities/:path*` does NOT match the bare
     `/activities`, and a lone `:path*` in the destination would otherwise
     have nothing to fill it with. */
  redirects() {
    return [
      { source: "/activities", destination: "/play", permanent: true },
      {
        source: "/activities/:path*",
        destination: "/play/:path*",
        permanent: true,
      },
      /* The Edenic Trail's own page became the Play game itself (the Sky
         Trail, 2026-11-12): `/play` is the sky now. */
      { source: "/trail", destination: "/play", permanent: true },
      /* The Sky Trail was cancelled (2026-11-15): its levels are gone;
         `/play` is the Sleeping Lab now. */
      { source: "/play/sky/:path*", destination: "/play", permanent: true },
    ];
  },
};

export default nextConfig;
