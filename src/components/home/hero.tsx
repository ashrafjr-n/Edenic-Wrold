import Image from "next/image";
import { characters } from "@/data/characters";
import { CharacterCard } from "./character-card";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-8 sm:pt-20">
      <Image
        src="/assets/icons/gold-star.png"
        alt=""
        width={64}
        height={64}
        aria-hidden
        className="pointer-events-none absolute left-6 top-8 h-8 w-8 rotate-[-12deg] opacity-70 sm:left-16 sm:h-12 sm:w-12"
      />
      <Image
        src="/assets/icons/pink-star.png"
        alt=""
        width={64}
        height={64}
        aria-hidden
        className="pointer-events-none absolute right-8 top-4 h-6 w-6 rotate-[10deg] opacity-60 sm:right-20 sm:h-10 sm:w-10"
      />
      <Image
        src="/assets/icons/blue-star.png"
        alt=""
        width={64}
        height={64}
        aria-hidden
        className="pointer-events-none absolute left-10 bottom-4 hidden h-9 w-9 rotate-[8deg] opacity-60 sm:block"
      />
      <Image
        src="/assets/icons/yellow-star.png"
        alt=""
        width={64}
        height={64}
        aria-hidden
        className="pointer-events-none absolute right-10 bottom-0 hidden h-7 w-7 rotate-[-6deg] opacity-60 md:block"
      />

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
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </section>
  );
}
