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

export const soilMatchInfo = /* GraphQL */ `
  fragment soilMatchInfo on SoilMatchInfo {
    score
    rank
  }
`;

export const soilInfo = /* GraphQL */ `
  fragment soilInfo on SoilInfo {
    soilSeries {
      name
      taxonomySubgroup
      description
      fullDescriptionUrl
    }

    ecologicalSite {
      name
      id
      url
    }

    landCapabilityClass {
      capabilityClass
      subClass
    }

    soilData {
      slope
      depthDependentData {
        depthInterval {
          start
          end
        }
        texture
        rockFragmentVolume
        munsellColorString
      }
    }
  }
`;

export const soilIdFailure = /* GraphQL */ `
  fragment soilIdFailure on SoilIdFailure {
    reason
  }
`;

export const soilMatches = /* GraphQL */ `
  fragment soilMatches on SoilMatches {
    dataRegion
    matches {
      dataSource
      distanceToNearestMapUnitM
      locationMatch {
        ...soilMatchInfo
      }
      dataMatch {
        ...soilMatchInfo
      }
      combinedMatch {
        ...soilMatchInfo
      }
      soilInfo {
        ...soilInfo
      }
    }
  }
`;
