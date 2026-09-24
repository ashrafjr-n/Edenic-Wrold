interface LetterWatchProps {
  src: string;
  label: string;
}

/** The letter's reel, in its own 9:16 clay frame — the numerals' frame. */
export function LetterWatch({ src, label }: LetterWatchProps) {
  return (
    <div className="card card-clay-white relative aspect-[9/16] h-[56svh] max-h-[36rem] min-h-[15rem] shrink-0 overflow-hidden sm:h-[62svh]">
      <video
        src={src}
        autoPlay
        playsInline
        controls
        preload="auto"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
