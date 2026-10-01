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

import { createAction } from '@reduxjs/toolkit';
import type { User } from 'terraso-client-shared/account/accountTypes';

// Leaf-level action creators for account state, so that modules which must
// not import accountSlice (signOut, store/utils) can update it without
// creating an import cycle. Handled by accountSlice's extraReducers; the
// type strings intentionally match the actions createSlice previously
// generated so the action wire format is unchanged.
export const setHasToken = createAction<boolean>('user/setHasToken');
export const setCurrentUser = createAction<User | null>('user/setCurrentUser');
