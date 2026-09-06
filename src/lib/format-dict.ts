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
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
