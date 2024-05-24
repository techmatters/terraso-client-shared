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

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setUsers } from 'terraso-client-shared/account/accountSlice';
import { setProjects } from 'terraso-client-shared/project/projectSlice';
import { setSites } from 'terraso-client-shared/site/siteSlice';
import * as soilDataService from 'terraso-client-shared/soilId/soilDataService';
import * as soilIdService from 'terraso-client-shared/soilId/soilIdService';
import {
  ProjectSoilSettings,
  SoilData,
  SoilIdParams,
  SoilIdResults,
} from 'terraso-client-shared/soilId/soilIdTypes';
import {
  createAsyncThunk,
  dispatchByKeys,
} from 'terraso-client-shared/store/utils';

export * from 'terraso-client-shared/soilId/soilIdTypes';
export * from 'terraso-client-shared/soilId/soilIdFunctions';

export type LoadingState = 'loading' | 'error' | 'ready';

export type SoilState = {
  soilData: Record<string, SoilData | undefined>;
  projectSettings: Record<string, ProjectSoilSettings | undefined>;
  status: LoadingState;

  soilIdParams: SoilIdParams;
  soilIdData: SoilIdResults;
  soilIdStatus: 'loading' | 'error' | 'ready';
};

const initialState: SoilState = {
  soilData: {},
  projectSettings: {},
  status: 'loading',

  soilIdParams: {},
  soilIdData: {
    locationBasedMatches: [],
    dataBasedMatches: [],
  },
  soilIdStatus: 'loading',
};

const soilIdSlice = createSlice({
  name: 'soilId',
  initialState,
  reducers: {
    setSoilData: (state, action: PayloadAction<Record<string, SoilData>>) => {
      state.soilData = action.payload;

      /* We clear soil ID matches based on soil data when a site's soil data changes */
      state.soilIdData.dataBasedMatches = [];
      state.soilIdParams.siteId = undefined;
    },
    updateSoilData: (
      state,
      action: PayloadAction<Record<string, SoilData>>,
    ) => {
      Object.assign(state.soilData, action.payload);
    },
    setProjectSettings: (
      state,
      action: PayloadAction<Record<string, ProjectSoilSettings>>,
    ) => {
      state.projectSettings = action.payload;
    },
    updateProjectSettings: (
      state,
      action: PayloadAction<Record<string, ProjectSoilSettings>>,
    ) => {
      Object.assign(state.projectSettings, action.payload);
    },
    setSoilIdStatus: (
      state,
      action: PayloadAction<'loading' | 'error' | 'ready'>,
    ) => {
      state.status = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(updateSoilData.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;

      /* We clear soil ID matches based on soil data when a site's soil data changes */
      state.soilIdData.dataBasedMatches = [];
      state.soilIdParams.siteId = undefined;
    });

    builder.addCase(updateDepthDependentSoilData.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;

      state.soilIdData.dataBasedMatches = [];
      state.soilIdParams.siteId = undefined;
    });

    builder.addCase(updateSoilDataDepthInterval.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;

      state.soilIdData.dataBasedMatches = [];
      state.soilIdParams.siteId = undefined;
    });

    builder.addCase(deleteSoilDataDepthInterval.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
      
      state.soilIdData.dataBasedMatches = [];
      state.soilIdParams.siteId = undefined;
    });

    builder.addCase(updateProjectSoilSettings.fulfilled, (state, action) => {
      state.projectSettings[action.meta.arg.projectId] = action.payload;
    });

    builder.addCase(updateProjectDepthInterval.fulfilled, (state, action) => {
      state.projectSettings[action.meta.arg.projectId] = action.payload;
    });

    builder.addCase(deleteProjectDepthInterval.fulfilled, (state, action) => {
      state.projectSettings[action.meta.arg.projectId] = action.payload;
    });

    builder.addCase(fetchSoilDataForUser.pending, state => {
      state.status = 'loading';
    });

    builder.addCase(fetchSoilDataForUser.rejected, state => {
      state.status = 'error';
    });

    builder.addCase(fetchSoilDataForUser.fulfilled, state => {
      state.status = 'ready';
    });

    builder.addCase(fetchSoilIdMatches.pending, (state, action) => {
      state.soilIdParams = {
        coords: action.meta.arg.coords,
        siteId: action.meta.arg.siteId,
      };
      state.soilIdData = initialState.soilIdData;
      state.soilIdStatus = 'loading';
    });

    builder.addCase(fetchSoilIdMatches.rejected, state => {
      state.soilIdStatus = 'error';
    });

    builder.addCase(fetchSoilIdMatches.fulfilled, (state, action) => {
      state.soilIdStatus = 'ready';
      state.soilIdData = action.payload;
    });
  },
});

export const {
  setProjectSettings,
  setSoilData,
  setSoilIdStatus,
  updateProjectSettings,
} = soilIdSlice.actions;

export const fetchSoilDataForUser = createAsyncThunk(
  'soilId/fetchSoilDataForUser',
  dispatchByKeys(soilDataService.fetchSoilDataForUser, () => ({
    projects: setProjects,
    sites: setSites,
    projectSoilSettings: setProjectSettings,
    soilData: setSoilData,
    users: setUsers,
  })),
);

export const updateSoilData = createAsyncThunk(
  'soilId/updateSoilData',
  soilDataService.updateSoilData,
);

export const updateDepthDependentSoilData = createAsyncThunk(
  'soilId/updateDepthDependentSoilData',
  soilDataService.updateDepthDependentSoilData,
);

export const updateSoilDataDepthInterval = createAsyncThunk(
  'soilId/updateSoilDataDepthInterval',
  soilDataService.updateSoilDataDepthInterval,
);

export const deleteSoilDataDepthInterval = createAsyncThunk(
  'soilId/deleteSoilDataDepthInterval',
  soilDataService.deleteSoilDataDepthInterval,
);

export const updateProjectSoilSettings = createAsyncThunk(
  'soilId/updateProjectSoilSettings',
  soilDataService.updateProjectSoilSettings,
);

export const updateProjectDepthInterval = createAsyncThunk(
  'soilId/updateProjectDepthInterval',
  soilDataService.updateProjectDepthInterval,
);

export const deleteProjectDepthInterval = createAsyncThunk(
  'soilId/deleteProjectDepthInterval',
  soilDataService.deleteProjectDepthInterval,
);

export const fetchSoilIdMatches = createAsyncThunk(
  'soilId/fetchSoilIdMatches',
  soilIdService.fetchSoilMatches,
);

export default soilIdSlice.reducer;
