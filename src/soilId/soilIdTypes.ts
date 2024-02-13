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
  SoilIdDepthDependentSoilDataColorChromaChoices,
  SoilIdDepthDependentSoilDataColorHueChoices,
  SoilIdDepthDependentSoilDataColorHueSubstepChoices,
  SoilIdDepthDependentSoilDataColorValueChoices,
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

export type SoilColorValue = SoilIdDepthDependentSoilDataColorValueChoices;
export const colorValues = [
  'VALUE_2_5',
  'VALUE_3',
  'VALUE_4',
  'VALUE_5',
  'VALUE_6',
  'VALUE_7',
  'VALUE_8',
  'VALUE_8_5',
  'VALUE_9',
  'VALUE_9_5',
] as const satisfies readonly SoilColorValue[];

export type SoilColorChroma = SoilIdDepthDependentSoilDataColorChromaChoices;
export const colorChromas = [
  'CHROMA_1',
  'CHROMA_2',
  'CHROMA_3',
  'CHROMA_4',
  'CHROMA_5',
  'CHROMA_6',
  'CHROMA_7',
  'CHROMA_8',
] as const satisfies readonly SoilColorChroma[];

export type SoilColorHue = SoilIdDepthDependentSoilDataColorHueChoices;
export const colorHues = [
  'B',
  'BG',
  'G',
  'GY',
  'R',
  'Y',
  'YR',
] as const satisfies readonly SoilColorHue[];

export type SoilColorHueSubstep =
  SoilIdDepthDependentSoilDataColorHueSubstepChoices;
export const colorHueSubsteps = [
  'SUBSTEP_2_5',
  'SUBSTEP_5',
  'SUBSTEP_7_5',
  'SUBSTEP_10',
] as const satisfies readonly SoilColorHueSubstep[];

export type RockFragmentVolume =
  SoilIdDepthDependentSoilDataRockFragmentVolumeChoices;

export type SurfaceCracks = SoilIdSoilDataSurfaceCracksSelectChoices;
export const surfaceCracks = [
  'NO_CRACKING',
  'SURFACE_CRACKING_ONLY',
  'DEEP_VERTICAL_CRACKS',
] as const satisfies readonly SurfaceCracks[];
