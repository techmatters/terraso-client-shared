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

import { createSlice } from '@reduxjs/toolkit';
import * as projectService from 'terraso-client-shared/project/projectService';
import { createAsyncThunk } from 'terraso-client-shared/store/utils';

export type Project = {
  id: string;
  name: string;
  privacy: 'PRIVATE' | 'PUBLIC';
  description: string;
};

const initialState = {
  projects: {} as Record<string, Project>,
};

export const fetchProject = createAsyncThunk(
  'project/fetchProject',
  projectService.fetchProject
);

export const fetchProjectsForUser = createAsyncThunk(
  'project/fetchProjectsForUser',
  projectService.fetchProjectsForUser
);

export const addProject = createAsyncThunk(
  'project/addProject',
  projectService.addProject
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  projectService.updateProject
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  projectService.deleteProject
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // TODO: add case to delete project if not found
    builder.addCase(fetchProject.fulfilled, (state, { payload: project }) => {
      state.projects[project.id] = project;
    });

    builder.addCase(
      fetchProjectsForUser.fulfilled,
      (state, { payload: projects }) => {
        state.projects = Object.fromEntries(
          projects.map(project => [project.id, project])
        );
      }
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
