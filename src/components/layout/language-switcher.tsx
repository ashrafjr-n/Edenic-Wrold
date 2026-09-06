"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Languages } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { setLocale } from "@/lib/set-locale";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/types/locale";

interface LanguageSwitcherProps {
  dict: Dictionary;
  locale: Locale;
}

/**
 * The header's language chip. Opens a small clay popover with one row per
 * language — same `.card` + `.btn3d--icon-accent` material as the rest of
 * the header chrome, so the popover reads as part of it rather than a
 * generic browser-style dropdown.
 *
 * Only English and Arabic actually switch anything. Kurdish is shown, on
 * request, as a disabled row wearing the same "Soon" badge `MainNav` uses
 * for a section with no route yet — the shape exists, the language doesn't.
 *
 * Switching writes the locale to a cookie (`setLocale`, a Server Action —
 * `cookies().set` there always carries `path: "/"`, unlike a client-side
 * `document.cookie`, which defaults to the CURRENT path and would leave the
 * cookie invisible to Server Components rendering any other route) and then
 * `router.refresh()`s so every Server Component re-reads it. Only site
 * chrome and Pinki's speech switch language; the taught content (numbers,
 * letters, colors) never does, and no layout direction changes — see
 * CLAUDE.md's language switcher conventions.
 */
export function LanguageSwitcher({ dict, locale }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = async (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    await setLocale(next);
    router.refresh();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Button3D
        tone={{ face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }}
        aria-label={dict.header.changeLanguage}
        aria-expanded={open}
        className="btn3d--icon-accent h-11 w-11 shrink-0"
        onClick={() => setOpen((value) => !value)}
      >
        <Languages className="h-5 w-5" strokeWidth={2.25} />
      </Button3D>

      {open && (
        <div
          role="menu"
          aria-label={dict.header.chooseLanguage}
          className="card anim-pop-in absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 origin-top p-2"
        >
          <LanguageRow
            label={dict.header.english}
            active={locale === "en"}
            onSelect={() => choose("en")}
          />
          <LanguageRow
            label={dict.header.arabic}
            active={locale === "ar"}
            onSelect={() => choose("ar")}
          />
          <LanguageRow label={dict.header.kurdish} disabled soonLabel={dict.nav.soon} />
        </div>
      )}
    </div>
  );
}

interface LanguageRowProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  soonLabel?: string;
  onSelect?: () => void;
}

function LanguageRow({ label, active, disabled, soonLabel, onSelect }: LanguageRowProps) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
        disabled
          ? "cursor-default text-[var(--color-locked-text)]"
          : active
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--color-ink)] hover:bg-[var(--color-locked)]/40"
      }`}
    >
      {label}
      {active && <Check className="h-4 w-4 shrink-0" strokeWidth={3} />}
      {soonLabel && (
        <span className="rounded-full bg-[var(--color-locked)] px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide">
          {soonLabel}
        </span>
      )}
    </button>
  );
}
