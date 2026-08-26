import Image from "next/image";
import { Languages, LogIn } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

export function Header() {
  return (
    {/* Translucent cream rather than an opaque white slab: the stage behind
        it is colored, and letting it show through faintly keeps the header
        part of the page instead of a bar bolted on top of it. */}
    <header className="sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 sm:px-8 lg:px-12">
        <Image
          src="/edenic-logo.png"
          alt="Edenic World"
          width={622}
          height={401}
          priority
          className="h-12 w-auto sm:h-14"
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <Button3D
            tone={{ face: "#ffffff", text: "var(--color-ink)" }}
            variant="calm"
            aria-label="Change language"
            className="h-11 w-11 shrink-0"
          >
            <Languages className="h-5 w-5" strokeWidth={2.25} />
          </Button3D>

          <Button3D
            tone={{ face: "var(--color-ink)" }}
            variant="calm"
            className="h-11 px-5 text-sm sm:px-6 sm:text-base"
          >
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            Join Edenic World
          </Button3D>
        </div>
      </div>

      <div className="header-thread" aria-hidden />
    </header>
  );
}
