import type { Metadata } from "next";
import { CharacterPicker } from "@/components/learn/character-picker";

export const metadata: Metadata = {
  title: "Learn — Edenic World",
  description: "Pick a friend and start a learning adventure in Edenic World.",
};

export default function LearnPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CharacterPicker />
    </main>
  );
}
