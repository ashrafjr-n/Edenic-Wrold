import { Hero } from "@/components/home/hero";
import { HeroScrollCue } from "@/components/home/hero-scroll-cue";
import { FriendsSection } from "@/components/home/friends-section";
import { PathsSection } from "@/components/home/paths-section";
import { Footer } from "@/components/layout/footer";
import { DarkScope } from "@/components/ui/dark-scope";

export default function Home() {
  return (
    <DarkScope>
      {/* `bg-[var(--background)]` is explicit rather than inherited from
          `body` — `body` sits OUTSIDE `DarkScope`, so its own background
          never sees the dark override. Painting it here instead means the
          ground actually goes dark under `DarkScope`, and is a no-op in
          light mode (same token, same value, already inherited). */}
      <main className="flex flex-1 flex-col bg-[var(--background)]">
        <Hero />
        <HeroScrollCue />
        <FriendsSection />
        <PathsSection />
      </main>
      <Footer />
    </DarkScope>
  );
}
