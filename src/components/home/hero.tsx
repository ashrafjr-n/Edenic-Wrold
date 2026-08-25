import { characters } from "@/data/characters";
import { CharacterCard } from "./character-card";
import { IntroIcons } from "./intro-icons";

export function Hero() {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden px-4 pb-20 pt-2 sm:px-8 sm:pb-28 sm:pt-4">
      <IntroIcons />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1
          className="anim-drop-in text-4xl font-bold leading-tight tracking-tight text-[var(--color-ink)] sm:text-6xl"
          style={{ animationDelay: "0.15s" }}
        >
          Learn. <span className="text-[var(--color-head-play)]">Play.</span>{" "}
          <span className="text-[var(--color-head-grow)]">Grow.</span>
        </h1>
        <p
          className="anim-drop-in mx-auto mt-3 max-w-xl text-lg text-[var(--color-ink)]/60 sm:text-xl"
          style={{ animationDelay: "0.35s" }}
        >
          Pick a friend and start your learning adventure!
        </p>
      </div>

      {/* mt-auto pins the cast to the bottom of the viewport, so the hero has
          no dead space under it regardless of screen height. */}
      <div className="relative z-10 mx-auto mt-auto w-full max-w-6xl pt-8">
        <div className="flex flex-col items-center gap-12 sm:flex-row sm:items-end sm:justify-center sm:gap-6 lg:gap-10">
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
