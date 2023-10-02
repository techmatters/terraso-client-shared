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
  ProjectAddUserMutationInput,
  ProjectArchiveMutationInput,
  ProjectDataFragment,
  ProjectDeleteMutationInput,
  ProjectUpdateMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import type {
  HydratedProject,
  Project,
  ProjectMembership,
  SerializableSet,
} from 'terraso-client-shared/project/projectSlice';
import { collapseSiteFields } from 'terraso-client-shared/site/siteService';
import { Site } from 'terraso-client-shared/site/siteSlice';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import {
  collapseConnectionEdges,
  collapseFields,
} from 'terraso-client-shared/terrasoApi/utils';

const collapseProjectFields = collapseFields<
  ProjectDataFragment,
  HydratedProject
>(
  {
    dehydrated: inp => {
      const siteIds = inp.siteSet.edges
        .map(edge => edge.node.id)
        .reduce((x, y) => ({ ...x, [y]: true }), {} as SerializableSet);
      const memberships =
        inp.membershipList.memberships?.edges
          .map(edge => edge.node)
          .reduce(
            (x, { id, user, userRole }) => {
              if (user === null || user === undefined) {
                return x;
              }
              return { ...x, [id]: { userId: user.id, userRole, id } };
            },
            {} as Record<string, ProjectMembership>,
          ) || {};

      const { siteSet: _x, membershipList: _y, updatedAt, ...rest } = inp;
      const output: Project = {
        ...rest,
        updatedAt: new Date(updatedAt).toLocaleString(),
        siteIds,
        memberships,
      };
      return output;
    },
    sites: inp =>
      inp.siteSet.edges
        .map(edge => edge.node)
        .reduce(
          (x, y) => ({ ...x, [y.id]: collapseSiteFields(y) }),
          {} as Record<string, Site>,
        ),
    users: inp =>
      inp.membershipList.memberships?.edges
        .map(({ node: { user } }) => {
          if (user === undefined || user === null) {
            return undefined;
          }
          return {
            ...user,
            preferences: {},
          };
        })
        .reduce(
          (x, y) => {
            if (y !== undefined) {
              return { ...x, [y.id]: y };
            }
            return x;
          },
          {} as Record<string, User>,
        ) || {},
  },
  true,
);

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

export const updateProject = (project: ProjectUpdateMutationInput) => {
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
    .requestGraphQL(query, { input: project })
    .then(resp => collapseProjectFields(resp.updateProject.project!));
};

export const deleteProject = (project: ProjectDeleteMutationInput) => {
  const query = graphql(`
    mutation deleteProject($input: ProjectDeleteMutationInput!) {
      deleteProject(input: $input) {
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { input: { id: project.id } })
    .then(_ => project.id);
};

export const archiveProject = (project: ProjectArchiveMutationInput) => {
  const query = graphql(`
    mutation archiveProject($input: ProjectArchiveMutationInput!) {
      archiveProject(input: $input) {
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, {
      input: { archived: project.archived, id: project.id },
    })
    .then(_ => project.archived);
};

export const addUserToProject = (input: ProjectAddUserMutationInput) => {
  const command = graphql(`
    mutation addUserToProject($input: ProjectAddUserMutationInput!) {
      addUserToProject(input: $input) {
        errors
        project {
          id
        }
        membership {
          ...projectMembershipFields
        }
      }
    }
  `);
  return terrasoApi
    .requestGraphQL(command, { input })
    .then(output => output.addUserToProject);
};
