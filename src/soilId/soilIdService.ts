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
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import { Coords } from 'terraso-client-shared/types';

export const fetchLocationBasedSoilMatches = async (coords: Coords) => {
  const query = graphql(`
    query locationBasedSoilMatches($latitude: Float!, $longitude: Float!) {
      soilId {
        locationBasedSoilMatches(latitude: $latitude, longitude: $longitude) {
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
          ...dataBasedSoilMatches
        }
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { ...coords, data })
    .then(({ soilId }) => soilId.dataBasedSoilMatches);
};
