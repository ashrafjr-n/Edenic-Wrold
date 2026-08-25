import { characters } from "@/data/characters";
import { CharacterCard } from "./character-card";
import { IntroIcons } from "./intro-icons";

export function Hero() {
  return (
    <section className="bg-hero-gradient relative overflow-hidden px-4 pb-20 pt-8 sm:px-8 sm:pt-12">
      <IntroIcons />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1
          className="anim-drop-in text-4xl font-semibold leading-tight text-[var(--color-ink)] sm:text-5xl"
          style={{ animationDelay: "0.15s" }}
        >
          Learn.{" "}
          <span className="bg-gradient-to-r from-[var(--color-pinki)] via-[var(--color-bloo)] to-[var(--color-nova)] bg-clip-text text-transparent">
            Play. Grow.
          </span>
        </h1>
        <p
          className="anim-drop-in mx-auto mt-4 max-w-xl text-lg text-[var(--color-ink)]/60 sm:text-xl"
          style={{ animationDelay: "0.35s" }}
        >
          Pick a friend and start your learning adventure!
        </p>
      </div>

      <div className="relative mx-auto mt-2 max-w-6xl sm:-mt-2">
        <div
          className="absolute inset-x-0 bottom-4 z-0 mx-auto hidden h-8 w-[60%] max-w-xl rounded-[50%] bg-[var(--color-ink)]/10 blur-md sm:block sm:h-10"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col items-center gap-10 sm:flex-row sm:items-end sm:justify-center sm:gap-16">
          {characters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index}
              previousName={character.locked ? characters[index - 1]?.name : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
