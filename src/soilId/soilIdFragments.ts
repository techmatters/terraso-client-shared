/*
 * Copyright © 2023 Technology Matters
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

export const projectSoilSettings = /* GraphQL */ `
  fragment projectSoilSettings on ProjectSoilSettingsNode {
    depthIntervals {
      depthInterval {
        start
        end
      }
      label
    }
    measurementUnits
    depthIntervalPreset
    soilPitRequired
    slopeRequired
    soilTextureRequired
    soilColorRequired
    verticalCrackingRequired
    carbonatesRequired
    phRequired
    soilOrganicCarbonMatterRequired
    electricalConductivityRequired
    sodiumAdsorptionRatioRequired
    soilStructureRequired
    landUseLandCoverRequired
    soilLimitationsRequired
    photosRequired
    notesRequired
  }
`;

export const soilData = /* GraphQL */ `
  fragment soilData on SoilDataNode {
    downSlope
    crossSlope
    bedrock
    slopeLandscapePosition
    slopeAspect
    slopeSteepnessSelect
    slopeSteepnessPercent
    slopeSteepnessDegree
    surfaceCracksSelect
    surfaceSaltSelect
    floodingSelect
    limeRequirementsSelect
    surfaceStoninessSelect
    waterTableDepthSelect
    soilDepthSelect
    landCoverSelect
    grazingSelect
    depthIntervals {
      ...soilDataDepthInterval
    }
    depthDependentData {
      ...depthDependentSoilData
    }
  }
`;

export const soilDataDepthInterval = /* GraphQL */ `
  fragment soilDataDepthInterval on SoilDataDepthIntervalNode {
    label
    depthInterval {
      start
      end
    }
    soilTextureEnabled
    soilColorEnabled
    carbonatesEnabled
    phEnabled
    soilOrganicCarbonMatterEnabled
    electricalConductivityEnabled
    sodiumAdsorptionRatioEnabled
    soilStructureEnabled
  }
`;

export const depthDependentSoilData = /* GraphQL */ `
  fragment depthDependentSoilData on DepthDependentSoilDataNode {
    depthInterval {
      start
      end
    }
    texture
    rockFragmentVolume
    colorHueSubstep
    colorHue
    colorValue
    colorChroma
    conductivity
    conductivityTest
    conductivityUnit
    structure
    ph
    phTestingSolution
    phTestingMethod
    soilOrganicCarbon
    soilOrganicMatter
    soilOrganicCarbonTesting
    soilOrganicMatterTesting
    sodiumAbsorptionRatio
    carbonates
  }
`;
