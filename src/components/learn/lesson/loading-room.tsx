"use client";

import { useParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";
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
    <div className="pointer-events-none absolute inset-0">
      <ClassroomBackdrop wall={room.wall} desk={room.desk} still />
    </div>
  );
}

/** A lesson on its way, over the whole screen under the header and the back
    row: the friend's wall, the loader in the middle. The route's
    `loading.tsx` and the lesson's opening reel (`ReelVideo` `cover`) show
    the same one, so the two read as one wait. */
export function LoadingCover({ label }: { label: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[15] flex h-lvh items-center justify-center bg-[var(--background)]">
      <LoadingRoom />
      {/* Bigger than in a frame: alone on the whole screen. */}
      <span className="relative scale-125 sm:scale-150">
        <Loader label={label} />
      </span>
    </div>
  );
}
