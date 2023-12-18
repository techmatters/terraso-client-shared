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

import { parsePreferences } from 'terraso-client-shared/account/accountService';
import type { User } from 'terraso-client-shared/account/accountSlice';
import { graphql } from 'terraso-client-shared/graphqlSchema';
import type {
  ProjectAddMutationInput,
  ProjectAddUserMutationInput,
  ProjectArchiveMutationInput,
  ProjectDataFragment,
  ProjectDeleteMutationInput,
  ProjectDeleteUserMutationInput,
  ProjectMembershipFieldsFragment,
  ProjectUpdateMutationInput,
  ProjectUpdateUserRoleMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import { collapseSites } from 'terraso-client-shared/site/siteService';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import {
  collapseEdges,
  collapseMaps,
  collapseToSet,
  Connection,
} from 'terraso-client-shared/terrasoApi/utils';

const collapseProjectMembership = ({
  user,
  ...fields
}: ProjectMembershipFieldsFragment) => ({
  membership: { userId: user.id, ...fields },
  user: parsePreferences(user),
});

const collapseProjectMemberships = (
  connection: Connection<ProjectMembershipFieldsFragment>,
) => {
  const memberships = collapseEdges(connection).map(collapseProjectMembership);
  return {
    memberships: Object.fromEntries(
      memberships.map(({ membership }) => [membership.id, membership]),
    ),
    users: Object.fromEntries(memberships.map(({ user }) => [user.id, user])),
  };
};

export const collapseProject = ({
  membershipList,
  siteSet,
  soilSettings,
  ...project
}: ProjectDataFragment) => {
  const sites = collapseSites(siteSet);
  const { memberships, users } = collapseProjectMemberships(
    membershipList.memberships,
  );
  return {
    project: {
      ...project,
      siteInstructions: project.siteInstructions || undefined,
      sites: collapseToSet(Object.keys(sites)),
      memberships,
    },
    sites,
    users,
    soilSettings: { [project.id]: soilSettings },
  };
};

export const collapseProjects = (
  projectConnection: Connection<ProjectDataFragment>,
) => {
  const projects = collapseEdges(projectConnection).map(collapseProject);
  return {
    projects: Object.fromEntries(
      projects.map(({ project }) => [project.id, project]),
    ),
    sites: collapseMaps(...projects.map(({ sites }) => sites)),
    users: collapseMaps(...projects.map(({ users }) => users)),
  };
};

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
    .then(resp => collapseProject(resp.project));
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
    .then(resp => collapseProjects(resp.projects));
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
    .then(resp => collapseProject(resp.addProject.project));
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
    .then(resp => collapseProject(resp.updateProject.project!));
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

export const updateUserRole = (input: ProjectUpdateUserRoleMutationInput) => {
  const command = graphql(`
    mutation updateRole($input: ProjectUpdateUserRoleMutationInput!) {
      updateUserRoleInProject(input: $input) {
        project {
          id
        }
        membership {
          id
          userRole
        }
      }
    }
  `);

  return terrasoApi.requestGraphQL(command, { input }).then(
    ({
      updateUserRoleInProject: {
        project: { id: projectId },
        membership: { id: membershipId, userRole },
      },
    }) => ({
      projectId,
      membershipId,
      userRole,
    }),
  );
};

export const deleteUserFromProject = (
  input: ProjectDeleteUserMutationInput,
) => {
  const command = graphql(`
    mutation removeUser($input: ProjectDeleteUserMutationInput!) {
      deleteUserFromProject(input: $input) {
        membership {
          id
        }
        project {
          id
        }
      }
    }
  `);

  return terrasoApi.requestGraphQL(command, { input }).then(
    ({
      deleteUserFromProject: {
        project: { id: projectId },
        membership: { id: membershipId },
      },
    }) => ({
      projectId,
      membershipId,
    }),
  );
};
