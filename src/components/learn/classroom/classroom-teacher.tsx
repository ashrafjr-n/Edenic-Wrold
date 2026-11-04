"use client";

import { useState, ViewTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import { useUpNext, type UpNextCourse } from "@/components/learn/up-next";

interface ClassroomTeacherProps {
  characterId: string;
  /** The friend at the board, and celebrating (`CLASSROOMS[id]`). */
  teacher: StaticImageData;
  cheer: StaticImageData;
  /** Their courses — once every lesson in them is learned, they celebrate. */
  courses: readonly Pick<UpNextCourse, "id" | "titles">[];
  /** The friend's name, for their button (tap: they jump). */
  label: string;
}

/**
 * The friend beside their board, their stick raised to it (their own pose;
 * it does not move — direct request), and jumping when tapped; they say
 * nothing. When every lesson is learned they celebrate instead.
 *
 * Mounted once for the hub and its course pages (`ClassroomShell`): going
 * in to a course they step out of the picture on a wide screen and come a
 * little closer on a phone (`.class-page--course`), their view transition
 * animating that `update` — the same friend, never gone and back.
 */
export function ClassroomTeacher({ characterId, teacher, cheer, courses, label }: ClassroomTeacherProps) {
  const allDone = useUpNext(characterId, courses) === null;
  const [jumps, setJumps] = useState(0);
  return (
    <ViewTransition name="class-teacher" update="board-morph" default="none">
      <div className="class-teacher">
        <button type="button" aria-label={label} className="class-teacher-body" onClick={() => setJumps((n) => n + 1)}>
          <span key={jumps} className={`block ${jumps ? "anim-jump" : ""}`}>
            <Image
              src={allDone ? cheer : teacher}
              alt=""
              preload
              sizes="(min-width: 1024px) 340px, 48vw"
              className="anim-breathe h-auto w-full"
            />
          </span>
        </button>
      </div>
    </ViewTransition>
  );
}
