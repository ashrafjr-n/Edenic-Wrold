"use client";

import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Camera, Hourglass, Lock, Play } from "lucide-react";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import { findKey, useProgress } from "@/store/progress";

/** One page of the album: a stage, with its pictures once it is built. */
export interface AlbumSlot {
  n: number;
  /** What is hidden there: its word and its picture. */
  things?: readonly { word: string; pic: StaticImageData }[];
  photo?: StaticImageData;
  place?: StaticImageData;
}

interface FindAlbumProps {
  slots: readonly AlbumSlot[];
  words: Dictionary["findGame"];
  soon: string;
  /** The stage whose photo just came in (`?photo=`): it drops onto its page. */
  fresh?: number;
}

/* Each polaroid's lean — a fixed table, never random (it renders on the server too). */
const TILTS = [-3, 2, -1.5, 2.5, -2, 1.5, -2.5, 1, -1];

type State = "done" | "next" | "soon" | "locked";

/**
 * Find's album, which is also its stage picker: nine white clay polaroids
 * taped on the page. A found stage shows its photo and what was found; the next
 * one its place, with a play dot; one not built yet "Coming soon"; the rest
 * a padlock. The stages open one at a time. Nothing found until the store
 * has read localStorage.
 */
export function FindAlbum({ slots, words, soon, fresh }: FindAlbumProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const found = (n: number) => hydrated && Boolean(items[findKey(n)]);
  const count = slots.filter((slot) => found(slot.n)).length;

  const stateOf = (slot: AlbumSlot): State => {
    if (found(slot.n)) return "done";
    if (slot.n > 1 && !found(slot.n - 1)) return "locked";
    return slot.things ? "next" : "soon";
  };

  return (
    <>
      <p className="mt-3 flex justify-center">
        <span className="discover-chip find-album-chip" role="img" aria-label={format(words.albumAria, { n: count, total: slots.length })}>
          <Camera className="h-6 w-6" strokeWidth={2.4} aria-hidden />
          <span aria-hidden dir="ltr">
            {count}/{slots.length}
          </span>
        </span>
      </p>
      <ol className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-3 gap-x-3 gap-y-6 px-4 sm:gap-x-8 sm:gap-y-10 sm:px-8 lg:max-w-4xl">
        {slots.map((slot, i) => {
          const state = stateOf(slot);
          const style = { "--tilt": `${TILTS[i % TILTS.length]}deg`, animationDelay: `${0.12 + i * 0.05}s` } as CSSProperties;
          const className = `find-polaroid find-polaroid--${state} ${fresh === slot.n && state === "done" ? "find-polaroid--fresh" : ""}`;
          const picture =
            state === "done" && slot.photo ? (
              <Image src={slot.photo} alt="" placeholder="blur" sizes="(min-width: 64rem) 16rem, (min-width: 40rem) 14rem, 30vw" className="find-polaroid-pic" />
            ) : state === "next" && slot.place ? (
              <>
                <Image src={slot.place} alt="" placeholder="blur" sizes="(min-width: 64rem) 16rem, (min-width: 40rem) 14rem, 30vw" className="find-polaroid-pic" />
                <span className="find-polaroid-go" aria-hidden>
                  <Play className="fill-current" strokeWidth={2.5} />
                </span>
              </>
            ) : (
              <span className="find-polaroid-pic find-polaroid-empty" aria-hidden>
                {state === "soon" ? <Hourglass strokeWidth={2.4} /> : <Lock strokeWidth={2.6} />}
              </span>
            );
          const caption =
            state === "done" ? slot.things?.map(({ word, pic }) => <Image key={word} src={pic} alt="" sizes="32px" className="find-polaroid-thing" />) : state === "next" ? "?" : state === "soon" ? soon : " ";
          const inner = (
            <>
              {picture}
              <span className="find-polaroid-caption" dir={state === "soon" ? undefined : "ltr"}>
                {caption}
              </span>
            </>
          );
          return (
            <li key={slot.n} className="anim-rise-in" style={{ animationDelay: style.animationDelay }}>
              {state === "done" || state === "next" ? (
                <Link
                  href={`/play/find/${slot.n}`}
                  aria-label={state === "done" ? format(words.photoAria, { n: slot.n, things: slot.things?.map((t) => t.word).join(", ") ?? "" }) : format(words.playAria, { n: slot.n })}
                  className={className}
                  style={style}
                >
                  {inner}
                </Link>
              ) : (
                <span role="img" aria-label={format(state === "soon" ? words.soonAria : words.lockedAria, { n: slot.n })} className={className} style={style}>
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
