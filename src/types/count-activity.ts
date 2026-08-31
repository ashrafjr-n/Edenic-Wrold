/** What the `count` stage's give-activity hands to Pinki for a given number —
    the icon asset and the singular word for it (pluralized with a trailing
    "s" wherever it's spoken or shown). Apples are the default; only numbers
    that use something else need an entry. */
export interface CountActivityConfig {
  icon: string;
  itemLabel: string;
}
