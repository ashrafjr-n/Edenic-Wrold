"use client";

import { useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { shuffle } from "@/lib/seeded";
import type { Wagon } from "@/types/course";

/** Two misses and the wagon that comes next starts to glow. */
const HINT_AFTER = 2;

/* The step's width, capped by the height it has (track + wagons stand
   about 0.62 of their width tall, plus their labels and gaps). */
const SIZE =
  "max-w-[min(34rem,calc((100svh-26rem-min(2.5rem,4svh))*1.55))] sm:max-w-[min(36rem,calc((100svh-40rem)*1.55))] lg:max-w-[min(44rem,calc((var(--stage-h)-7rem)*1.6))]";

interface TrainOrderProps {
  engine: StaticImageData;
  /** In the right order. */
  wagons: Wagon[];
  /** Deals the wagons — a new seed is a new order. */
  seed: string;
  /** "Tap the {word}", naming each wagon for a screen reader. */
  itemAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Build Nova's year train: her engine on the track, a numbered space behind
 * it for each wagon, and the wagons dealt under it, each with its month
 * written beneath. Tap the one that comes next and it couples on in the
 * next space (an empty socket stays where it was); a wrong one only
 * wiggles, and after two misses the right one glows. All on → the train
 * rolls off one side and comes back round from the other — the year goes
 * round.
 *
 * The engine and the wagons are renders from one camera, so the engine is
 * as many wagons long as its picture is wide (`flex-grow`), and their
 * wheels share one line. The taught words are English: never mirrored.
 */
export function TrainOrder({ engine, wagons, seed, itemAria, onSolved, onMiss }: TrainOrderProps) {
  const order = useMemo(() => shuffle(wagons.map((_, index) => index), seed), [wagons, seed]);
  const [placed, setPlaced] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);

  const solved = placed === wagons.length;
  const { width, height } = wagons[0].src;
  const wagonBox = { aspectRatio: `${width} / ${height}` };
  const columns = { gridTemplateColumns: `repeat(${wagons.length}, minmax(0, 1fr))` };

  const tap = (index: number) => {
    if (solved || index < placed) return;
    if (index === placed) {
      setPlaced(placed + 1);
      if (placed + 1 === wagons.length) onSolved();
      return;
    }
    setWrong(index);
    setMisses((count) => count + 1);
    onMiss();
  };

  return (
    <div dir="ltr" className={`flex w-full flex-col items-center gap-5 sm:gap-8 [@media(max-height:700px)]:gap-3 ${SIZE}`}>
      {/* The track: the engine, then a coupling space per wagon, on the rails. */}
      <div className="card card-clay-white card-bare-lg relative w-full px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
        <div className="overflow-hidden">
          <div className={`flex items-end gap-[1%] ${solved ? "train-go" : ""}`}>
            <span className="relative block" style={{ flex: `${engine.width / width} 1 0%`, aspectRatio: `${engine.width} / ${engine.height}` }}>
              <Image src={engine} alt="" fill sizes="(min-width: 1024px) 10rem, 22vw" className="object-contain" />
            </span>
            {wagons.map((wagon, i) => (
              <span key={i} className="@container flex min-w-0 flex-1 flex-col items-center">
                <span className="relative block w-full" style={wagonBox}>
                  {i < placed ? (
                    <span className="anim-pop-in absolute inset-0">
                      <Image src={wagon.src} alt="" fill sizes="(min-width: 1024px) 7rem, 18vw" className="object-contain" />
                    </span>
                  ) : (
                    <span aria-hidden className="letter-slot absolute inset-x-[4%] bottom-[4%] flex h-[58%] items-center justify-center text-[length:40cqi] font-bold text-[rgb(var(--shadow-hue)/0.28)]">
                      {i + 1}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 h-[1.3em] w-full truncate text-center text-[length:min(17cqi,1.25rem)] font-bold leading-tight text-[var(--color-ink)]">
                  {i < placed ? wagon.word : ""}
                </span>
              </span>
            ))}
          </div>
        </div>
        {/* The rails, its sleepers in the shadow hue. */}
        <span
          aria-hidden
          className="mt-0.5 block h-2 rounded-full sm:h-2.5"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgb(var(--shadow-hue)/0.35) 0 0.375rem, transparent 0.375rem 1.25rem), color-mix(in srgb, var(--page-accent-color) 55%, var(--surface))",
          }}
        />
        {solved && <Celebration />}
      </div>

      {/* The wagons, dealt — each with its month under it. */}
      <ul className="grid w-full gap-2.5 sm:gap-4" style={columns}>
        {order.map((index) => {
          const glow = !solved && index === placed && misses >= HINT_AFTER;
          return (
            <li key={index} className={`relative ${glow ? "guide-target" : ""}`}>
              {index < placed ? (
                <span className="letter-slot block h-full w-full" />
              ) : (
                <button
                  type="button"
                  onClick={() => tap(index)}
                  onAnimationEnd={() => setWrong(null)}
                  aria-label={format(itemAria, { word: wagons[index].word })}
                  className={`card card-clay-white @container flex w-full flex-col items-center px-[6%] pb-2 pt-1 transition-transform duration-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] active:scale-95 ${
                    wrong === index ? "anim-wiggle" : ""
                  } ${solved ? "" : "hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)]"}`}
                >
                  <span className="relative block w-full" style={wagonBox}>
                    <Image src={wagons[index].src} alt="" fill sizes="(min-width: 1024px) 9rem, 28vw" className="object-contain" />
                  </span>
                  <span className="w-full truncate text-center text-[length:min(16cqi,1.375rem)] font-bold leading-tight text-[var(--color-ink)]">
                    {wagons[index].word}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
