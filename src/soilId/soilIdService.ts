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

import { graphql } from 'terraso-client-shared/graphqlSchema';
import type {
  DepthDependentSoilDataUpdateMutationInput,
  ProjectSoilSettingsUpdateDepthIntervalMutationInput,
  ProjectSoilSettingsUpdateMutationInput,
  SoilDataDeleteDepthIntervalMutationInput,
  SoilDataUpdateDepthIntervalMutationInput,
  SoilDataUpdateMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import { collapseProjects } from 'terraso-client-shared/project/projectService';
import { collapseSites } from 'terraso-client-shared/site/siteService';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import {
  collapseEdges,
  collapseMaps,
} from 'terraso-client-shared/terrasoApi/utils';

export const fetchSoilDataForUser = async (userId: string) => {
  const query = graphql(`
    query userSoilData($id: ID!) {
      userSites: sites(owner: $id) {
        edges {
          node {
            ...siteData
            soilData {
              ...soilData
            }
          }
        }
      }
      projects: projects(member: $id) {
        edges {
          node {
            ...projectData
            siteSet {
              edges {
                node {
                  soilData {
                    ...soilData
                  }
                }
              }
            }
            soilSettings {
              ...projectSoilSettings
            }
          }
        }
      }
    }
  `);

  const { userSites, projects: allProjects } = await terrasoApi.requestGraphQL(
    query,
    { id: userId },
  );

  const {
    projects,
    sites: projectSites,
    users,
  } = collapseProjects(allProjects);
  const allSites = collapseEdges(userSites).concat(
    collapseEdges(allProjects).flatMap(({ siteSet }) => collapseEdges(siteSet)),
  );

  return {
    projects,
    users,
    projectSoilSettings: Object.fromEntries(
      collapseEdges(allProjects).map(({ soilSettings, id }) => [
        id,
        soilSettings,
      ]),
    ),
    sites: collapseMaps(collapseSites(userSites), projectSites),
    soilData: Object.fromEntries(
      allSites.map(({ soilData, id }) => [id, soilData]),
    ),
  };
};

export const updateSoilData = async (soilData: SoilDataUpdateMutationInput) => {
  const query = graphql(`
    mutation updateSoilData($input: SoilDataUpdateMutationInput!) {
      updateSoilData(input: $input) {
        soilData {
          ...soilData
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: soilData });
  return resp.updateSoilData.soilData!;
};

export const updateDepthDependentSoilData = async (
  depthDependentData: DepthDependentSoilDataUpdateMutationInput,
) => {
  const query = graphql(`
    mutation updateDepthDependentSoilData(
      $input: DepthDependentSoilDataUpdateMutationInput!
    ) {
      updateDepthDependentSoilData(input: $input) {
        soilData {
          ...soilData
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, {
    input: depthDependentData,
  });

  return resp.updateDepthDependentSoilData.soilData!;
};

export const updateSoilDataDepthInterval = async (
  soilData: SoilDataUpdateDepthIntervalMutationInput,
) => {
  const query = graphql(`
    mutation updateSoilDataDepthInterval(
      $input: SoilDataUpdateDepthIntervalMutationInput!
    ) {
      updateSoilDataDepthInterval(input: $input) {
        soilData {
          ...soilData
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: soilData });
  return resp.updateSoilDataDepthInterval.soilData!;
};

export const deleteSoilDataDepthInterval = async (
  soilData: SoilDataDeleteDepthIntervalMutationInput,
) => {
  const query = graphql(`
    mutation deleteSoilDataDepthInterval(
      $input: SoilDataDeleteDepthIntervalMutationInput!
    ) {
      deleteSoilDataDepthInterval(input: $input) {
        soilData {
          ...soilData
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: soilData });
  return resp.deleteSoilDataDepthInterval.soilData!;
};

export const updateProjectSoilSettings = async (
  soilSettings: ProjectSoilSettingsUpdateMutationInput,
) => {
  const query = graphql(`
    mutation updateProjectSoilSettings(
      $input: ProjectSoilSettingsUpdateMutationInput!
    ) {
      updateProjectSoilSettings(input: $input) {
        soilSettings {
          ...projectSoilSettings
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: soilSettings });
  return resp.updateProjectSoilSettings.soilSettings!;
};

export const updateProjectDepthInterval = async (
  depthInterval: ProjectSoilSettingsUpdateDepthIntervalMutationInput,
) => {
  const query = graphql(`
    mutation updateProjectSoilSettingsDepthInterval(
      $input: ProjectSoilSettingsUpdateDepthIntervalMutationInput!
    ) {
      updateProjectSoilSettingsDepthInterval(input: $input) {
        soilSettings {
          ...projectSoilSettings
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: depthInterval });
  return resp.updateProjectSoilSettingsDepthInterval.soilSettings!;
};

export const deleteProjectDepthInterval = async (
  depthInterval: ProjectSoilSettingsUpdateDepthIntervalMutationInput,
) => {
  const query = graphql(`
    mutation deleteProjectSoilSettingsDepthInterval(
      $input: ProjectSoilSettingsDeleteDepthIntervalMutationInput!
    ) {
      deleteProjectSoilSettingsDepthInterval(input: $input) {
        soilSettings {
          ...projectSoilSettings
        }
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input: depthInterval });
  return resp.deleteProjectSoilSettingsDepthInterval.soilSettings!;
};
