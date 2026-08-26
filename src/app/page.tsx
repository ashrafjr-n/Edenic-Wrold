import { Hero } from "@/components/home/hero";
import { FriendsSection } from "@/components/home/friends-section";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <FriendsSection />
    </main>
  );
}
