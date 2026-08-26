import { Languages, LogIn, Moon } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Logo } from "@/components/ui/logo";
import { MainNav } from "./main-nav";

/** A solid white bar spanning the full width. The logo is pinned to the far
    left and the chrome to the far right — no `max-w` container, because that
    pulled both toward the middle of the page and left the bar looking empty at
    the edges. Only the nav is centred. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-[var(--surface)] shadow-[0_6px_20px_-16px_rgb(var(--shadow-hue)/45%)]">
      <div className="flex flex-col items-center gap-4 px-5 py-4 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-10">
        <div className="flex w-full items-center justify-between gap-4 lg:w-auto lg:justify-start">
          <Logo className="h-12 sm:h-14" />

          {/* On a phone the chrome shares the logo's row and the nav drops
              below it; from `lg` all three tracks sit on one line. */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <HeaderChrome />
          </div>
        </div>

        <div className="order-last lg:order-none">
          <MainNav />
        </div>

        <div className="hidden items-center justify-end gap-3 lg:flex">
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
