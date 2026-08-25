import Image from "next/image";
import { Languages, LogIn } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-ink)]/5 bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
        <Image
          src="/logo/edenic-logo.png"
          alt="Edenic World"
          width={622}
          height={401}
          priority
          className="h-12 w-auto sm:h-14"
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Change language"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] shadow-sm transition-transform hover:scale-105 hover:border-[var(--color-nova)]/40"
          >
            <Languages className="h-5 w-5" strokeWidth={2.25} />
          </button>

          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-pinki)] to-[var(--color-nova)] px-5 text-sm font-semibold text-white shadow-md shadow-[var(--color-pinki)]/25 transition-transform hover:scale-105 sm:text-base"
          >
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            Join Edenic World
          </button>
        </div>
      </div>
    </header>
  );
}
