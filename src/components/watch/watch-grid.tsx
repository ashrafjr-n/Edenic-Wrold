"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { format } from "@/lib/format-dict";
import type { WatchClip, WatchSection } from "@/data/watch";

interface WatchGridProps {
  sections: readonly WatchSection[];
  ariaTemplate: string;
  closeLabel: string;
  dir: "rtl" | "ltr";
}

/** Poster tiles by course; a tile opens its video in a native `<dialog>`
    (mounted only while open, so a closed one never loads or keeps playing). */
export function WatchGrid({ sections, ariaTemplate, closeLabel, dir }: WatchGridProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [clip, setClip] = useState<WatchClip | null>(null);

  const open = (next: WatchClip) => {
    setClip(next);
    dialog.current?.showModal();
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {sections.map((section) => (
          <section key={section.courseId} className="flex flex-col gap-3">
            <h2 dir={dir} className="text-2xl font-bold text-[var(--color-ink)]">
              {section.courseName}
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {section.clips.map((item) => (
                <li key={item.src}>
                  <button
                    type="button"
                    onClick={() => open(item)}
                    aria-label={format(ariaTemplate, { title: item.title })}
                    className="card card-lift relative block aspect-[9/16] w-full cursor-pointer overflow-hidden"
                  >
                    <Image src={item.poster} alt="" fill sizes="(min-width: 1024px) 14rem, (min-width: 640px) 30vw, 45vw" className="object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/45 px-2 py-2 text-lg font-bold text-white" dir="ltr">
                      {item.title}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                      <Play className="h-12 w-12 fill-white text-white drop-shadow" strokeWidth={2} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-label={clip?.title}
        onClose={() => setClip(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="m-auto w-[min(24rem,calc(100%-2.5rem))] overflow-visible bg-transparent p-0 backdrop:bg-[rgb(var(--shadow-hue)/60%)]"
      >
        {clip && (
          <div className="card card-clay-white anim-pop-in relative p-3">
            <video
              key={clip.src}
              src={clip.src}
              poster={clip.poster}
              controls
              autoPlay
              playsInline
              className="aspect-[9/16] max-h-[78svh] w-full rounded-2xl bg-black object-contain"
            />
            <span className="absolute end-3 top-3">
              <Button3D
                tone={{ face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }}
                onClick={() => dialog.current?.close()}
                aria-label={closeLabel}
                className="h-11 w-11"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </Button3D>
            </span>
          </div>
        )}
      </dialog>
    </>
  );
}
