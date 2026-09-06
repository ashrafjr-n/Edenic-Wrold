import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
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
    ];
  },
};

export default nextConfig;
