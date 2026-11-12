import type { Metadata } from "next";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { CourseWorld } from "@/components/learn/course-world";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { Button3D } from "@/components/ui/button-3d";
import { CHEST_OPEN } from "@/data/chest-open";
import { SKY_KEY, SKY_LEVELS } from "@/data/sky-levels";
import { SKY_STOPS } from "@/data/sky-stops";
import { dirFor, format } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";
import balloon from "../../../public/assets/play/sky/balloon.png";

export const metadata: Metadata = {
  title: "Sky Trail — Edenic World",
  description: "Fly up the sky from cloud to cloud: short games on every cloud, and Edenic's big star at the end.",
};

/**
 * Play = **the Sky Trail** (2026-11-12, phase 1 of `edenic-plan.md`'s three):
 * a world of stops up in the sky, played by the same `CourseWorld` as a Learn
 * course — a level on each cloud (the first the farthest), white stars the
 * way between them turning gold as levels are done, Edenic's big star the
 * nearest stop, lighting once every level is done (the chest's machinery).
 * The child's balloon hovers by the cloud they are at.
 *
 * Its progress is `play.sky.<n>` in the same store, so nothing here is new
 * machinery; the free games moved to `/play/games` (the chip opposite the
 * back button).
 */
export default async function PlayPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.sky;

  /* A cloud with no level (or a level with no cloud) would put every link in
     the wrong place; say so while building. The last stop is the big star. */
  if (process.env.NODE_ENV !== "production" && SKY_STOPS.landscape.keys[0].length !== SKY_LEVELS.length + 1) {
    throw new Error(`sky: the world has ${SKY_STOPS.landscape.keys[0].length} stops, the trail ${SKY_LEVELS.length} levels and a star`);
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip" style={pageAccent("var(--brand)", "var(--brand-dark)", "#fff")}>
      <BackRow href="/discover" label={dict.discover.backToDiscover}>
        <Button3D
          variant="calm"
          tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
          href="/play/games"
          aria-label={words.gamesAria}
          className="btn3d--clay-white h-12 px-4 text-base sm:h-14 sm:px-5 sm:text-lg"
        >
          <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
          <span dir={dir}>{words.games}</span>
        </Button3D>
      </BackRow>
      <h1 className="sr-only">{words.title}</h1>
      <CourseWorld
        world={{ ...SKY_STOPS, chest: CHEST_OPEN.sky }}
        titles={SKY_LEVELS.map((level) => format(dict.activities.levelLabel, { value: level.value }))}
        characterId={SKY_KEY.owner}
        lessonId={SKY_KEY.course}
        basePath="/play/sky"
        dict={{ ...dict.lessonPicker, startLessonAria: words.startLevelAria, lockedLessonAria: words.lockedLevelAria, openChest: words.starAria }}
        dir={dir}
        marker={<Image key="balloon" src={balloon} alt="" sizes="(orientation: landscape) 10vw, 26vw" className="sky-balloon" />}
      />
    </main>
  );
}
