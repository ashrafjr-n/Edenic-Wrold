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
    element on this site is `dir`-less (inherits the browser default `ltr`,
    since `<html>` never sets `dir` — see CLAUDE.md). An Arabic sentence with
    an English name or number spliced in needs its OWN element carrying an
    explicit `dir="rtl"` HTML attribute, or the bidi algorithm places that
    whole Arabic run to the English value's LEFT regardless of the isolate
    marks — reported as "تعلم مع Pinki" rendering as "Pinki تعلم مع". Pass
    `dict.locale` (present on every dictionary, see `en.ts`) to any element
    whose text mixes a template with a `format()`-filled value. */
export function dirFor(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
