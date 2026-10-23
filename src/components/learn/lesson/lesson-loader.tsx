interface LessonLoaderProps {
  /** "Loading…", for a screen reader — nothing is written on screen. */
  label: string;
}

/**
 * While a lesson is on its way — the page, then its reel — three clay
 * magnets (her board's pink, blue and gold) hop one after another
 * (`.lesson-loader` in globals.css). Silent and small: a child sees that
 * something is coming, not a progress bar.
 */
export function LessonLoader({ label }: LessonLoaderProps) {
  return (
    <span role="status" className="lesson-loader">
      <span aria-hidden />
      <span aria-hidden />
      <span aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
