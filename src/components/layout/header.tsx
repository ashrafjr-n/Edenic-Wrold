import Image from "next/image";
import { Languages, LogIn } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
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
    </header>
  );
}
