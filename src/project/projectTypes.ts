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

import {
  ProjectManagementProjectMeasurementUnitsChoices,
  ProjectManagementProjectPrivacyChoices,
  ProjectMembershipProjectRoleChoices,
} from 'terraso-client-shared/graphqlSchema/graphql';
import { SerializableSet } from 'terraso-client-shared/store/utils';

export type ProjectMembership = {
  userId: string;
  userRole: ProjectRole;
  id: string;
};

export type ProjectRole = ProjectMembershipProjectRoleChoices;
export const PROJECT_ROLES = [
  'MANAGER',
  'CONTRIBUTOR',
  'VIEWER',
] as const satisfies readonly ProjectRole[];

export type MeasurementUnit = ProjectManagementProjectMeasurementUnitsChoices;
export const MEASUREMENT_UNITS = [
  'METRIC',
  'ENGLISH',
] as const satisfies readonly MeasurementUnit[];

export type ProjectPrivacy = ProjectManagementProjectPrivacyChoices;
export const PROJECT_PRIVACIES = [
  'PRIVATE',
  'PUBLIC',
] as const satisfies readonly ProjectPrivacy[];

export type Project = {
  id: string;
  name: string;
  privacy: ProjectPrivacy;
  measurementUnits: MeasurementUnit;
  description: string;
  siteInstructions?: string;
  updatedAt: string; // this should be Date.toLocaleDateString; redux can't serialize Dates
  memberships: Record<string, ProjectMembership>;
  sites: SerializableSet;
  archived: boolean;
};
