import Image from "next/image";
import { characters } from "@/data/characters";
import { CharacterCard, type ArchPosition } from "./character-card";

const stars = [
  { src: "gold-star", className: "left-6 top-4 sm:left-16 rotate-[-10deg]" },
  { src: "pink-star", className: "right-8 top-2 sm:right-20 rotate-[8deg]" },
];

const positions: ArchPosition[] = ["left", "middle", "right"];

function dotGrid(color: string) {
  return {
    backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`,
    backgroundSize: "16px 16px",
  };
}

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
          className={`pointer-events-none absolute z-10 h-6 w-6 opacity-45 sm:h-7 sm:w-7 ${star.className}`}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-3xl text-center">
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

      <div className="relative mx-auto mt-10 max-w-6xl">
        <div
          className="pointer-events-none absolute -left-2 top-10 hidden h-24 w-24 opacity-50 sm:block"
          style={dotGrid("var(--color-pinki)")}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-2 bottom-16 hidden h-24 w-24 opacity-50 sm:block"
          style={dotGrid("var(--color-nova)")}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute right-6 top-24 hidden h-6 w-6 rounded-full border-[3px] border-[var(--color-gold)] opacity-70 md:block"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute left-10 bottom-24 hidden h-3 w-3 rounded-full bg-[var(--color-nova)]/50 md:block"
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-center">
          {characters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              position={positions[index]}
              previousName={character.locked ? characters[index - 1]?.name : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
