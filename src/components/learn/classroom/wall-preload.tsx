"use client";

import { preload } from "react-dom";
import { getImageProps, type StaticImageData } from "next/image";

interface WallPreloadProps {
  portrait: StaticImageData;
  landscape: StaticImageData;
}

/**
 * Preloads the classroom wall — only the frame that fits the screen, each
 * preload carrying its orientation. A Client Component on purpose: called
 * while the page renders on the server, `preload` lands as a `<link>` in
 * the head (as `<Image preload>`'s does); from a Server Component it only
 * travels as a hint in the data stream, read too late to help.
 */
export function WallPreload({ portrait, landscape }: WallPreloadProps) {
  for (const [src, media] of [
    [portrait, "(orientation: portrait)"],
    [landscape, "(orientation: landscape)"],
  ] as const) {
    const { props } = getImageProps({ src, alt: "", fill: true, sizes: "100vw" });
    preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, media, fetchPriority: "high" });
  }
  return null;
}
