"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";

type ItemVars = CSSProperties & { "--item-nudge-delay"?: string };

interface AppleGiveProps {
  /** How many items Pinki is asking for. */
  target: number;
  /** The item's icon — same clay-render style as the rest of `assets/icons`. */
  icon: string;
  /** Singular word for the item (e.g. "apple", "star"). */
  itemLabel: string;
  /** Mark the basket as the thing to aim for, while it is still empty.
      Presentation only — it changes nothing about how giving works. The
      journey passes this exactly when Pinki is holding the stick, so the halo
      and the gesture arrive together or not at all. */
  highlightTarget?: boolean;
  onGiven: () => void;
}

/** More items than she asks for, or "pick one" is just "tap the item". */
const ITEM_COUNT = 3;
/** Below this the pointer never really moved — treat it as a tap, not a drag,
    so a wobbly finger still counts as a press. */
const DRAG_THRESHOLD = 8;
/** How long a tapped apple takes to travel to the basket before it counts. */
const FLY_MS = 320;

interface DragState {
  id: number;
  /** Where the pointer went down, in viewport coordinates — deltas are
      tracked against this rather than accumulated from `movementX`/`movementY`,
      which are unreliable across touch/pen input on some browsers and were
      the likely reason dragging didn't consistently work. */
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
}

interface FlyState {
  id: number;
  dx: number;
  dy: number;
}

/**
 * "Pick ONE apple" (or star, or whatever `icon`/`itemLabel` says) — the
 * step that connects the numeral to a quantity.
 *
 * Both interactions work at once, on purpose: a child can **tap** an item to
 * send it over, or **drag** it into Pinki's basket. Tapping is what a four-
 * year-old reaches for and never fails at; dragging is what the instruction
 * implies and what feels like really handing something over. Requiring the
 * drag would fail children on their motor control rather than on counting,
 * which is not what this stage is testing.
 *
 * A drag that lands anywhere else simply springs back — nothing is ever wrong
 * here, because giving the item IS the answer. A tapped item flies itself
 * over to the basket before it's counted, so tapping and dragging both end
 * the same way: watching it actually arrive.
 */
export function AppleGive({
  target,
  icon,
  itemLabel,
  highlightTarget,
  onGiven,
}: AppleGiveProps) {
  const article = /^[aeiou]/i.test(itemLabel) ? "an" : "a";
  const basketRef = useRef<HTMLDivElement>(null);
  const [given, setGiven] = useState<number[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  /* A tapped (not dragged) apple flies to the basket before it counts, so a
     tap reads as "the apple went over" instead of just vanishing where it
     stood. A dragged one is already there when it's released, so it skips
     straight to `give`. */
  const [flying, setFlying] = useState<FlyState | null>(null);

  const give = (id: number) => {
    if (given.includes(id)) return;

    const next = [...given, id];
    setGiven(next);
    if (next.length >= target) onGiven();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (given.includes(id) || flying) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (drag?.id !== id) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setDrag({
      ...drag,
      dx,
      dy,
      moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD,
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (drag?.id !== id) return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const basket = basketRef.current?.getBoundingClientRect();
    const overBasket =
      basket &&
      event.clientX >= basket.left &&
      event.clientX <= basket.right &&
      event.clientY >= basket.top &&
      event.clientY <= basket.bottom;

    if (!drag.moved) {
      /* A tap: fly this exact apple over to the basket first, THEN count it —
         it should never just vanish in place. */
      const appleRect = event.currentTarget.getBoundingClientRect();
      if (basket) {
        setFlying({
          id,
          dx: basket.left + basket.width / 2 - (appleRect.left + appleRect.width / 2),
          dy: basket.top + basket.height / 2 - (appleRect.top + appleRect.height / 2),
        });
        window.setTimeout(() => {
          setFlying(null);
          give(id);
        }, FLY_MS);
      } else {
        give(id);
      }
    } else if (overBasket) {
      /* A drag that landed on the basket is already there — no flight needed. */
      give(id);
    }
    /* A drag that landed anywhere else just springs back to its start point,
       via the same transition the "not dragging" state already applies. */
    setDrag(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      {/* Pinki's basket. It shows what she has, so the count is visible the
          whole time rather than only being asked about afterwards.

          The halo is on it only while it is EMPTY: once the first item is in,
          the basket has shown the child what it is for and a light still
          burning on it would be pointing at a finished instruction. */}
      <div
        ref={basketRef}
        className={`card flex h-28 min-w-[10rem] items-center justify-center gap-2 px-6 sm:h-32 sm:min-w-[13rem] ${
          highlightTarget && given.length === 0 ? "guide-target" : ""
        }`}
      >
        {given.length === 0 ? (
          <span className="text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
            Drop {article} {itemLabel} here
          </span>
        ) : (
          given.map((id) => (
            <Image
              key={id}
              src={icon}
              alt=""
              width={140}
              height={140}
              className="anim-pop-in h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
          ))
        )}
      </div>

      {/* Each item leans on its own slow loop while none has been picked —
          an invitation to touch them, gated the same way the basket's halo
          is. Once the first one is on its way the child has worked out what
          the tray is for, and a nudge still running would be asking for
          attention the stage no longer needs. */}
      <div className="flex items-center gap-4 sm:gap-8">
        {Array.from({ length: ITEM_COUNT }, (_, id) => {
          const isGone = given.includes(id);
          const dragging = drag?.id === id && drag.moved;
          const isFlying = flying?.id === id;
          const nudging = given.length === 0 && !flying;

          return (
            <button
              key={id}
              type="button"
              disabled={isGone || isFlying}
              aria-label={`Pick ${article} ${itemLabel}`}
              onPointerDown={(event) => onPointerDown(event, id)}
              onPointerMove={(event) => onPointerMove(event, id)}
              onPointerUp={(event) => onPointerUp(event, id)}
              onPointerCancel={() => setDrag(null)}
              /* `touch-action: none` or the drag scrolls the page instead. */
              className={`touch-none rounded-3xl ${nudging ? "anim-item-nudge" : ""} ${
                isGone ? "pointer-events-none opacity-0" : "opacity-100"
              } ${dragging ? "" : "transition-all duration-300"}`}
              style={
                {
                  /* Staggers each item's own copy of the loop against its
                     neighbours' so three identical animations never land in
                     the same rotation at the same time — see the CSS note on
                     `.anim-item-nudge`. */
                  ...(nudging ? { "--item-nudge-delay": `${id * -1.1}s` } : {}),
                  ...(dragging
                    ? { translate: `${drag.dx}px ${drag.dy}px`, scale: "1.15" }
                    : isFlying
                      ? {
                          translate: `${flying.dx}px ${flying.dy}px`,
                          scale: "0.35",
                        }
                      : {}),
                } as ItemVars
              }
            >
              <Image
                src={icon}
                alt=""
                width={140}
                height={140}
                draggable={false}
                className="h-20 w-20 select-none object-contain drop-shadow-[0_12px_16px_rgba(92,78,190,0.3)] sm:h-24 sm:w-24"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
