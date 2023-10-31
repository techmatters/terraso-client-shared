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

export const projectMembershipFields = /* GraphQL */ `
  fragment projectMembershipFields on ProjectMembershipNode {
    id
    userRole
    user {
      ...userFields
      ...userPreferences
    }
  }
`;

export const projectMembershipList = /* GraphQL */ `
  fragment projectMembershipList on ProjectMembershipListNode {
    memberships {
      totalCount
      edges {
        node {
          ...projectMembershipFields
        }
      }
    }
  }
`;

export const projectData = /* GraphQL */ `
  fragment projectData on ProjectNode {
    id
    name
    privacy
    description
    siteInstructions
    updatedAt
    archived
    measurementUnits
    membershipList {
      ...projectMembershipList
    }
    siteSet {
      edges {
        node {
          ...siteData
        }
      }
    }
  }
`;
