"use client";

import { useParams } from "next/navigation";
import { ClassroomBackdrop } from "@/components/learn/classroom/classroom-backdrop";
import { CLASSROOMS } from "@/data/classroom";
import type { CharacterId } from "@/types/character";

/** Behind the loader: the friend's classroom wall (the room never blinks
    out between their course page and the lesson). A loading file gets no
    params — the URL tells; a URL that names no friend shows none. */
export function LoadingRoom() {
  const { character } = useParams<{ character: string }>();
  const room = CLASSROOMS[character as CharacterId];
  if (!room) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh">
      <ClassroomBackdrop wall={room.wall} desk={room.desk} still />
    </div>
  );
}
