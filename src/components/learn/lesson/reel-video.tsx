import Image from "next/image";

interface ReelVideoProps {
  src: string;
  /** Names the clip for a screen reader. */
  label: string;
  /** Art shown behind the clip as a placeholder. */
  image: string;
}

/**
 * A lesson's reel — autoplaying, looping, with sound.
 *
 * **The image sits behind the `<video>` as a placeholder**, not just a
 * poster shown before playback starts: it stays in the DOM the whole time,
 * so if the clip is slow to fetch on a poor connection (or a browser blocks
 * the unmuted autoplay below), the stage never shows an empty black frame.
 *
 * Sized by HEIGHT, not width: reels are vertical clips, so the frame is as
 * tall as the viewport comfortably allows and its width follows.
 */
export function ReelVideo({ src, label, image }: ReelVideoProps) {
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
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
