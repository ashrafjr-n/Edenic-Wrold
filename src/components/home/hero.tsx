import Image from "next/image";
import { characters } from "@/data/characters";
import { CharacterCard } from "./character-card";

const stars = [
  { src: "gold-star", className: "left-6 top-10 sm:left-16 rotate-[-10deg]" },
  { src: "pink-star", className: "right-8 top-6 sm:right-20 rotate-[8deg]" },
  { src: "blue-star", className: "left-12 bottom-6 hidden sm:block rotate-[6deg]" },
  { src: "yellow-star", className: "right-14 bottom-2 hidden md:block rotate-[-8deg]" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-8 sm:pt-20">
      {stars.map((star) => (
        <Image
          key={star.src}
          src={`/assets/icons/${star.src}.png`}
          alt=""
          width={64}
          height={64}
          aria-hidden
          className={`pointer-events-none absolute h-6 w-6 opacity-45 sm:h-7 sm:w-7 ${star.className}`}
        />
      ))}

      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold leading-tight text-[var(--color-ink)] sm:text-5xl">
          Learn With Your{" "}
          <span className="bg-gradient-to-r from-[var(--color-pinki)] via-[var(--color-bloo)] to-[var(--color-nova)] bg-clip-text text-transparent">
            Edenic Friends
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-ink)]/60 sm:text-xl">
          Pick a friend and start your learning adventure!
        </p>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:items-stretch sm:justify-center sm:gap-6">
        {characters.map((character, index) => (
          <CharacterCard
            key={character.id}
            character={character}
            previousName={character.locked ? characters[index - 1]?.name : undefined}
          />
        ))}
      </div>
    </section>
  );
}
