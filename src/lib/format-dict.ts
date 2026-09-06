/** Unicode "First Strong Isolate" / "Pop Directional Isolate" — the same
    isolation `<bdi>` gives an element, but it works inside a plain string,
    which is what every dictionary template produces. Every value this
    fills in is a name, a number or a taught English word landing inside a
    template that may be Arabic, so without isolating it the bidi algorithm
    can reorder the whole line around it — reported as "Learn With Pinki"
    rendering as "Pinki Learn With" once the words around the name went
    Arabic, and "Which one is One?" as "One Which one is?". Isolating it is
    a no-op when the surrounding text is English too, and screen readers
    skip these as formatting characters, so it's safe on aria-label/alt/
    title strings as well as visible text. */
import type { Locale } from "@/types/locale";

/** Every locale the site ships that is written right-to-left: Arabic, and
    Badini Kurdish, which uses the Arabic-based Kurdish alphabet. */
const RTL_LOCALES = new Set<Locale>(["ar", "ku"]);

const FSI = "⁦";
const PDI = "⁩";

/**
 * Fills `{placeholder}` tokens in a dictionary template string.
 *
 * The dictionary is plain data (strings only, no functions) precisely so it
 * can cross the Server→Client boundary as an ordinary prop — React cannot
 * serialize a function passed from a Server to a Client Component. Every
 * parametrized entry is a template instead, filled in wherever it's used
 * (server or client) with this one helper.
 */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => `${FSI}${vars[key] ?? ""}${PDI}`);
}

/** The isolate marks above stop a run from being reordered internally, but
    they do NOT decide which SIDE of an English value the surrounding Arabic
    words land on — that's the paragraph's own base direction, and every
    element on this site is `dir`-less by default (inheriting the browser's
    `ltr`, since `<html>` never sets `dir` — see CLAUDE.md). An Arabic
    sentence with an English name or number spliced in needs its OWN element
    carrying an explicit `dir="rtl"` HTML attribute, or the bidi algorithm
    places that whole Arabic run to the English value's LEFT regardless of
    the isolate marks — reported as "تعلم مع Pinki" rendering as
    "Pinki تعلم مع".

    **A sentence with no English in it at all can need this just as badly, and
    that half of the rule is the one that gets forgotten.** `.` `!` `(` `)`
    `[` `]` and friends are bidi-NEUTRAL: they have no direction of their own,
    so they borrow one from their neighbours — and a neutral at the very END
    of a run has no neighbour on one side, so it falls back to the PARAGRAPH's
    direction instead. In an `ltr` paragraph that pulls the full stop out of
    the Arabic run and parks it on the far right, where an Arabic reader reads
    it FIRST. It shipped as a stray blue dot in front of `/learn`'s
    "تعلّم. العب. انمُ." — the period belonged to "انمُ." and had jumped the
    whole line.

    So: pass `dict.locale` to any element whose text is a translated SENTENCE
    — one that mixes in a `format()`-filled value, one that ends in `.` or
    `!`, or both. A word or a label with neither (a nav item, a button reading
    "التالي") needs nothing. Arabic's own `؟` and `؛` are strong RTL
    characters, not neutrals, so a question mark is safe on its own.

    `dir` goes on the element that OWNS the text. Where the text sits inside a
    shared component that would swallow the prop (`Button3D`'s `href` branch
    forwards only a few), wrap the text in its own `<span dir>` instead. And
    never put `dir` on an element whose OTHER children are Latin sentences —
    the hero's `<h1>` is Arabic on one line and "Edenic World." on the next,
    and turning that element `rtl` would move the Latin line's period instead. */
export function dirFor(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

/** Both non-English locales are right-to-left: Arabic, and Badini Kurdish,
    which is written in the Arabic-based Kurdish alphabet. Anything choosing a
    LAYOUT by direction (the home hero mirrors its scene) asks this rather
    than testing for one locale, so a third RTL language needs no new branch. */
export function isRtl(locale: Locale): boolean {
  return dirFor(locale) === "rtl";
}
