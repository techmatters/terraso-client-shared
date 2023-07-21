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

export const addSite = createAsyncThunk('site/addSite', siteService.addSite);

export const updateSite = createAsyncThunk(
  'site/updateSite',
  siteService.updateSite,
);

export const deleteSite = createAsyncThunk(
  'site/deleteSite',
  siteService.deleteSite,
);

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {},
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
  },
});

export default siteSlice.reducer;
