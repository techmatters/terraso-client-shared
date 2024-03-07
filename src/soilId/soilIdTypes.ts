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

import type {
  DepthDependentSoilDataNode,
  DepthInterval,
  ProjectDepthIntervalNode,
  ProjectSoilSettingsNode,
  SoilDataDepthIntervalNode,
  SoilDataNode,
  SoilIdDepthDependentSoilDataRockFragmentVolumeChoices,
  SoilIdDepthDependentSoilDataTextureChoices,
  SoilIdSoilDataSurfaceCracksSelectChoices,
} from 'terraso-client-shared/graphqlSchema/graphql';

export const soilPitMethods = [
  'soilTexture',
  'soilColor',
  'soilStructure',
  'carbonates',
  'ph',
  'electricalConductivity',
  'soilOrganicCarbonMatter',
  'sodiumAdsorptionRatio',
] as const;
export const collectionMethods = [
  'slope',
  'verticalCracking',
  ...soilPitMethods,
  'soilLimitations',
  'landUseLandCover',
  'photos',
  'notes',
] as const;

export type SoilPitMethod = (typeof soilPitMethods)[number];
export type CollectionMethod = (typeof collectionMethods)[number];

export { DepthInterval };
export type LabelledDepthInterval = {
  label: string;
  depthInterval: DepthInterval;
};
export type SoilDataDepthInterval = Omit<SoilDataDepthIntervalNode, 'site'>;
export type DepthDependentSoilData = Omit<DepthDependentSoilDataNode, 'site'>;
export type SoilData = Omit<
  SoilDataNode,
  'site' | 'depthIntervals' | 'depthDependentData'
> & {
  depthIntervals: SoilDataDepthInterval[];
  depthDependentData: DepthDependentSoilData[];
};
export type ProjectDepthInterval = Omit<ProjectDepthIntervalNode, 'project'>;
export type ProjectSoilSettings = Omit<
  ProjectSoilSettingsNode,
  'project' | 'depthIntervals'
> & {
  depthIntervals: ProjectDepthInterval[];
};

export type SoilTexture = SoilIdDepthDependentSoilDataTextureChoices;
export const textures = [
  'CLAY',
  'CLAY_LOAM',
  'LOAM',
  'LOAMY_SAND',
  'SAND',
  'SANDY_CLAY',
  'SANDY_CLAY_LOAM',
  'SANDY_LOAM',
  'SILT',
  'SILTY_CLAY',
  'SILTY_CLAY_LOAM',
  'SILT_LOAM',
] as const satisfies readonly SoilTexture[];

export const colorValues = [2.5, 3, 4, 5, 6, 7, 8, 8.5, 9, 9.5] as const;

export const colorChromas = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const colorHueSubsteps = [2.5, 5, 7.5, 10] as const;
export const colorHues = [
  'R',
  'YR',
  'Y',
  'GY',
  'G',
  'BG',
  'B',
  'PB',
  'P',
  'RP',
] as const;

export type RockFragmentVolume =
  SoilIdDepthDependentSoilDataRockFragmentVolumeChoices;

export type SurfaceCracks = SoilIdSoilDataSurfaceCracksSelectChoices;
export const surfaceCracks = [
  'NO_CRACKING',
  'SURFACE_CRACKING_ONLY',
  'DEEP_VERTICAL_CRACKS',
] as const satisfies readonly SurfaceCracks[];
