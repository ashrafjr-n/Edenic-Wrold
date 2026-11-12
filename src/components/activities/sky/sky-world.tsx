"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { CourseWorld } from "@/components/learn/course-world";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import type { SkyWorld } from "@/data/sky-levels";
import { format } from "@/lib/format-dict";
import { chestStarKey, useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";

interface SkyWorldViewProps extends Omit<ComponentProps<typeof CourseWorld>, "gate"> {
  skyWorld: SkyWorld;
  words: Dictionary["sky"];
  learnWith: string;
}

/**
 * A Sky Trail world on `/play` (2026-11-12): its world of stops (`CourseWorld`),
 * the last stop the house of the friend who ends it. **The door is shut until
 * the friend's stars are in hand** — one from each of their Learn courses'
 * chests, counted from the real course list, never a hard-coded two — and
 * shows how many there are and the way to Learn. With them, it opens as a
 * chest does once every level is done.
 */
export function SkyWorldView({ skyWorld, words, learnWith, dir, ...world }: SkyWorldViewProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const friend = characters.find((c) => c.id === skyWorld.door);
  const courses = lessonsByCharacter[skyWorld.door];
  const total = courses.length;
  /* Nothing until the store is read: the server's view and the first paint agree. */
  const have = hydrated ? courses.filter((course) => items[chestStarKey(skyWorld.door, course.id)]).length : 0;
  const name = friend?.name ?? "";

  const gate =
    have < total ? (
      <div dir={dir} className="sky-gate" role="group" aria-label={format(words.gateAria, { name, n: have, total })}>
        <span className="sky-gate-count" aria-hidden>
          {courses.map((course, i) => (
            <Star key={course.id} className={i < have ? "fill-current text-[var(--color-gold)]" : "text-[rgb(var(--shadow-hue)/0.35)]"} strokeWidth={2.25} />
          ))}
          <span>{format(words.gateCount, { n: have, total })}</span>
        </span>
        {/* Never a dead end: the stars are earned in the friend's own lessons. */}
        <Link href={`/learn/${skyWorld.door}`} className="sky-gate-learn">
          <BookOpen strokeWidth={2.5} aria-hidden />
          <span>{format(learnWith, { name })}</span>
        </Link>
      </div>
    ) : undefined;

  return <CourseWorld {...world} dir={dir} gate={gate} />;
}
