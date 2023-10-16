export const fromEntries = <K extends string | number, V>(entries: [K, V][]) =>
  Object.fromEntries(entries) as Record<K, V>;
