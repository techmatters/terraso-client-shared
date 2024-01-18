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
import type {
  DepthDependentSoilDataNode,
  DepthInterval,
  ProjectDepthIntervalNode,
  ProjectSoilSettingsNode,
  SoilDataDepthIntervalNode,
  SoilDataNode,
} from 'terraso-client-shared/graphqlSchema/graphql';
import { setProjects } from 'terraso-client-shared/project/projectSlice';
import { setSites } from 'terraso-client-shared/site/siteSlice';
import * as soilIdService from 'terraso-client-shared/soilId/soilIdService';
import {
  createAsyncThunk,
  dispatchByKeys,
} from 'terraso-client-shared/store/utils';

export const soilPitMethods = [
  'soilTexture',
  'soilColor',
  'carbonates',
  'ph',
  'soilOrganicCarbonMatter',
  'electricalConductivity',
  'sodiumAdsorptionRatio',
  'soilStructure',
] as const;
export const collectionMethods = [
  'slope',
  'verticalCracking',
  ...soilPitMethods,
  'landUseLandCover',
  'soilLimitations',
  'photos',
  'notes',
] as const;

export type SoilPitMethod = (typeof soilPitMethods)[number];
export type CollectionMethod = (typeof collectionMethods)[number];

export const methodEnabled = <T extends SoilPitMethod>(
  method: T,
): `${T}Enabled` => `${method}Enabled`;

export const methodRequired = <T extends CollectionMethod>(
  method: T,
): `${T}Required` => `${method}Required`;

export { DepthInterval };
export type LabelledDepthInterval = {
  label: string;
  depthInterval: DepthInterval;
};
export type SoilDataDepthInterval = Omit<SoilDataDepthIntervalNode, 'site'>;
export type DepthDependentSoilData = Omit<DepthDependentSoilDataNode, 'site'>;
export type SoilData = Omit<
  SoilDataNode,
  'site' | 'depthIntervals' | 'depthDependentData'
> & {
  depthIntervals: SoilDataDepthInterval[];
  depthDependentData: DepthDependentSoilData[];
};
export type ProjectDepthInterval = Omit<ProjectDepthIntervalNode, 'project'>;
export type ProjectSoilSettings = Omit<
  ProjectSoilSettingsNode,
  'project' | 'depthIntervals'
> & {
  depthIntervals: ProjectDepthInterval[];
};

type SoilState = {
  soilData: Record<string, SoilData>;
  projectSettings: Record<string, ProjectSoilSettings>;
  status: 'loading' | 'error' | 'ready';
};

const initialState: SoilState = {
  soilData: {},
  projectSettings: {},
  status: 'loading',
};

export const sameDepth =
  (a: { depthInterval: DepthInterval }) =>
  (b: { depthInterval: DepthInterval }) =>
    a.depthInterval.start === b.depthInterval.start &&
    a.depthInterval.end === b.depthInterval.end;

const soilIdSlice = createSlice({
  name: 'soilId',
  initialState,
  reducers: {
    setSoilData: (state, action: PayloadAction<Record<string, SoilData>>) => {
      state.soilData = action.payload;
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
    });

    builder.addCase(updateDepthDependentSoilData.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
    });

    builder.addCase(updateSoilDataDepthInterval.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
    });

    builder.addCase(
      updateSoilDataDepthIntervalAsync.pending,
      (state, action) => {
        const currentState = state.soilData[action.meta.arg.siteId];
        const update = Object.fromEntries(
          Object.entries(action.meta.arg).filter(
            ([key, result]) => result !== null && key !== 'siteId',
          ),
        );
        const index = currentState.depthIntervals.findIndex(
          a => a.depthInterval.start === action.meta.arg.depthInterval.start,
        );

        const interval =
          state.soilData[action.meta.arg.siteId].depthIntervals[index];
        state.soilData[action.meta.arg.siteId].depthIntervals[index] = {
          ...interval,
          ...update,
        };
      },
    );

    builder.addCase(
      updateSoilDataDepthIntervalAsync.rejected,
      (state, action) => {
        state.status = 'error';
        const currentState = state.soilData[action.meta.arg.siteId];
        const reverseUpdate = Object.fromEntries(
          Object.entries(action.meta.arg)
            .filter(([, result]) => typeof result === 'boolean')
            .map(([key, result]) => [key, !result]),
        );
        const index = currentState.depthIntervals.findIndex(
          a => a.depthInterval.start === action.meta.arg.depthInterval.start,
        );
        const interval =
          state.soilData[action.meta.arg.siteId].depthIntervals[index];
        state.soilData[action.meta.arg.siteId].depthIntervals[index] = {
          ...interval,
          ...reverseUpdate,
        };
      },
    );

    builder.addCase(deleteSoilDataDepthInterval.fulfilled, (state, action) => {
      state.soilData[action.meta.arg.siteId] = action.payload;
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
  dispatchByKeys(soilIdService.fetchSoilDataForUser, {
    projects: setProjects,
    sites: setSites,
    projectSoilSettings: setProjectSettings,
    soilData: setSoilData,
    users: setUsers,
  }),
);

export const updateSoilData = createAsyncThunk(
  'soilId/updateSoilData',
  soilIdService.updateSoilData,
);

export const updateDepthDependentSoilData = createAsyncThunk(
  'soilId/updateDepthDependentSoilData',
  soilIdService.updateDepthDependentSoilData,
);

export const updateSoilDataDepthInterval = createAsyncThunk(
  'soilId/updateSoilDataDepthInterval',
  soilIdService.updateSoilDataDepthInterval,
);

export const updateSoilDataDepthIntervalAsync = createAsyncThunk(
  'soilId/updateSoilDataDepthIntervalAsync',
  soilIdService.updateSoilDataDepthInterval,
);

export const deleteSoilDataDepthInterval = createAsyncThunk(
  'soilId/deleteSoilDataDepthInterval',
  soilIdService.deleteSoilDataDepthInterval,
);

export const updateProjectSoilSettings = createAsyncThunk(
  'soilId/updateProjectSoilSettings',
  soilIdService.updateProjectSoilSettings,
);

export const updateProjectDepthInterval = createAsyncThunk(
  'soilId/updateProjectDepthInterval',
  soilIdService.updateProjectDepthInterval,
);

export const deleteProjectDepthInterval = createAsyncThunk(
  'soilId/deleteProjectDepthInterval',
  soilIdService.deleteProjectDepthInterval,
);

export default soilIdSlice.reducer;
