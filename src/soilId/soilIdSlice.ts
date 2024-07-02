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
import {
  soilIdEntryDataBased,
  soilIdEntryForStatus,
  soilIdEntryLocationBased,
  soilIdKey,
} from 'terraso-client-shared/soilId/soilIdFunctions';
import * as soilIdService from 'terraso-client-shared/soilId/soilIdService';
import {
  CollectionMethod,
  DisabledCollectionMethod,
  LoadingState,
  ProjectSoilSettings,
  SoilData,
  SoilIdEntry,
  SoilIdKey,
} from 'terraso-client-shared/soilId/soilIdTypes';
import {
  createAsyncThunk,
  dispatchByKeys,
} from 'terraso-client-shared/store/utils';

export * from 'terraso-client-shared/soilId/soilIdTypes';
export * from 'terraso-client-shared/soilId/soilIdFunctions';

export type MethodRequired<
  T extends CollectionMethod | DisabledCollectionMethod,
> = `${T}Required`;

export type SoilState = {
  soilData: Record<string, SoilData | undefined>;
  projectSettings: Record<string, ProjectSoilSettings | undefined>;
  status: LoadingState;

  matches: Record<SoilIdKey, SoilIdEntry>;
  usages: Record<SoilIdKey, number>;
};

const initialState: SoilState = {
  soilData: {},
  projectSettings: {},
  status: 'loading',

  matches: {},
  usages: {},
};

const soilIdSlice = createSlice({
  name: 'soilId',
  initialState,
  reducers: {
    setSoilData: (state, action: PayloadAction<Record<string, SoilData>>) => {
      state.soilData = action.payload;
      state.matches = {};
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
    claimKey: (state, action: PayloadAction<SoilIdKey>) => {
      /* When a cache key is claimed, we increment a counter for that key. */
      const key = action.payload;
      state.usages[key] = (state.usages[key] ?? 0) + 1;
    },
    releaseKey: (state, action: PayloadAction<SoilIdKey>) => {
      /*
       * When a cache key is released, we check to see if it is no longer in use.
       * If no more usages exist, we remove it from the matches cache.
       */
      const key = action.payload;
      if (key in state.usages) {
        const count = Math.max(0, state.usages[key] - 1);
        if (count === 0) {
          delete state.matches[key];
        }
        state.usages[key] = count;
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(updateSoilData.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
      flushDataBasedMatches(state);
    });

    builder.addCase(updateDepthDependentSoilData.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
      flushDataBasedMatches(state);
    });

    builder.addCase(updateSoilDataDepthInterval.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
      flushDataBasedMatches(state);
    });

    builder.addCase(deleteSoilDataDepthInterval.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
      flushDataBasedMatches(state);
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

    builder.addCase(fetchLocationBasedSoilMatches.pending, (state, action) => {
      const key = soilIdKey(action.meta.arg);
      state.matches[key] = soilIdEntryForStatus('loading');
    });

    builder.addCase(fetchLocationBasedSoilMatches.rejected, (state, action) => {
      const key = soilIdKey(action.meta.arg);
      state.matches[key] = soilIdEntryForStatus('error');
    });

    builder.addCase(
      fetchLocationBasedSoilMatches.fulfilled,
      (state, action) => {
        const key = soilIdKey(action.meta.arg);
        if (action.payload.__typename === 'SoilIdFailure') {
          state.matches[key] = soilIdEntryForStatus(action.payload.reason);
        } else {
          state.matches[key] = soilIdEntryLocationBased(action.payload.matches);
        }
      },
    );

    builder.addCase(fetchDataBasedSoilMatches.pending, (state, action) => {
      const key = soilIdKey(action.meta.arg.coords, action.meta.arg.siteId);
      state.matches[key] = soilIdEntryForStatus('loading');
    });

    builder.addCase(fetchDataBasedSoilMatches.rejected, (state, action) => {
      const key = soilIdKey(action.meta.arg.coords, action.meta.arg.siteId);
      state.matches[key] = soilIdEntryForStatus('error');
    });

    builder.addCase(fetchDataBasedSoilMatches.fulfilled, (state, action) => {
      const key = soilIdKey(action.meta.arg.coords, action.meta.arg.siteId);
      if (action.payload.__typename === 'SoilIdFailure') {
        state.matches[key] = soilIdEntryForStatus(action.payload.reason);
      } else {
        state.matches[key] = soilIdEntryDataBased(action.payload.matches);
      }
    });
  },
});

const flushDataBasedMatches = (state: SoilState) => {
  /*
   * When soil ID input data changes (e.g. samples, intervals), we clear any
   * cached entries that are data-based since they aren't valid anymore.
   */
  Object.keys(state.matches)
    .filter(key => state.matches[key as SoilIdKey].dataBasedMatches?.length)
    .forEach(key => delete state.matches[key as SoilIdKey]);
};

export const {
  setProjectSettings,
  setSoilData,
  setSoilIdStatus,
  updateProjectSettings,
  claimKey,
  releaseKey,
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

export const fetchLocationBasedSoilMatches = createAsyncThunk(
  'soilId/fetchLocationBasedSoilMatches',
  soilIdService.fetchLocationBasedSoilMatches,
);

export const fetchDataBasedSoilMatches = createAsyncThunk(
  'soilId/fetchDataBasedSoilMatches',
  soilIdService.fetchDataBasedSoilMatches,
);

export default soilIdSlice.reducer;
