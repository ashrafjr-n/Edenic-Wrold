import Image from "next/image";
import { Languages, LogIn } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

/* A floating glass island rather than a bar bolted across the top: the worlds
   behind it run full-bleed to the edge of the screen, and a solid strip would
   cut their tops off. */
export function Header() {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="header-ring mx-auto max-w-6xl rounded-full p-[2px] shadow-[0_10px_30px_-14px_rgba(59,36,101,0.45)]">
        <div className="flex items-center justify-between gap-3 rounded-full bg-[var(--background)]/85 py-2 pl-5 pr-2 backdrop-blur-xl sm:py-2.5 sm:pl-7 sm:pr-3">
          <Image
            src="/edenic-logo.png"
            alt="Edenic World"
            width={622}
            height={401}
            priority
            className="h-10 w-auto sm:h-12"
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <Button3D
              tone={{
                face: "#ffffff",
                edge: "var(--color-locked-dark)",
                text: "var(--color-ink)",
              }}
              variant="calm"
              aria-label="Change language"
              className="h-11 w-11 shrink-0"
            >
              <Languages className="h-5 w-5" strokeWidth={2.25} />
            </Button3D>

            <Button3D
              tone={{ face: "var(--color-ink)", edge: "#241246" }}
              variant="calm"
              className="h-11 px-5 text-sm sm:px-6 sm:text-base"
            >
              <LogIn className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              Join Edenic World
            </Button3D>
          </div>
        </div>
      </div>
    </header>
  );
}
