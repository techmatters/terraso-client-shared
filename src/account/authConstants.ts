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

// Sentinel id used by the backend `deleted_user_stub()` resolver for
// SiteNote.author and Site.owner when the underlying FK is null (the
// authoring user has been soft-deleted via UserDeleteMutation).
// New clients import this and substitute a localized label; old
// clients fall through to formatFullName which renders "Deleted User"
// in English from the stub's firstName/lastName fields.
//
// See deleted_user_stub_plan.md in terraso-backend-research.
export const DELETED_USER_ID = '00000000-0000-0000-0000-000000000000';

export const isDeletedUser = (
  user: { id?: string | null } | null | undefined,
): boolean => !!user && user.id === DELETED_USER_ID;
