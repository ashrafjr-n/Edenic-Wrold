"use client";

import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";

type ItemVars = CSSProperties & { "--item-nudge-delay"?: string };

interface AppleGiveProps {
  /** How many items Pinki is asking for. */
  target: number;
  /** The item's icon — same clay-render style as the rest of `assets/icons`. */
  icon: string;
  /** Singular word for the item (e.g. "apple", "star"), already in the
      active locale. */
  itemLabel: string;
  dict: Dictionary["journey"];
  /** The invite text mixes this locale's words with the English item word
      via `format()` — see `lib/format-dict.ts`'s `dirFor`. */
  dir: "rtl" | "ltr";
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
  dict,
  dir,
  highlightTarget,
  onGiven,
}: AppleGiveProps) {
  /* English only — Arabic has no indefinite article, and `dict.dropItem`
     /`dict.pickItemAria` simply don't reference `{article}` there. */
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

          **The halo lives on this WRAPPER, not on the basket itself, and that
          is a fix rather than tidying.** A `z-index: -1` pseudo-element paints
          behind its parent's CONTENT but still on top of that parent's own
          background — so on a `.card`, which has one, `.guide-target` came out
          as a pink stain inside the box instead of light around it, and the
          "put it here" cue read as a smudge. On a background-less wrapper it
          paints behind the card and finally looks like a halo. Anywhere
          `.guide-target` is put on something with a fill, it needs this.

          Both cues are on only while the basket is EMPTY: once the first item
          is in, it has shown the child what it is for, and a light still
          burning on it would be pointing at a finished instruction. */}
      <span
        className={`relative block ${
          highlightTarget && given.length === 0 ? "guide-target" : ""
        }`}
      >
        <div
          ref={basketRef}
          /* The dashed accent rim is the same mark `NumberComplete` puts
             around the gap in its numeral — this site's way of saying
             "something belongs here" — so the drop zone reads as one before
             Pinki has said a word. It goes the moment there is something in
             the basket. */
          className={`card card-clay-white flex h-32 min-w-[11rem] items-center justify-center gap-2 px-6 sm:h-36 sm:min-w-[14rem] ${
            given.length === 0
              ? "border-2 border-dashed border-[var(--page-accent-color)]"
              : ""
          }`}
        >
          {given.length === 0 ? (
            <span dir={dir} className="text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
              {format(dict.dropItem, { article, itemLabel })}
            </span>
          ) : (
            given.map((id) => (
              <Image
                key={id}
                src={icon}
                alt=""
                width={140}
                height={140}
                className="anim-pop-in h-16 w-16 object-contain sm:h-20 sm:w-20"
              />
            ))
          )}
        </div>
      </span>

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
              aria-label={format(dict.pickItemAria, { article, itemLabel })}
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
                className="h-24 w-24 select-none object-contain drop-shadow-[0_12px_16px_rgba(92,78,190,0.3)] sm:h-28 sm:w-28"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
