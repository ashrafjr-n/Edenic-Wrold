"use client";

import { useParams } from "next/navigation";
import { ClassroomBackdrop } from "@/components/learn/classroom/classroom-backdrop";

/** Behind the loader: Pinki's classroom wall for her lessons (the room
    never blinks out between her course page and the lesson), nothing for
    the others. A loading file gets no params — the URL tells. */
export function LoadingRoom() {
  const { character } = useParams<{ character: string }>();
  if (character !== "pinki") return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh">
      <ClassroomBackdrop zoomed />
    </div>
  );
}
