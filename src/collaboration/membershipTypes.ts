export type MembershipList = {
  // TODO: massage membershipsUtils/Service so more of these can be required
  membershipsInfo?: {
    totalCount?: number;
    pendingCount?: number;
    accountMembership?: Membership;
    membersSample?: Membership[];
  };
  id: string;
  slug: string;
  membershipType: 'CLOSED' | 'OPEN';
};

export type Membership = {
  membershipId: string;
  membershipStatus: 'APPROVED' | 'PENDING';
};
