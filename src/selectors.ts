import { createSelector } from '@reduxjs/toolkit';
import { User } from 'terraso-client-shared/account/accountSlice';
import { UserRole } from 'terraso-client-shared/graphqlSchema/graphql';
import { ProjectMembership } from 'terraso-client-shared/project/projectSlice';
import { type SharedState } from 'terraso-client-shared/store/store';
import { exists, filterValues, mapValues } from 'terraso-client-shared/utils';

const selectProjectMemberships = (state: SharedState, projectId: string) =>
  state.project.projects[projectId]?.memberships ?? [];

const selectUsers = (state: SharedState) => state.account.users;

export const selectProjectMembershipsWithUsers = createSelector(
  [selectProjectMemberships, selectUsers],
  (memberships, users) =>
    Object.values(memberships)
      .filter(memb => memb.userId in users)
      .map(memb => [memb, users[memb.userId]] as [ProjectMembership, User]),
);

const selectProjects = (state: SharedState) => state.project.projects;

const selectSites = (state: SharedState) => state.site.sites;

const selectUserRole = (_state: SharedState, userRole: UserRole) => userRole;

const selectProjectsWithUserRole = createSelector(
  [selectProjects, selectUserRole],
  (projects, userRole) =>
    filterValues(projects, project =>
      exists(
        mapValues(project.memberships, membership => membership.userRole),
        userRole,
      ),
    ),
);

export const selectProjectsWithTransferrableSites = createSelector(
  [selectProjectsWithUserRole, selectSites],
  (projects, sites) => {
    return projects.flatMap(project =>
      Object.keys(project.sites)
        .filter(siteId => siteId in project.sites)
        .map(siteId => {
          const joinedSite = sites[siteId];

          return {
            projectId: project.id,
            projectName: project.name,
            siteId: joinedSite.id,
            siteName: joinedSite.name,
          };
        }),
    );
  },
);
