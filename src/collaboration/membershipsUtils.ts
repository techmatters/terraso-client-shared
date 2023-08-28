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
import _ from 'lodash/fp';
import type {
  AccountCollaborationMembershipFragment,
  CollaborationMembershipFieldsFragment,
  CollaborationMembershipsFragment,
  CollaborationMembershipsInfoFragment,
  CollaborationMembershipsPendingFragment,
} from 'terraso-client-shared/graphqlSchema/graphql';

type MembershipQuery = Partial<
  CollaborationMembershipsInfoFragment &
    AccountCollaborationMembershipFragment &
    CollaborationMembershipsPendingFragment
>;

export const extractMembershipsInfo = (
  membershipList?: MembershipQuery | null,
) => ({
  totalCount:
    membershipList?.membershipsCount ?? membershipList?.memberships?.totalCount,
  pendingCount: membershipList?.pending?.totalCount,
  accountMembership: extractAccountMembership(membershipList),
  membershipsSample: extractMemberships(membershipList),
});

export const extractMembership = (
  membership: Partial<CollaborationMembershipFieldsFragment>,
) => ({
  ...membership.user,
  ..._.omit('user', membership),
  membershipId: membership.id,
  userId: membership.user?.id,
});

export const extractMemberships = (membershipList?: MembershipQuery | null) =>
  (
    (
      membershipList as
        | (Partial<CollaborationMembershipsFragment> &
            Partial<CollaborationMembershipsFragment>)
        | null
        | undefined
    )?.memberships?.edges || []
  ).map(edge => extractMembership(edge.node));

export const extractAccountMembership = (
  membershipList?: AccountCollaborationMembershipFragment | null,
) =>
  membershipList?.accountMembership
    ? {
        ..._.omit('id', membershipList.accountMembership),
        membershipId: membershipList.accountMembership.id,
      }
    : undefined;
