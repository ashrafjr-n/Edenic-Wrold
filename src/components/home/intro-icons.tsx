import type { CSSProperties } from "react";
import Image from "next/image";

interface IntroIcon {
  src: string;
  /** Intrinsic file dimensions, used to keep the aspect ratio exact. */
  natural: [number, number];
  height: number;
  left: string;
  delay: number;
  drift: string;
  spin: string;
}

type IconVars = CSSProperties & { "--drift"?: string; "--spin"?: string };

/** Delays are deliberately non-sequential so they climb as a scattered
    trail rather than one left-to-right wave. */
const introIcons: IntroIcon[] = [
  { src: "A", natural: [475, 525], height: 58, left: "4%", delay: 0, drift: "20px", spin: "26deg" },
  { src: "cat", natural: [415, 601], height: 72, left: "11%", delay: 0.42, drift: "-16px", spin: "-24deg" },
  { src: "ball", natural: [501, 498], height: 54, left: "19%", delay: 0.14, drift: "18px", spin: "38deg" },
  { src: "123", natural: [700, 700], height: 76, left: "27%", delay: 0.58, drift: "-22px", spin: "-30deg" },
  { src: "rabbit", natural: [414, 602], height: 70, left: "35%", delay: 0.24, drift: "14px", spin: "22deg" },
  { src: "cloud", natural: [660, 378], height: 46, left: "43%", delay: 0.66, drift: "24px", spin: "18deg" },
  { src: "B", natural: [444, 562], height: 58, left: "50%", delay: 0.08, drift: "-18px", spin: "-34deg" },
  { src: "car-toy", natural: [575, 434], height: 54, left: "57%", delay: 0.5, drift: "20px", spin: "28deg" },
  { src: "giraffe", natural: [327, 762], height: 82, left: "65%", delay: 0.19, drift: "-14px", spin: "-20deg" },
  { src: "apple", natural: [469, 532], height: 56, left: "72%", delay: 0.62, drift: "16px", spin: "32deg" },
  { src: "dog", natural: [467, 534], height: 66, left: "79%", delay: 0.31, drift: "-20px", spin: "-26deg" },
  { src: "C", natural: [444, 562], height: 56, left: "86%", delay: 0.11, drift: "22px", spin: "36deg" },
  { src: "blue-ball", natural: [496, 503], height: 50, left: "92%", delay: 0.54, drift: "-15px", spin: "-22deg" },
  { src: "yellow-star", natural: [322, 324], height: 44, left: "97%", delay: 0.27, drift: "18px", spin: "40deg" },
];

export function IntroIcons() {
  return (
    <div
      className="intro-icons pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {introIcons.map((icon) => {
        const width = Math.round((icon.height * icon.natural[0]) / icon.natural[1]);

        return (
          <Image
            key={icon.src}
            src={`/assets/icons/${icon.src}.png`}
            alt=""
            width={width}
            height={icon.height}
            className="anim-icon-rise absolute w-auto"
            style={
              {
                left: icon.left,
                bottom: "-160px",
                height: icon.height,
                animationDelay: `${icon.delay}s`,
                "--drift": icon.drift,
                "--spin": icon.spin,
              } as IconVars
            }
          />
        );
      })}
    </div>
  );
}
