import Image from "next/image";

interface DecorShape {
  src: string;
  /** Intrinsic file dimensions, kept exact so the aspect ratio never skews. */
  natural: [number, number];
  size: string;
  position: string;
  opacity: string;
}

/** Small accents, pinned to the outer edges only — the centre of the stage
    stays empty so nothing competes with the three characters. */
const shapes: DecorShape[] = [
  {
    src: "ball-background",
    natural: [226, 210],
    size: "w-[clamp(14px,1.8vw,24px)]",
    position: "left-[6%] top-[26%]",
    opacity: "opacity-70",
  },
  {
    src: "star-background",
    natural: [242, 234],
    size: "w-[clamp(18px,2.4vw,32px)]",
    position: "right-[7%] top-[18%]",
    opacity: "opacity-75",
  },
  {
    src: "ball2-background",
    natural: [218, 210],
    size: "w-[clamp(12px,1.6vw,20px)]",
    position: "right-[13%] top-[38%]",
    opacity: "opacity-60",
  },
];

export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="dot-grid absolute left-[3%] top-[24%] h-24 w-24 text-[var(--color-pinki)]/25 sm:h-32 sm:w-32" />
      <div className="dot-grid absolute bottom-[16%] right-[4%] h-24 w-24 text-[var(--color-bloo)]/25 sm:h-32 sm:w-32" />

      {shapes.map((shape) => (
        <Image
          key={shape.src}
          src={`/assets/background/${shape.src}.png`}
          alt=""
          width={shape.natural[0]}
          height={shape.natural[1]}
          className={`absolute h-auto ${shape.size} ${shape.position} ${shape.opacity}`}
        />
      ))}
    </div>
  );
}
