"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayStars, type PlayGame } from "@/store/progress";

/**
 * A star-locked game's pages (its route's layout): opened with two stars on
 * `/play` (`PlayLock`), or the child is sent back there — a bookmark or a
 * typed URL never skips the lock. Waits for the store to read localStorage
 * before judging, so an opened game never bounces.
 */
export function PlayGate({ game, children }: { game: PlayGame; children: ReactNode }) {
  const { hydrated, opened } = usePlayStars();
  const router = useRouter();
  const shut = hydrated && !opened.includes(game);

  useEffect(() => {
    if (shut) router.replace("/play");
  }, [shut, router]);

  return shut ? null : children;
}
