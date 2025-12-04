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

import 'terraso-client-shared/account/accountSlice'; // necessary to avoid circular dependency issue

import {
  Middleware,
  StateFromReducersMapObject,
  Store,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import _ from 'lodash/fp';
import accountReducer from 'terraso-client-shared/account/accountSlice';
import notificationsReducer from 'terraso-client-shared/notifications/notificationsSlice';

export const handleAbortMiddleware: Middleware = () => next => action => {
  if (_.getOr(false, 'meta.aborted', action)) {
    if (
      action instanceof Object &&
      'type' in action &&
      typeof action.type === 'string'
    ) {
      next({
        ...action,
        type: action?.type?.replace('rejected', 'aborted'),
      });
    } else {
      next(action);
    }
    return;
  }
  next(action);
};

export const sharedReducers = {
  account: accountReducer,
  notifications: notificationsReducer,
};

// Using some advanced TypeScript features here: since we have
// a store factory instead of a store we need to get our dispatch and state
// types from the return type of the store factory instead of from the store
// directly as normal. background reading:
// https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-state-type
export type StateFromStoreFactory<T extends (_: any) => Store> = ReturnType<
  ReturnType<T>['getState']
>;
export type DispatchFromStoreFactory<T extends (_: any) => Store> =
  ReturnType<T>['dispatch'];

export type SharedState = StateFromReducersMapObject<typeof sharedReducers>;
export type SharedDispatch = ThunkDispatch<
  SharedState,
  undefined,
  UnknownAction
>;
