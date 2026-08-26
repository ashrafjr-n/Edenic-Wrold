import Image from "next/image";
import { Languages, LogIn } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

export function Header() {
  return (
    <header className="sticky top-0 z-20">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-8 lg:px-12">
        <Image
          src="/edenic-logo.png"
          alt="Edenic World"
          width={622}
          height={401}
          priority
          className="h-12 w-auto shrink-0 sm:h-16"
        />

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Neumorphic: the same color as the page, pressed out of it. Giving
              this a white face would break the illusion — the surface and the
              ground have to match. */}
          <Button3D
            tone={{ face: "var(--background)", text: "var(--color-ink)" }}
            variant="calm"
            aria-label="Change language"
            className="h-11 w-11 shrink-0"
          >
            <Languages className="h-5 w-5" strokeWidth={2.25} />
          </Button3D>

          {/* The one colored element up here, so it's clay rather than
              neumorphic — a neumorphic primary CTA is invisible by design. */}
          <Button3D
            tone={{ face: "var(--color-ink)", edge: "#1d0f3d" }}
            className="h-11 shrink-0 whitespace-nowrap px-5 text-sm sm:px-6 sm:text-base"
          >
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            Join Edenic World
          </Button3D>
        </div>
      </div>
    </header>
  );
}
