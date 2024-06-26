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

import { graphql } from 'terraso-client-shared/graphqlSchema';
import { SoilIdInputData } from 'terraso-client-shared/graphqlSchema/graphql';
import { soilDataToIdInput } from 'terraso-client-shared/soilId/soilIdFunctions';
import { SoilData } from 'terraso-client-shared/soilId/soilIdTypes';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import { Coords } from 'terraso-client-shared/types';

export const fetchSoilMatches = async ({
  coords,
  siteId,
  soilData,
}: {
  coords: Coords;
  siteId?: string;
  soilData?: SoilData;
}) => {
  /*
   * We call different APIs for different input scenarios.
   * When soil data is available, we use the data-based soil match API.
   * When the input is only a location, we use the location-based soil match API.
   */
  if (siteId && soilData) {
    return fetchDataBasedSoilMatches(coords, soilDataToIdInput(soilData)).then(
      result => {
        if (result.__typename === 'SoilIdFailure') {
          return {
            locationBasedMatches: [],
            dataBasedMatches: [],
            failureReason: result.reason,
          };
        }
        return {
          locationBasedMatches: [],
          dataBasedMatches: result.matches,
        };
      },
    );
  } else {
    return fetchLocationBasedSoilMatches(coords).then(result => {
      if (result.__typename === 'SoilIdFailure') {
        return {
          locationBasedMatches: [],
          dataBasedMatches: [],
          failureReason: result.reason,
        };
      }
      return {
        locationBasedMatches: result.matches,
        dataBasedMatches: [],
      };
    });
  }
};

export const fetchLocationBasedSoilMatches = async (coords: Coords) => {
  const query = graphql(`
    query locationBasedSoilMatches($latitude: Float!, $longitude: Float!) {
      soilId {
        locationBasedSoilMatches(latitude: $latitude, longitude: $longitude) {
          __typename
          ...soilIdFailure
          ...locationBasedSoilMatches
        }
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, coords)
    .then(({ soilId }) => soilId.locationBasedSoilMatches);
};

export const fetchDataBasedSoilMatches = async (
  coords: Coords,
  data: SoilIdInputData,
) => {
  const query = graphql(`
    query dataBasedSoilMatches(
      $latitude: Float!
      $longitude: Float!
      $data: SoilIdInputData!
    ) {
      soilId {
        dataBasedSoilMatches(
          latitude: $latitude
          longitude: $longitude
          data: $data
        ) {
          __typename
          ...soilIdFailure
          ...dataBasedSoilMatches
        }
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { ...coords, data })
    .then(({ soilId }) => soilId.dataBasedSoilMatches);
};
