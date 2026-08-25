import Image from "next/image";
import { Languages, LogIn } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-ink)]/5 bg-gradient-to-b from-[var(--background)] to-white backdrop-blur-sm">
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
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/10 bg-white text-[var(--color-ink)] shadow-[0_3px_0_0_#e4e0f2] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#e4e0f2] active:translate-y-0.5 active:shadow-[0_0px_0_0_#e4e0f2]"
          >
            <Languages className="h-5 w-5" strokeWidth={2.25} />
          </button>

          <button type="button" className="join-btn">
            <span className="join-btn__glass backdrop-blur-md">
              <LogIn className="h-4 w-4" strokeWidth={2.5} />
              Join Edenic World
            </span>
            <span className="join-btn__blob" aria-hidden />
            <span className="join-btn__blob" aria-hidden />
            <span className="join-btn__blob" aria-hidden />
            <span className="join-btn__blob" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
