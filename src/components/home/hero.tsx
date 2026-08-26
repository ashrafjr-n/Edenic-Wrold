import { characters } from "@/data/characters";
import { CharacterCard } from "./character-card";
import { IntroIcons } from "./intro-icons";
import { StageBackdrop } from "./stage-backdrop";

/** Which character gates each locked one. `characters` is static, so this is
    resolved once at module load rather than on every render. */
const cast = characters.map((character, index) => ({
  character,
  index,
  previousName: character.locked ? characters[index - 1]?.name : undefined,
}));

/** Each word is nudged off true by a degree or two. Straight type reads as a
    document; a little rotation reads as handmade, which is the register this
    audience responds to. */
const headingTilt = ["-2.5deg", "1.5deg", "-1deg"];

export function Hero() {
  return (
    <section className="hero-stage relative flex flex-1 flex-col overflow-hidden">
      <StageBackdrop />
      <IntroIcons />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-4 text-center sm:pt-8">
        <h1
          className="anim-drop-in text-5xl font-bold leading-[0.95] tracking-tight text-[var(--color-ink)] sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "0.15s" }}
        >
          <span className="inline-block" style={{ rotate: headingTilt[0] }}>
            Learn.
          </span>{" "}
          <span
            className="inline-block text-[var(--color-head-play)]"
            style={{ rotate: headingTilt[1] }}
          >
            Play.
          </span>{" "}
          <span
            className="inline-block text-[var(--color-head-grow)]"
            style={{ rotate: headingTilt[2] }}
          >
            Grow.
          </span>
        </h1>

        {/* A hand-drawn-feeling gold swoosh under the headline — the signature
            color showing up where the eye already is. */}
        <div
          className="anim-fade-up mx-auto mt-3 h-2 w-40 -rotate-1 rounded-full bg-[var(--color-gold)]/70 sm:mt-4 sm:w-56"
          style={{ animationDelay: "0.3s" }}
          aria-hidden
        />

        <p
          className="anim-drop-in mx-auto mt-4 max-w-xl text-lg font-medium text-[var(--color-ink)]/60 sm:text-xl"
          style={{ animationDelay: "0.35s" }}
        >
          Pick a friend and start your learning adventure!
        </p>
      </div>

      {/* The three worlds fill everything below the headline — on desktop they
          stand side by side and share the width, on touch they stack. */}
      <div className="relative z-10 mt-8 flex flex-1 flex-col items-stretch gap-6 px-3 pb-4 sm:mt-10 sm:flex-row sm:gap-4 sm:px-5 sm:pb-6 lg:gap-6 lg:px-8">
        {cast.map(({ character, index, previousName }) => (
          <CharacterCard
            key={character.id}
            character={character}
            index={index}
            previousName={previousName}
          />
        ))}
      </div>
    </section>
  );
}
