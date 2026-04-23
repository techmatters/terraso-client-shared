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
import type {
  ProjectSoilSettingsDeleteDepthIntervalMutationInput,
  ProjectSoilSettingsUpdateDepthIntervalMutationInput,
  ProjectSoilSettingsUpdateMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';

// Note: we used to have some mutations in this file that are now covered by pushUserData

export const updateProjectSoilSettings = async (
  soilSettings: ProjectSoilSettingsUpdateMutationInput,
) => {
  const query = graphql(`
    mutation updateProjectSoilSettings(
      $input: ProjectSoilSettingsUpdateMutationInput!
    ) {
      updateProjectSoilSettings(input: $input) {
        projectSoilSettings {
          ...projectSoilSettings
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: soilSettings });
  return resp.updateProjectSoilSettings.projectSoilSettings!;
};

export const updateProjectDepthInterval = async (
  depthInterval: ProjectSoilSettingsUpdateDepthIntervalMutationInput,
) => {
  const query = graphql(`
    mutation updateProjectSoilSettingsDepthInterval(
      $input: ProjectSoilSettingsUpdateDepthIntervalMutationInput!
    ) {
      updateProjectSoilSettingsDepthInterval(input: $input) {
        projectSoilSettings {
          ...projectSoilSettings
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: depthInterval });
  return resp.updateProjectSoilSettingsDepthInterval.projectSoilSettings!;
};

export const deleteProjectDepthInterval = async (
  depthInterval: ProjectSoilSettingsDeleteDepthIntervalMutationInput,
) => {
  const query = graphql(`
    mutation deleteProjectSoilSettingsDepthInterval(
      $input: ProjectSoilSettingsDeleteDepthIntervalMutationInput!
    ) {
      deleteProjectSoilSettingsDepthInterval(input: $input) {
        projectSoilSettings {
          ...projectSoilSettings
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: depthInterval });
  return resp.deleteProjectSoilSettingsDepthInterval.projectSoilSettings!;
};
