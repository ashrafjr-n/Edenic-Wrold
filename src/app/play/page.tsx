import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { LabWorld } from "@/components/activities/lab/lab-world";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { Button3D } from "@/components/ui/button-3d";
import { CHEST_OPEN } from "@/data/chest-open";
import { LAB_STAGES } from "@/data/lab";
import { LAB_STOPS } from "@/data/lab-stops";
import { dirFor, format } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "The Sleeping Lab — Edenic World",
  description: "Wake up the Edenic Laboratory with Pinki, Nova and Bloo, one cookie at a time.",
};

/**
 * Play = **the Sleeping Lab** (`edenic-plan.md`, 2026-11-15): the Edenic Laboratory of
 * episode 2, rendered in 3D (`render.cjs stops lab`), five stages on the cookies of its
 * path and its door the last stop, played by the Learn course pages' own `CourseWorld`
 * (progress `play.lab.<n>`). The free games sit behind the "Games" chip.
 */
export default async function PlayPage() {
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const words = dict.lab;

  /* A cookie with no stage (or a stage with no cookie) would put every link in the
     wrong place; say so while building. The last stop is the door. */
  if (process.env.NODE_ENV !== "production" && LAB_STOPS.landscape.keys[0].length !== LAB_STAGES.length + 1) {
    throw new Error(`lab: the world has ${LAB_STOPS.landscape.keys[0].length} stops, the lab ${LAB_STAGES.length} stages and a door`);
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
      <LabWorld
        world={{ ...LAB_STOPS, chest: CHEST_OPEN.lab }}
        titles={LAB_STAGES.map((value) => format(words.stageLabel, { value }))}
        basePath="/play/lab"
        dict={{ ...dict.lessonPicker, startLessonAria: words.startStageAria, lockedLessonAria: words.lockedStageAria, openChest: words.doorAria }}
        dir={dir}
        welcome={[words.welcome1, words.welcome2]}
        skipLabel={words.skip}
      />
    </main>
  );
}
