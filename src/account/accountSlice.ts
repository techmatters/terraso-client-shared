/*
 * Copyright © 2021-2023 Technology Matters
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

import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash/fp';
import * as accountService from 'terraso-client-shared/account/accountService';
import { getToken, removeToken } from 'terraso-client-shared/account/auth';
import logger from 'terraso-client-shared/monitoring/logger';
import type { SharedDispatch } from 'terraso-client-shared/store/store';
import { createAsyncThunk } from 'terraso-client-shared/store/utils';

export const initialState = {
  currentUser: {
    fetching: true,
    data: null as User | null,
  },
  profile: {
    fetching: true,
    data: null as User | null,
  },
  login: {
    urls: {},
    fetching: true,
  },
  hasToken: typeof getToken() === 'string',
  preferences: {
    saving: false,
    success: false,
    error: null,
  },
  unsubscribe: {
    processing: false,
    success: false,
    error: null,
  },
  users: {} as Record<string, User>,
};

type AccountState = typeof initialState;

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  preferences: Record<string, string>;
};

export const setHasAccessTokenAsync = createAsyncThunk(
  'account/setHasAccessTokenAsync',
  () => getToken(),
);

export const fetchUser = createAsyncThunk(
  'account/fetchUser',
  accountService.fetchUser,
);
export const fetchProfile = createAsyncThunk(
  'account/fetchProfile',
  accountService.fetchProfile,
);
export const saveUser = createAsyncThunk(
  'account/saveUser',
  accountService.saveUser,
  () => ({
    severity: 'success',
    content: 'account.save_success',
  }),
);
export const fetchAuthURLs = createAsyncThunk(
  'account/fetchAuthURLs',
  accountService.getAuthURLs,
);
export const savePreference = createAsyncThunk(
  'account/savePreference',
  accountService.savePreference,
  null,
  false,
);
export const unsubscribeFromNotifications = createAsyncThunk(
  'account/unsubscribeFromNotifications',
  accountService.unsubscribeFromNotifications,
  null,
  false,
);

export const checkUserInProject = createAsyncThunk(
  'account/checkUserInProject',
  accountService.checkUserInProject,
);

export const setUsers = (
  state: Draft<AccountState>,
  users: Record<string, User>,
) => {
  state.users = users;
};
export const updateUsers = (
  state: Draft<AccountState>,
  users: Record<string, User>,
) => {
  Object.assign(state.users, users);
};

export const addUser = (state: Draft<AccountState>, user: User) => {
  state.users[user.id] = user;
};

export const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => ({
      ...state,
      currentUser: {
        data: action.payload,
        fetching: false,
      },
    }),
    setHasToken: (state, action: PayloadAction<boolean>) => ({
      ...state,
      hasToken: action.payload,
    }),
  },

  extraReducers: builder => {
    builder.addCase(setHasAccessTokenAsync.fulfilled, (state, action) => ({
      ...state,
      hasToken: action.payload !== undefined,
    }));

    builder.addCase(saveUser.pending, state => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        fetching: true,
      },
    }));

    builder.addCase(saveUser.fulfilled, (state, action) => ({
      ...state,
      currentUser: {
        fetching: false,
        data: action.payload,
      },
    }));

    builder.addCase(saveUser.rejected, state => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        fetching: false,
      },
    }));

    builder.addCase(savePreference.fulfilled, (state, action) => ({
      ...state,
      preferences: {
        saving: false,
        success: true,
        error: null,
      },
      currentUser: {
        fetching: false,
        data: _.set(
          ['preferences', action.payload.key],
          action.payload.value,
          state.currentUser.data as User,
        ),
      },
    }));

    builder.addCase(
      savePreference.pending,
      _.set('preferences', {
        saving: true,
        success: false,
        error: null,
      }),
    );

    builder.addCase(savePreference.rejected, (state, action) =>
      _.set(
        'preferences',
        {
          saving: false,
          success: false,
          error: action.payload,
        },
        state,
      ),
    );

    builder.addCase(fetchUser.pending, state => ({
      ...state,
      currentUser: initialState.currentUser,
    }));

    builder.addCase(fetchUser.fulfilled, (state, action) => ({
      ...state,
      currentUser: {
        fetching: false,
        data: action.payload,
      },
    }));

    builder.addCase(fetchUser.rejected, state => ({
      ...state,
      currentUser: {
        fetching: false,
        data: null,
      },
    }));

    builder.addCase(fetchProfile.pending, state => ({
      ...state,
      profile: initialState.profile,
    }));

    builder.addCase(fetchProfile.fulfilled, (state, action) => ({
      ...state,
      profile: {
        fetching: false,
        data: action.payload,
      },
    }));

    builder.addCase(fetchProfile.rejected, state => ({
      ...state,
      profile: {
        fetching: false,
        data: null,
      },
    }));

    builder.addCase(fetchAuthURLs.pending, state => ({
      ...state,
      login: initialState.login,
    }));

    builder.addCase(fetchAuthURLs.fulfilled, (state, action) => ({
      ...state,
      login: {
        fetching: false,
        urls: action.payload,
      },
    }));

    builder.addCase(fetchAuthURLs.rejected, state => ({
      ...state,
      login: {
        fetching: false,
        urls: {},
      },
    }));

    builder.addCase(
      unsubscribeFromNotifications.pending,
      _.set('unsubscribe', { processing: true, success: false, error: null }),
    );
    builder.addCase(unsubscribeFromNotifications.rejected, (state, action) =>
      _.set(
        'unsubscribe',
        { processing: false, success: false, error: action.payload },
        state,
      ),
    );
    builder.addCase(
      unsubscribeFromNotifications.fulfilled,
      _.set('unsubscribe', { processing: false, success: true, error: null }),
    );

    builder.addCase(checkUserInProject.fulfilled, (state, action) => {
      // TODO: Client should not be able to access other users' preferences
      // https://github.com/techmatters/terraso-client-shared/issues/1030 and
      // https://github.com/techmatters/terraso-backend/issues/1548
      if (!('type' in action.payload)) {
        const user = { ...action.payload, preferences: {} } as User;
        addUser(state, user);
      }
    });
  },
});

export const { setCurrentUser, setHasToken } = userSlice.actions;

export default userSlice.reducer;

export const signOut = () => (dispatch: SharedDispatch) => {
  accountService.signOut().catch(error => {
    logger.error('Failed to execute API signout request', error);
  });
  removeToken();
  dispatch(setHasToken(false));
  dispatch(setCurrentUser(null));
};
