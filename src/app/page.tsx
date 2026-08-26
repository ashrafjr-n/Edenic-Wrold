import { Hero } from "@/components/home/hero";
import { FriendsSection } from "@/components/home/friends-section";
import { PathsSection } from "@/components/home/paths-section";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <Hero />
        <FriendsSection />
        <PathsSection />
      </main>
      <Footer />
    </>
  );
}
