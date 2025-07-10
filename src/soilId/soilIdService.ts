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

export const fetchSoilMatches = async (
  coords: Coords,
  soilData: SoilIdInputData,
) => {
  const query = graphql(`
    query soilMatches(
      $latitude: Float!
      $longitude: Float!
      $data: SoilIdInputData!
    ) {
      soilId {
        soilMatches(latitude: $latitude, longitude: $longitude, data: $data) {
          __typename
          ...soilIdFailure
          ...soilMatches
        }
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { ...coords, data: soilData })
    .then(({ soilId }) => soilId.soilMatches);
};
