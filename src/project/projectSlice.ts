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

import { createAction, createSlice } from '@reduxjs/toolkit';
import { setUsers, User } from 'terraso-client-shared/account/accountSlice';
import {
  ProjectAddMutationInput,
  ProjectUpdateMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import {
  Membership,
  setMembers,
} from 'terraso-client-shared/memberships/membershipsSlice';
import * as projectService from 'terraso-client-shared/project/projectService';
import { setSites, Site } from 'terraso-client-shared/site/siteSlice';
import { createAsyncThunk } from 'terraso-client-shared/store/utils';

export type SerializableSet = Record<string, boolean>;

export type Project = {
  id: string;
  name: string;
  privacy: 'PRIVATE' | 'PUBLIC';
  description: string;
  updatedAt: string; // this should be Date.toLocaleDateString; redux can't serialize Dates
  membershipIds: Record<string, { user: string }>; // TODO: Why doesn't the membership have user info? have to store user id here as well
  siteIds: SerializableSet;
  groupId: string;
};

export type HydratedProject = {
  project: Project;
  memberships: Record<string, Membership>;
  users: Record<string, User>;
  sites: Record<string, Site>;
};

const initialState = {
  projects: {} as Record<string, Project>,
};

interface MembershipKey {
  projectId: string;
  membershipId: string;
}

interface SiteKey {
  projectId: string;
  siteId: string;
}

export const removeMembershipFromProject = createAction<MembershipKey>(
  'project/removeMembershipFromProject',
);

export const addMembershipToProject = createAction<MembershipKey>(
  'project/addMembershipToProject',
);

export const addSiteToProject = createAction<SiteKey>(
  'project/addSiteToProject',
);

export const removeSiteFromProject = createAction<SiteKey>(
  'project/removeSiteFromProject',
);

export const removeSiteFromAllProjects = createAction<string>(
  'project/removeSiteFromAllProjects',
);

export const fetchProject = createAsyncThunk<Project, string>(
  'project/fetchProject',
  async (arg, _currentUser, { dispatch }) => {
    const { project, sites, memberships, users } =
      await projectService.fetchProject(arg);
    dispatch(setMembers(memberships));
    dispatch(setUsers(users));
    dispatch(setSites(sites));

    return project;
  },
);

export const fetchProjectsForUser = createAsyncThunk<Project[], undefined>(
  'project/fetchProjectsForUser',
  async (arg, currentUser, { dispatch }) => {
    let hydrated = await projectService.fetchProjectsForUser(arg, currentUser);
    let allSites: Record<string, Site> = {};
    let allMemberships: Record<string, Membership> = {};
    let allUsers: Record<string, User> = {};
    let projects: Project[] = [];
    for (let { project, sites, users, memberships } of hydrated) {
      allSites = { ...allSites, ...sites };
      allMemberships = { ...allMemberships, ...memberships };
      allUsers = { ...allUsers, ...users };
      projects.push(project);
    }
    dispatch(setMembers(allMemberships));
    dispatch(setUsers(allUsers));
    dispatch(setSites(allSites));
    return projects;
  },
);

export const addProject = createAsyncThunk<Project, ProjectAddMutationInput>(
  'project/addProject',
  async (arg, _currentUser, { dispatch }) => {
    const { project, sites, memberships, users } =
      await projectService.addProject(arg);
    dispatch(setMembers(memberships));
    dispatch(setUsers(users));
    dispatch(setSites(sites));
    return project;
  },
);

export const updateProject = createAsyncThunk<
  Project,
  ProjectUpdateMutationInput
>('project/updateProject', async (arg, _currentUser, { dispatch }) => {
  const { project, sites, memberships, users } =
    await projectService.updateProject(arg);
  dispatch(setMembers(memberships));
  dispatch(setUsers(users));
  dispatch(setSites(sites));
  return project;
});

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  projectService.deleteProject,
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      addSiteToProject,
      (state, { payload: { siteId, projectId } }) => {
        state.projects[projectId].siteIds[siteId] = true;
      },
    );

    builder.addCase(
      removeMembershipFromProject,
      (state, { payload: { membershipId, projectId } }) => {
        delete state.projects[projectId].membershipIds[membershipId];
      },
    );

    builder.addCase(
      removeSiteFromProject,
      (state, { payload: { siteId, projectId } }) => {
        delete state.projects[projectId].siteIds[siteId];
      },
    );

    builder.addCase(removeSiteFromAllProjects, (state, { payload: siteId }) => {
      for (let project of Object.values(state.projects)) {
        if (siteId in project.siteIds) {
          delete project.siteIds[siteId];
        }
      }
    });

    // TODO: add case to delete project if not found
    builder.addCase(fetchProject.fulfilled, (state, { payload: project }) => {
      state.projects[project.id] = project;
    });

    builder.addCase(
      fetchProjectsForUser.fulfilled,
      (state, { payload: projects }) => {
        Object.assign(
          state.projects,
          Object.fromEntries(projects.map(project => [project.id, project])),
        );
      },
    );

    builder.addCase(addProject.fulfilled, (state, { payload: project }) => {
      state.projects[project.id] = project;
    });

    builder.addCase(updateProject.fulfilled, (state, { payload: project }) => {
      state.projects[project.id] = project;
    });

    builder.addCase(deleteProject.fulfilled, (state, { meta }) => {
      delete state.projects[meta.arg.id];
    });
  },
});

export default projectSlice.reducer;
