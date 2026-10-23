interface LoaderProps {
  /** "Loading…", for a screen reader — nothing is written on screen. */
  label: string;
}

/**
 * Something on its way — a lesson (the page, then its reel), a puzzle
 * stage, a Memory Match level: three clay magnets (the boards' pink, blue
 * and gold) hop one after another (`.loader` in globals.css). Silent and
 * small: a child sees that something is coming, not a progress bar.
 */
export function Loader({ label }: LoaderProps) {
  return (
    <span role="status" className="loader">
      <span aria-hidden />
      <span aria-hidden />
      <span aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
