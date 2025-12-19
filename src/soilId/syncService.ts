/*
 * Copyright © 2025 Technology Matters
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
import { collapseProjects } from 'terraso-client-shared/project/projectService';
import { collapseSites } from 'terraso-client-shared/site/siteService';
import type { UserDataPushInput } from 'terraso-client-shared/soilId/soilIdTypes';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import {
  collapseEdges,
  collapseMaps,
} from 'terraso-client-shared/terrasoApi/utils';

export const pullUserData = async (userId: string) => {
  const query = graphql(`
    query userSoilData($id: ID!) {
      allExportTokens {
        token
        resourceType
        resourceId
      }
      userSites: sites(owner: $id) {
        edges {
          node {
            ...siteData
            soilData {
              ...soilData
            }
            soilMetadata {
              ...soilMetadata
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
                  soilMetadata {
                    ...soilMetadata
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

  const {
    allExportTokens,
    userSites,
    projects: allProjects,
  } = await terrasoApi.requestGraphQL(query, { id: userId });

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
    soilMetadata: Object.fromEntries(
      allSites.map(({ soilMetadata, id }) => [id, soilMetadata]),
    ),
    exportTokens: allExportTokens ?? [],
  };
};

// Note: Return type is almost UserDataPushPayload except that `site` is not in SoilDataNode
export const pushUserData = async (input: UserDataPushInput) => {
  const query = graphql(`
    mutation pushUserData($input: UserDataPushInput!) {
      pushUserData(input: $input) {
        soilDataResults {
          siteId
          result {
            ...soilDataPushEntryResult
          }
        }
        soilMetadataResults {
          siteId
          result {
            ...soilMetadataPushEntryResult
          }
        }
        errors
        clientMutationId
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input });
  return resp.pushUserData;
};
