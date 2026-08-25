import Image from "next/image";
import { Languages, LogIn } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

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
          <Button3D
            tone={{ face: "#ffffff", edge: "#e0dced", text: "var(--color-ink)" }}
            aria-label="Change language"
            className="h-11 w-11 shrink-0"
          >
            <Languages className="h-5 w-5" strokeWidth={2.25} />
          </Button3D>

          <Button3D
            tone={{ face: "var(--color-pinki)", edge: "#7d4aa8" }}
            brand
            className="h-11 px-4 text-sm sm:px-5 sm:text-base"
          >
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            Join Edenic World
          </Button3D>
        </div>
      </div>
    </header>
  );
}
