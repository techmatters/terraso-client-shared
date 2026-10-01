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

import {
  setCurrentUser,
  setHasToken,
} from 'terraso-client-shared/account/accountActions';
import * as accountService from 'terraso-client-shared/account/accountService';
import { removeToken } from 'terraso-client-shared/account/auth';
import logger from 'terraso-client-shared/monitoring/logger';
import type { SharedDispatch } from 'terraso-client-shared/store/store';

export const signOut = () => (dispatch: SharedDispatch) => {
  accountService.signOut().catch(error => {
    logger.error('Failed to execute API signout request', error);
  });
  removeToken();
  dispatch(setHasToken(false));
  dispatch(setCurrentUser(null));
};
