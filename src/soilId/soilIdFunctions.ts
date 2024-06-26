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

import { mhvcToLab } from 'munsell';
import {
  LabColorInput,
  Maybe,
  SoilIdInputData,
  SoilIdInputDepthDependentData,
  SoilIdSoilDataSlopeSteepnessSelectChoices,
} from 'terraso-client-shared/graphqlSchema/graphql';
import {
  CollectionMethod,
  DepthDependentSoilData,
  DepthInterval,
  SoilData,
  SoilPitMethod,
} from 'terraso-client-shared/soilId/soilIdTypes';

export const methodEnabled = <T extends SoilPitMethod>(
  method: T,
): `${T}Enabled` => `${method}Enabled`;

export const methodRequired = <T extends CollectionMethod>(
  method: T,
): `${T}Required` => `${method}Required`;

export const sameDepth =
  ({ depthInterval: a }: { depthInterval: DepthInterval }) =>
  ({ depthInterval: b }: { depthInterval: DepthInterval }) =>
    a.start === b.start && a.end === b.end;

export const overlaps =
  ({ depthInterval: a }: { depthInterval: DepthInterval }) =>
  ({ depthInterval: b }: { depthInterval: DepthInterval }) =>
    Math.max(a.start, b.start) < Math.min(a.end, b.end);

export const compareInterval = (
  { depthInterval: a }: { depthInterval: DepthInterval },
  { depthInterval: b }: { depthInterval: DepthInterval },
) => a.start - b.start;

export const degreeToPercent = (degrees: number) =>
  Math.round(Math.tan((degrees * Math.PI) / 180) * 100);

export const selectToPercent = (
  select: SoilIdSoilDataSlopeSteepnessSelectChoices,
) => {
  switch (select) {
    /** 0 - 2% (flat) */
    case 'FLAT':
      return 0.0;
    /** 2 - 5% (gentle) */
    case 'GENTLE':
      return 0.02;
    /** 15 - 30% (hilly) */
    case 'HILLY':
      return 0.15;
    /** 5 - 10% (moderate) */
    case 'MODERATE':
      return 0.05;
    /** 50 - 60% (moderately steep) */
    case 'MODERATELY_STEEP':
      return 0.5;
    /** 10 - 15% (rolling) */
    case 'ROLLING':
      return 0.1;
    /** 30 - 50% (steep) */
    case 'STEEP':
      return 0.3;
    /** 100%+ (steepest) */
    case 'STEEPEST':
      return 1.0;
    /** 60 - 100% (very steep) */
    case 'VERY_STEEP':
      return 0.6;
  }
};

export const soilDataSlopePercent = (
  data: SoilData,
): Maybe<number> | undefined => {
  if (data.slopeSteepnessSelect) {
    return selectToPercent(data.slopeSteepnessSelect!);
  } else if (typeof data.slopeSteepnessDegree === 'number') {
    return degreeToPercent(data.slopeSteepnessDegree);
  } else {
    return data.slopeSteepnessPercent;
  }
};

export const soilDataLabColorInput = (
  data: DepthDependentSoilData,
): LabColorInput | undefined => {
  if (
    typeof data.colorHue !== 'number' ||
    typeof data.colorValue !== 'number' ||
    typeof data.colorChroma !== 'number'
  ) {
    return undefined;
  }
  const [L, A, B] = mhvcToLab(data.colorHue, data.colorValue, data.colorChroma);
  return { L, A, B };
};

export const soilDataToIdInput = (data: SoilData): SoilIdInputData => {
  return {
    depthDependentData: data.depthDependentData.map(
      soilDepthDependentDataToIdInput,
    ),
    slope: soilDataSlopePercent(data),
  };
};

export const soilDepthDependentDataToIdInput = (
  data: DepthDependentSoilData,
): SoilIdInputDepthDependentData => {
  return {
    depthInterval: data.depthInterval,
    colorLAB: soilDataLabColorInput(data),
    rockFragmentVolume: data.rockFragmentVolume,
    texture: data.texture,
  };
};
