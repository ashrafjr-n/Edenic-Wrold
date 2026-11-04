import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";

interface WorldDoneProps {
  /** "Lesson complete!" */
  title: string;
  /** "You learned the word circle!" */
  line: string;
  /** The friend celebrating (`CLASSROOMS[id].cheer`). */
  cheer: StaticImageData;
  dir: "rtl" | "ltr";
}

/**
 * The end of a lesson with a world (2026-11-04, on request: "in the same
 * world, simpler — just her picture celebrating, a way on, and short
 * sentences in the site's clay"): the friend hopping, the two lines on a
 * white clay card, one burst. The world stays, blurred, behind it; the
 * way on is the player's button.
 */
export function WorldDone({ title, line, cheer, dir }: WorldDoneProps) {
  return (
    <div className="world-done">
      <Image src={cheer} alt="" sizes="(min-width: 1024px) 20rem, 15rem" preload className="done-hop world-done-friend" />
      <div dir={dir} className="card card-clay-white world-done-card">
        <p className="world-done-title">{title}</p>
        <p className="world-done-line">{line}</p>
      </div>
      <Celebration />
    </div>
  );
}
