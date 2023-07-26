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

import type { User } from 'terraso-client-shared/account/accountSlice';
import { graphql } from 'terraso-client-shared/graphqlSchema';
import type {
  ProjectAddMutationInput,
  ProjectDataFragment,
  ProjectDeleteMutationInput,
  ProjectUpdateMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import type { Project } from 'terraso-client-shared/project/projectSlice';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import {
  collapseConnectionEdges,
  collapseFields,
  UpdateArg,
  updateArgToInput,
} from 'terraso-client-shared/terrasoApi/utils';

const collapseProjectFields = collapseFields<ProjectDataFragment, Project>({
  userCount: inp => inp['group']['memberships']['totalCount'],
  updatedAt: inp => new Date(inp['updatedAt']).toLocaleDateString(),
  siteCount: inp => inp['siteSet']['totalCount'],
});

export const fetchProject = (id: string) => {
  const query = graphql(`
    query project($id: ID!) {
      project(id: $id) {
        ...projectData
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { id })
    .then(resp => collapseProjectFields(resp.project));
};

export const fetchProjectsForUser = async (_: undefined, user: User | null) => {
  if (user === null) {
    return [];
  }

  const query = graphql(`
    query userProjects($id: ID!) {
      projects(member: $id) {
        edges {
          node {
            ...projectData
          }
        }
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { id: user.id })
    .then(resp =>
      collapseConnectionEdges(resp.projects).map(collapseProjectFields),
    );
};

export const addProject = (project: ProjectAddMutationInput) => {
  const query = graphql(`
    mutation addProject($input: ProjectAddMutationInput!) {
      addProject(input: $input) {
        project {
          ...projectData
        }
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { input: project })
    .then(resp => collapseProjectFields(resp.addProject.project));
};

export const updateProject = (
  update: UpdateArg<ProjectUpdateMutationInput>,
) => {
  const query = graphql(`
    mutation updateProject($input: ProjectUpdateMutationInput!) {
      updateProject(input: $input) {
        project {
          ...projectData
        }
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, updateArgToInput(update))
    .then(resp => collapseProjectFields(resp.updateProject.project!));
};

export const deleteProject = (project: ProjectDeleteMutationInput) => {
  const query = graphql(`
    mutation deleteProject($input: ProjectDeleteMutationInput!) {
      deleteProject(input: $input) {
        project {
          id
        }
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { input: project })
    .then(({ deleteProject: { project } }) => project.id);
};
