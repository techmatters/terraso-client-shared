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

export const UNAUTHENTICATED = 'UNAUTHENTICATED';

// terraso-backend returns an in-memory User stub with this id (and the English
// name "Deleted User") in place of null when a record's author has been
// deleted, so the schema's non-null `author` contract still holds. Must
// stay in sync with DELETED_USER_ID in apps/core/models/users.py; drift is
// silent, so both sides pin the literal in a test.
export const DELETED_USER_ID = '00000000-0000-0000-0000-000000000000';

// Callers substitute their own localized label — the stub's name is English.
export const isDeletedUser = (id: string) => id === DELETED_USER_ID;
