"use client";

import { useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

interface SongButtonProps {
  /** The song the finished picture is a frame of. */
  src: string;
  /** The finished picture, shown until the song starts. */
  poster: string;
  label: string;
  ariaLabel: string;
  closeLabel: string;
}

/**
 * The finished puzzle's "Watch": a pink clay button that plays the song the
 * picture came from in a native `<dialog>` — `/watch`'s player, landscape.
 * The video mounts only while the dialog is open, so nothing downloads
 * before the tap.
 */
export function SongButton({ src, poster, label, ariaLabel, closeLabel }: SongButtonProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button3D
        tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
        aria-label={ariaLabel}
        className="px-5 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
      >
        <Play className="h-5 w-5 fill-current" strokeWidth={2.5} />
        {label}
      </Button3D>

      <dialog
        ref={dialog}
        aria-label={ariaLabel}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="m-auto w-[min(60rem,calc(100%-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-[rgb(var(--shadow-hue)/65%)]"
      >
        {open && (
          <div className="card card-clay-white anim-pop-in relative p-3">
            <video
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
              className="aspect-video max-h-[78svh] w-full rounded-2xl bg-black object-contain"
            />
            <span className="absolute end-5 top-5">
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
