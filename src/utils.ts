/*
 * Copyright © 2023-2024 Technology Matters
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import { Coords } from 'terraso-client-shared/types';

export const fromEntries = <K extends string | number | symbol, V>(
  entries: [K, V][],
) => Object.fromEntries(entries) as Record<K, V>;

export const entries = <K extends string | number | symbol, V>(
  object: Record<K, V>,
) => Object.entries(object) as [K, V][];

export const mapEntries = <K extends string | number | symbol, V, R>(
  o: Record<K, V>,
  f: (v: V, k: K) => R,
): Record<K, R> => fromEntries(entries(o).map(([k, v]) => [k, f(v, k)]));

export const filterValues = <T>(obj: Record<any, T>, f: (arg: T) => boolean) =>
  Object.values(obj).filter(f);

export const exists = <T>(haystack: T[], needle: T) =>
  haystack.filter(item => item === needle).length > 0;

export const mapValues = <T, U>(obj: Record<any, T>, f: (arg: T) => U) =>
  Object.values(obj).map(f);

export const isValidLatitude = (lat: number) => lat >= -90 && lat <= 90;

export const isValidLongitude = (lng: number) => lng >= -180 && lng <= 180;

export const isEquivalentCoords = (a?: Coords, b?: Coords): boolean => {
  if (a !== undefined && b !== undefined) {
    return (
      a.latitude.toFixed(5) === b.latitude.toFixed(5) &&
      a.longitude.toFixed(5) === b.longitude.toFixed(5)
    );
  } else {
    return a === undefined && b === undefined;
  }
};

export const normalizeText = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // unicode range for combining diacritical marks

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
