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
import {
  SiteAddMutationInput,
  SiteTransferMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import {
  addSiteToProject,
  removeSiteFromAllProjects,
  removeSiteFromProject,
} from 'terraso-client-shared/project/projectSlice';
import * as siteService from 'terraso-client-shared/site/siteService';
import { createAsyncThunk } from 'terraso-client-shared/store/utils';

export type SitePrivacy = 'PRIVATE' | 'PUBLIC';

export type Site = {
  projectId?: string;
  ownerId?: string;
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  privacy: SitePrivacy;
  archived: boolean;
  updatedAt: string;
};

const initialState = {
  sites: {} as Record<string, Site>,
};

export const fetchSite = createAsyncThunk(
  'site/fetchSite',
  siteService.fetchSite,
);

export const fetchSitesForProject = createAsyncThunk(
  'site/fetchSitesForProject',
  siteService.fetchSitesForProject,
);

export const fetchSitesForUser = createAsyncThunk(
  'site/fetchSitesForUser',
  siteService.fetchSitesForUser,
);

export const addSite = createAsyncThunk<Site, SiteAddMutationInput>(
  'site/addSite',
  async (site, _, { dispatch }) => {
    let res = await siteService.addSite(site);
    if (site.projectId) {
      dispatch(addSiteToProject({ siteId: res.id, projectId: site.projectId }));
    }
    return res;
  },
);

export const updateSite = createAsyncThunk(
  'site/updateSite',
  siteService.updateSite,
);

export const deleteSite = createAsyncThunk<string, Site>(
  'site/deleteSite',
  async (site, _currentUser, { dispatch }) => {
    const result = await siteService.deleteSite(site);
    dispatch(removeSiteFromAllProjects(site.id));
    return result;
  },
);

export const transferSites = createAsyncThunk<
  Awaited<ReturnType<typeof siteService.transferSitesToProject>>,
  SiteTransferMutationInput
>('site/transferSites', async (input, _currentUser, { dispatch }) => {
  const result = await siteService.transferSitesToProject(input);
  for (const { siteId, oldProjectId } of result.updated) {
    if (oldProjectId !== undefined) {
      dispatch(removeSiteFromProject({ siteId, projectId: oldProjectId }));
    }
    dispatch(addSiteToProject({ siteId, projectId: result.projectId }));
  }
  return result;
});

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setSites: (state, { payload }: PayloadAction<Record<string, Site>>) => {
      state.sites = payload;
    },
    updateSites: (state, { payload }: PayloadAction<Record<string, Site>>) => {
      Object.assign(state.sites, payload.sites);
    },
  },
  extraReducers: builder => {
    // TODO: add case to delete site if not found
    builder.addCase(fetchSite.fulfilled, (state, { payload: site }) => {
      state.sites[site.id] = site;
    });

    // TODO: add case to delete project sites if project not found
    builder.addCase(
      fetchSitesForProject.fulfilled,
      (state, { payload: sites, meta: { arg: projectId } }) => {
        Object.values(state.sites)
          .filter(site => site.projectId === projectId)
          .forEach(site => {
            delete state.sites[site.id];
          });
        Object.assign(
          state.sites,
          Object.fromEntries(sites.map(site => [site.id, site])),
        );
      },
    );

    builder.addCase(
      fetchSitesForUser.fulfilled,
      (state, { payload: sites }) => {
        state.sites = Object.fromEntries(sites.map(site => [site.id, site]));
      },
    );

    builder.addCase(addSite.fulfilled, (state, { payload: site }) => {
      state.sites[site.id] = site;
    });

    builder.addCase(updateSite.fulfilled, (state, { payload: site }) => {
      state.sites[site.id] = site;
    });

    builder.addCase(deleteSite.fulfilled, (state, { meta }) => {
      delete state.sites[meta.arg.id];
    });

    builder.addCase(
      transferSites.fulfilled,
      (state, { payload: { projectId, updated } }) => {
        for (const { siteId } of updated) {
          state.sites[siteId].projectId = projectId;
        }
      },
    );
  },
});

export const { setSites, updateSites } = siteSlice.actions;
export default siteSlice.reducer;
