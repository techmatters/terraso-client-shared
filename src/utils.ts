export const fromEntries = <K extends string | number, V>(entries: [K, V][]) =>
  Object.fromEntries(entries) as Record<K, V>;

export const entries = <K extends string | number, V>(object: Record<K, V>) =>
  Object.entries(object) as [K, V][];

export const filterValues = <T>(obj: Record<any, T>, f: (arg: T) => boolean) =>
  Object.values(obj).filter(f);

export const exists = <T>(haystack: T[], needle: T) =>
  haystack.filter(item => item === needle).length > 0;

export const mapValues = <T, U>(obj: Record<any, T>, f: (arg: T) => U) =>
  Object.values(obj).map(f);

export const isValidLatitude = (lat: number) => lat >= -90 && lat <= 90;

export const isValidLongitude = (lng: number) => lng >= -180 && lng <= 180;

export const normalizeText = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // unicode range for combining diacritical marks

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
