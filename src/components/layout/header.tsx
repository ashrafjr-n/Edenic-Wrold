import Image from "next/image";
import Link from "next/link";
import { Languages, LogIn, Moon } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { MainNav } from "./main-nav";

/** Fully transparent, in normal flow — the glass/blur island was tried and
    rejected. Every piece of chrome in here is its own white or purple pill, so
    it stays legible on the lavender ground and on the hero image alike. */
export function Header() {
  return (
    <header className="sticky top-0 z-20">
      {/* Three tracks with equal outer columns, so the nav is centred on the
          page rather than on whatever is left over between logo and chrome. */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        <div className="flex w-full items-center justify-between lg:w-auto lg:justify-start">
          <Link href="/" aria-label="Edenic World home">
            <Image
              src="/edenic-logo.png"
              alt="Edenic World"
              width={622}
              height={401}
              preload
              className="h-12 w-auto shrink-0 sm:h-14"
            />
          </Link>

          {/* On a phone the chrome shares the logo's row and the nav drops
              below it; from `lg` all three tracks sit on one line. */}
          <div className="flex items-center gap-2 lg:hidden">
            <HeaderChrome />
          </div>
        </div>

        <div className="order-last lg:order-none">
          <MainNav />
        </div>

        <div className="hidden items-center justify-end gap-2 lg:flex lg:gap-3">
          <HeaderChrome />
        </div>
      </div>
    </header>
  );
}

/* Language and theme are white chips — the same material as a card, just small.
   Colorless on purpose, so neither competes with the purple CTA beside them.
   Both are still presentation only; nothing is wired up yet. */
function HeaderChrome() {
  return (
    <>
      <Button3D
        tone={{ face: "var(--surface)", text: "var(--color-ink)" }}
        variant="calm"
        aria-label="Change language"
        className="h-11 w-11 shrink-0"
      >
        <Languages className="h-5 w-5" strokeWidth={2.25} />
      </Button3D>

      <Button3D
        tone={{ face: "var(--surface)", text: "var(--color-ink)" }}
        variant="calm"
        aria-label="Switch to dark mode"
        className="h-11 w-11 shrink-0"
      >
        <Moon className="h-5 w-5" strokeWidth={2.25} />
      </Button3D>

      {/* The hero purple, and the only colored element in the header. It doubles
          as the profile entry point: there's no profile to show until someone
          has joined. */}
      <Button3D
        tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
        className="h-11 shrink-0 whitespace-nowrap px-4 text-sm sm:px-6 sm:text-base"
      >
        <LogIn className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
        <span className="hidden sm:inline">Join Edenic World</span>
        <span className="sm:hidden">Join</span>
      </Button3D>
    </>
  );
}
