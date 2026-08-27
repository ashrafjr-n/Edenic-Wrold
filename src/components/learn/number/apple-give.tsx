"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";

interface AppleGiveProps {
  /** How many apples Pinki is asking for. */
  target: number;
  onGiven: () => void;
}

/** More apples than she asks for, or "give me one" is just "tap the apple". */
const APPLE_COUNT = 3;
/** Below this the pointer never really moved — treat it as a tap, not a drag,
    so a wobbly finger still counts as a press. */
const DRAG_THRESHOLD = 8;

interface DragState {
  id: number;
  dx: number;
  dy: number;
  moved: boolean;
}

/**
 * "Give me ONE apple" — the step that connects the numeral to a quantity.
 *
 * Both interactions work at once, on purpose: a child can **tap** an apple to
 * send it over, or **drag** it into Pinki's basket. Tapping is what a four-
 * year-old reaches for and never fails at; dragging is what the instruction
 * implies and what feels like really handing something over. Requiring the
 * drag would fail children on their motor control rather than on counting,
 * which is not what this stage is testing.
 *
 * A drag that lands anywhere else simply springs back — nothing is ever wrong
 * here, because giving the apple IS the answer.
 */
export function AppleGive({ target, onGiven }: AppleGiveProps) {
  const basketRef = useRef<HTMLDivElement>(null);
  const [given, setGiven] = useState<number[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);

  const give = (id: number) => {
    if (given.includes(id)) return;

    const next = [...given, id];
    setGiven(next);
    if (next.length >= target) onGiven();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (given.includes(id)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (drag?.id !== id) return;

    const dx = event.movementX + drag.dx;
    const dy = event.movementY + drag.dy;
    setDrag({
      id,
      dx,
      dy,
      moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD,
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (drag?.id !== id) return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    /* A tap counts. So does a drag that ended over the basket. Anything else
       springs back, and the child can simply try again. */
    const basket = basketRef.current?.getBoundingClientRect();
    const overBasket =
      basket &&
      event.clientX >= basket.left &&
      event.clientX <= basket.right &&
      event.clientY >= basket.top &&
      event.clientY <= basket.bottom;

    if (!drag.moved || overBasket) give(id);
    setDrag(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      {/* Pinki's basket. It shows what she has, so the count is visible the
          whole time rather than only being asked about afterwards. */}
      <div
        ref={basketRef}
        className="card flex h-28 min-w-[10rem] items-center justify-center gap-2 px-6 sm:h-32 sm:min-w-[13rem]"
      >
        {given.length === 0 ? (
          <span className="text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
            Drop an apple here
          </span>
        ) : (
          given.map((id) => (
            <Image
              key={id}
              src="/assets/icons/apple.png"
              alt=""
              width={140}
              height={140}
              className="anim-pop-in h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
          ))
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        {Array.from({ length: APPLE_COUNT }, (_, id) => {
          const isGone = given.includes(id);
          const dragging = drag?.id === id && drag.moved;

          return (
            <button
              key={id}
              type="button"
              disabled={isGone}
              aria-label="Give Pinki an apple"
              onPointerDown={(event) => onPointerDown(event, id)}
              onPointerMove={(event) => onPointerMove(event, id)}
              onPointerUp={(event) => onPointerUp(event, id)}
              onPointerCancel={() => setDrag(null)}
              /* `touch-action: none` or the drag scrolls the page instead. */
              className={`touch-none rounded-3xl ${
                isGone ? "pointer-events-none opacity-0" : "opacity-100"
              } ${dragging ? "" : "transition-all duration-300"}`}
              style={
                dragging
                  ? { translate: `${drag.dx}px ${drag.dy}px`, scale: "1.15" }
                  : undefined
              }
            >
              <Image
                src="/assets/icons/apple.png"
                alt=""
                width={140}
                height={140}
                className="h-20 w-20 object-contain drop-shadow-[0_12px_16px_rgba(92,78,190,0.3)] sm:h-24 sm:w-24"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
