export const fromEntries = <K extends string | number, V>(entries: [K, V][]) =>
  Object.fromEntries(entries) as Record<K, V>;

export const filterValues = <T>(obj: Record<any, T>, f: (arg: T) => boolean) =>
  Object.values(obj).filter(f);

export const exists = <T>(haystack: T[], needle: T) =>
  haystack.filter(item => item === needle).length > 0;

export const mapValues = <T, U>(obj: Record<any, T>, f: (arg: T) => U) =>
  Object.values(obj).map(f);
