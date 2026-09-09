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
 * The number's short — autoplaying, looping, with sound.
 *
 * **The numeral sits behind the `<video>` as a placeholder**, not just a
 * poster shown before playback starts: it stays in the DOM the whole time,
 * so if the clip is slow to fetch on a poor connection (or a browser blocks
 * the unmuted autoplay below), the stage never shows an empty black frame —
 * it shows the same numeral art the rest of this stage already uses.
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
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-label={format(dict.videoAbout, { value })}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
