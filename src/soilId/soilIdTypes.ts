import type {
  DepthDependentSoilDataNode,
  DepthInterval,
  ProjectDepthIntervalNode,
  ProjectSoilSettingsNode,
  SoilDataDepthIntervalNode,
  SoilDataNode,
  SoilIdDepthDependentSoilDataRockFragmentVolumeChoices,
  SoilIdDepthDependentSoilDataTextureChoices,
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

export type RockFragmentVolume =
  SoilIdDepthDependentSoilDataRockFragmentVolumeChoices;
