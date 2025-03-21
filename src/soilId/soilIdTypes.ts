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
  SoilIdFailureReason,
  SoilIdProjectSoilSettingsDepthIntervalPresetChoices,
  SoilIdSoilDataSurfaceCracksSelectChoices,
  SoilMetadataNode,
} from 'terraso-client-shared/graphqlSchema/graphql';

export type MethodRequired<
  T extends CollectionMethod | DisabledCollectionMethod,
> = `${T}Required`;

export type LoadingState = 'loading' | 'error' | 'ready';
export type SoilIdStatus = LoadingState | SoilIdFailureReason;

export const soilPitMethods = ['soilTexture', 'soilColor'] as const;
export const disabledSoilPitMethods = [
  'soilStructure',
  'carbonates',
  'ph',
  'electricalConductivity',
  'soilOrganicCarbonMatter',
  'sodiumAdsorptionRatio',
] as const;

export const allSoilPitMethods = [
  ...soilPitMethods,
  ...disabledSoilPitMethods,
] as const;

export const collectionMethods = [
  'slope',
  'verticalCracking',
  ...soilPitMethods,
  'notes',
] as const;

export const disabledCollectionMethods = [
  'soilLimitations',
  'landUseLandCover',
  'photos',
  ...disabledSoilPitMethods,
] as const;

export const allCollectionMethods = [
  ...collectionMethods,
  ...disabledCollectionMethods,
] as const;

export type SoilPitMethod = (typeof soilPitMethods)[number];
export type CollectionMethod = (typeof collectionMethods)[number];

export type DisabledCollectionMethod =
  (typeof disabledCollectionMethods)[number];

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
export type SoilMetadata = Omit<SoilMetadataNode, 'site'>;
export type ProjectDepthInterval = Omit<ProjectDepthIntervalNode, 'project'>;
export type AllProjectSoilSettings = Omit<
  ProjectSoilSettingsNode,
  'project' | 'depthIntervals'
> & {
  depthIntervals: ProjectDepthInterval[];
};
export type ProjectSoilSettings = Omit<
  AllProjectSoilSettings,
  MethodRequired<DisabledCollectionMethod>
>;

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

export type ColorValue = (typeof colorValues)[number];
export const colorValues = [2, 2.5, 3, 4, 5, 6, 7, 8, 8.5, 9, 9.5] as const;

export type ColorChroma = (typeof colorChromas)[number];
export const colorChromas = [1, 2, 3, 4, 6, 8] as const;

export type ColorHueSubstep = (typeof colorHueSubsteps)[number];
export const colorHueSubsteps = [2.5, 5, 7.5, 10] as const;

export type NonNeutralColorHue = (typeof nonNeutralColorHues)[number];
export const nonNeutralColorHues = [
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

export type SoilColorHue = (typeof soilColorHues)[number];
export const soilColorHues = [
  'N',
  'R',
  'YR',
  'Y',
  'GY',
  'G',
  'BG',
  'B',
  'PB',
] as const;

export type ColorHue = SoilColorHue | NonNeutralColorHue;

export type RockFragmentVolume =
  SoilIdDepthDependentSoilDataRockFragmentVolumeChoices;

export type SurfaceCracks = SoilIdSoilDataSurfaceCracksSelectChoices;
export const surfaceCracks = [
  'NO_CRACKING',
  'SURFACE_CRACKING_ONLY',
  'DEEP_VERTICAL_CRACKS',
] as const satisfies readonly SurfaceCracks[];

export type ProjectDepthIntervalPreset =
  SoilIdProjectSoilSettingsDepthIntervalPresetChoices;
export const DEPTH_PRESETS = [
  'NRCS',
  'BLM',
  'CUSTOM',
  'NONE',
] as const satisfies readonly ProjectDepthIntervalPreset[];
