/*
 * Copyright © 2024 Technology Matters
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
import { DepthInterval } from 'terraso-client-shared/graphqlSchema/graphql';
import { SoilPitMethod } from 'terraso-client-shared/soilId/soilIdTypes';

export const DEPTH_INTERVAL_PRESETS = {
  LANDPKS: [
    { start: 0, end: 10 },
    { start: 10, end: 20 },
    { start: 20, end: 50 },
    { start: 50, end: 70 },
    { start: 70, end: 100 },
    { start: 100, end: 200 },
  ],
  NRCS: [
    { start: 0, end: 5 },
    { start: 5, end: 15 },
    { start: 15, end: 30 },
    { start: 30, end: 60 },
    { start: 60, end: 100 },
    { start: 100, end: 200 },
  ],
} as const satisfies Record<'LANDPKS' | 'NRCS', readonly DepthInterval[]>;

export const DEFAULT_ENABLED_SOIL_PIT_METHODS = [
  'soilTexture',
  'soilStructure',
  'soilColor',
] as const satisfies readonly SoilPitMethod[];
