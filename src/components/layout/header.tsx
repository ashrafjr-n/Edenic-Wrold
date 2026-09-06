import { LogIn } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { dirFor } from "@/lib/format-dict";
import { MainNav } from "./main-nav";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/types/locale";

/** A solid white bar spanning the full width. The logo is pinned to the far
    left and the chrome to the far right — no `max-w` container, because that
    pulled both toward the middle of the page and left the bar looking empty at
    the edges. Only the nav is centred. */
export function Header({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <header className="sticky top-0 z-20 bg-[var(--surface)] shadow-[0_6px_20px_-16px_rgb(var(--shadow-hue)/45%)]">
      <div className="flex flex-col items-center gap-4 px-5 py-4 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-10">
        <div className="flex w-full items-center justify-between gap-4 lg:w-auto lg:justify-start">
          <Logo className="h-12 sm:h-14" />

          {/* On a phone the chrome shares the logo's row and the nav drops
              below it; from `lg` all three tracks sit on one line. */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <HeaderChrome dict={dict} locale={locale} />
          </div>
        </div>

        <div className="order-last lg:order-none">
          <MainNav dict={dict} />
        </div>

        <div className="hidden items-center justify-end gap-3 lg:flex">
          <HeaderChrome dict={dict} locale={locale} />
        </div>
      </div>
    </header>
  );
}

/* Dark mode (`ThemeToggle`) and the language switcher are the two real
   controls in this row. "Join Edenic World" is still presentation only —
   there is no profile to show until someone joins. */
function HeaderChrome({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <>
      <LanguageSwitcher dict={dict} locale={locale} />

      <ThemeToggle />

      {/* The brand blue. It doubles as the profile entry point: there's no
          profile to show until someone has joined. */}
      <Button3D
        tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
        className="h-11 shrink-0 whitespace-nowrap px-4 text-sm sm:px-6 sm:text-base"
      >
        <LogIn className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
        <span dir={dirFor(locale)} className="hidden sm:inline">{dict.header.joinFull}</span>
        <span className="sm:hidden">{dict.header.join}</span>
      </Button3D>
    </>
  );
}
