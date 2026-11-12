import type { Metadata } from "next";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { SkyWorldView } from "@/components/activities/sky/sky-world";
import { WorldIntro } from "@/components/activities/sky/world-intro";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { Button3D } from "@/components/ui/button-3d";
import { CHEST_OPEN } from "@/data/chest-open";
import { SKY_KEY, SKY_WORLDS } from "@/data/sky-levels";
import { SKY_NIGHT_STOPS } from "@/data/sky-night-stops";
import { dirFor, format } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";
import balloon from "../../../public/assets/play/sky/balloon.png";

export const metadata: Metadata = {
  title: "Sky Trail — Edenic World",
  description: "A star fell out of the night sky. Fly from cloud to cloud to find it, with Pinki, Nova and Bloo.",
};

/**
 * Play = **the Sky Trail** (`edenic-plan.md` "four worlds, one story"). Stage 2
 * (2026-11-12): world 1, night — three level clouds going away from the camera,
 * white stars the way between them turning gold as levels are done, and Pinki's
 * cloud house at the end, its door shut until her two stars are in hand
 * (`SkyWorldView`); beyond it the next world, shut behind cloud. The first visit
 * opens on its entry scene (`WorldIntro`). Played by the Learn course pages'
 * own `CourseWorld`; progress `play.sky.<n>`. The day sky built first
 * (`data/sky-stops.ts`, `CHEST_OPEN.sky`) waits for world 4 (stage 8).
 */
export default async function PlayPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.sky;
  const world = SKY_WORLDS[0];

  /* A cloud with no level (or a level with no cloud) would put every link in the
     wrong place; say so while building. The last stop is the friend's house. */
  if (process.env.NODE_ENV !== "production" && SKY_NIGHT_STOPS.landscape.keys[0].length !== world.levels.length + 1) {
    throw new Error(`sky: the night has ${SKY_NIGHT_STOPS.landscape.keys[0].length} stops, its world ${world.levels.length} levels and a house`);
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip" style={pageAccent("var(--brand)", "var(--brand-dark)", "#fff")}>
      <BackRow href="/discover" label={dict.discover.backToDiscover}>
        <span className="flex items-center gap-2.5 sm:gap-3">
          <WorldIntro
            world={world.id}
            video={{ landscape: "/assets/play/sky/night/intro-landscape.mp4", portrait: "/assets/play/sky/night/intro-portrait.mp4" }}
            skipLabel={words.skip}
            replayLabel={words.replayIntro}
          />
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
        </span>
      </BackRow>
      <h1 className="sr-only">{words.title}</h1>
      <SkyWorldView
        skyWorld={world}
        words={words}
        learnWith={dict.learnPicker.learnWith}
        world={{ ...SKY_NIGHT_STOPS, chest: CHEST_OPEN["sky-night"] }}
        titles={world.levels.map((value) => format(dict.activities.levelLabel, { value }))}
        characterId={SKY_KEY.owner}
        lessonId={SKY_KEY.course}
        basePath="/play/sky"
        dict={{ ...dict.lessonPicker, startLessonAria: words.startLevelAria, lockedLessonAria: words.lockedLevelAria, openChest: format(words.doorAria, { name: "Pinki" }) }}
        dir={dir}
        marker={<Image key="balloon" src={balloon} alt="" sizes="(orientation: landscape) 10vw, 26vw" className="sky-balloon" />}
      />
    </main>
  );
}
