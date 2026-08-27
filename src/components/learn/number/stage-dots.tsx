interface StageDotsProps {
  /** 0-based index of the stage being worked on. */
  current: number;
  total: number;
  accent: string;
}

/**
 * Where the child is inside one number's journey.
 *
 * Not stars — stars are the score at the end, and showing them per stage would
 * make the final tally read as a repeat. These are just dots: how far along,
 * and how much is left. A child under ten cannot read "stage 4 of 6", but they
 * can see four dots filled and two to go.
 */
export function StageDots({ current, total, accent }: StageDotsProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <span
            key={index}
            className={`rounded-full transition-all duration-300 ${
              /* The one in progress is a stretched pill rather than a bigger
                 dot: it reads as "here" without the row changing height. */
              active ? "h-2.5 w-6" : "h-2.5 w-2.5"
            }`}
            style={{
              backgroundColor: done || active ? accent : "var(--color-locked)",
              opacity: done ? 0.55 : 1,
            }}
          />
        );
      })}
    </div>
  );
}
