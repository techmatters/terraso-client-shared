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
import { User } from 'terraso-client-shared/account/accountSlice';
import type {
  AccountCollaborationMembershipFragment,
  CollaborationMembershipFieldsFragment,
  CollaborationMembershipInfoFragment,
  CollaborationMembershipsFragment,
  CollaborationMembershipsPendingFragment,
} from 'terraso-client-shared/graphqlSchema/graphql';

type MembershipQuery = Partial<
  CollaborationMembershipInfoFragment &
    AccountCollaborationMembershipFragment &
    CollaborationMembershipsPendingFragment
>;

export type MembershipInfo = {
  totalCount?: number;
  pendingCount?: number;
  accountMembership?: Membership;
  memberships?: Membership[];
  enrollMethod?: string;
  membershipType?: string;
};

export type MembershipList = {
  // TODO: massage membershipsUtils/Service so more of these can be required
  membershipInfo?: MembershipInfo;
  id: string;
  slug: string;
  membershipType: 'CLOSED' | 'OPEN';
};

export type Membership = {
  membershipId: string;
  userId?: string;
  userRole?: string;
  membershipStatus?: 'APPROVED' | 'PENDING';
  user?: User;
};

export const extractMembershipInfo = (
  membershipList?: MembershipQuery | null,
): MembershipInfo => ({
  totalCount:
    membershipList?.membershipsCount ?? membershipList?.memberships?.totalCount,
  pendingCount: membershipList?.pending?.totalCount,
  accountMembership: extractAccountMembership(membershipList),
  memberships: extractMemberships(membershipList),
  enrollMethod: membershipList?.enrollMethod,
  membershipType: membershipList?.membershipType,
});

export const extractMembership = (
  membership: Partial<CollaborationMembershipFieldsFragment>,
) => ({
  ...membership,
  membershipId: membership.id,
  userId: membership.user?.id,
});

export const extractMemberships = (
  membershipList?: MembershipQuery | null,
): Membership[] =>
  (
    (
      membershipList as
        | (Partial<CollaborationMembershipsFragment> &
            Partial<CollaborationMembershipsFragment>)
        | null
        | undefined
    )?.memberships?.edges || []
  ).map(edge => extractMembership(edge.node) as Membership);

export const extractAccountMembership = (
  membershipList?: AccountCollaborationMembershipFragment | null,
): Membership | undefined =>
  membershipList?.accountMembership
    ? {
        ..._.omit('id', membershipList.accountMembership),
        membershipId: membershipList.accountMembership.id,
        userId: membershipList.accountMembership.user?.id,
        user: membershipList.accountMembership.user as User,
      }
    : undefined;
