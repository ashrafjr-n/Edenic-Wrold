import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";

interface CourseArtProps {
  /** Up to four things; the first stands in front. */
  images: readonly StaticImageData[];
  /** The painted width of the whole pile, for the images' `sizes`. */
  width: number;
  className?: string;
}

/* Where each thing sits, as a share of the box: centre x/y, width, tilt,
   and when its float starts — staggered so the pile never bobs in step. */
const SLOTS = [
  { x: 34, y: 56, w: 40, r: -8, z: 4, d: 0 },
  { x: 69, y: 56, w: 36, r: 9, z: 3, d: 0.9 },
  { x: 56, y: 26, w: 32, r: -5, z: 2, d: 1.8 },
  { x: 17, y: 27, w: 29, r: 12, z: 1, d: 2.7 },
] as const;

/**
 * A course's things piled together — the clay objects its lessons are
 * about (ball, toast, cheese, book), each tilted and gently floating. What
 * a course card and a course banner show instead of a picture of Pinki.
 */
export function CourseArt({ images, width, className = "" }: CourseArtProps) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      {images.slice(0, SLOTS.length).map((src, i) => {
        const slot = SLOTS[i];
        return (
          <span
            key={src.src}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.w}%`,
              zIndex: slot.z,
              rotate: `${slot.r}deg`,
            } as CSSProperties}
          >
            <Image
              src={src}
              alt=""
              sizes={`${Math.round((width * slot.w) / 100)}px`}
              className="course-art-thing anim-breathe h-auto w-full"
              style={{ animationDelay: `${slot.d}s` }}
            />
          </span>
        );
      })}
    </div>
  );
}
