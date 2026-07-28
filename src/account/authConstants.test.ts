/*
 * Copyright © 2026 Technology Matters
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
  DELETED_USER_ID,
  isDeletedUser,
} from 'terraso-client-shared/account/authConstants';

// Pinned against terraso-backend's DELETED_USER_ID (apps/core/models/users.py,
// also asserted in tests/graphql/test_deleted_user_stub.py). If the two drift,
// clients silently fall back to rendering the stub's English name.
test('DELETED_USER_ID matches the backend sentinel', () => {
  expect(DELETED_USER_ID).toBe('00000000-0000-0000-0000-000000000000');
});

test('isDeletedUser only matches the sentinel', () => {
  expect(isDeletedUser(DELETED_USER_ID)).toBe(true);
  expect(isDeletedUser('9f8c1e02-4b7a-4d3e-8f21-6a5b0c7d9e13')).toBe(false);
  expect(isDeletedUser('')).toBe(false);
});
