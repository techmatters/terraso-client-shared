import { createSelector } from '@reduxjs/toolkit';
import { User } from 'terraso-client-shared/account/accountSlice';
import { UserRole } from 'terraso-client-shared/graphqlSchema/graphql';
import {
  Project,
  ProjectMembership,
} from 'terraso-client-shared/project/projectSlice';
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

const createUserRoleMap = (
  projects: Record<string, Project>,
  userId?: string,
) => {
  return Object.fromEntries(
    mapValues(projects, project => {
      if (userId === undefined) {
        return {};
      }
      const membership = Object.values(project.memberships).find(
        ({ userId: membUserId }) => membUserId === userId,
      );
      if (membership) {
        return [project.id, membership.userRole];
      }
    }).filter((item): item is [string, UserRole] => item !== undefined),
  );
};

const selectCurrentUserID = (state: SharedState) =>
  state.account.currentUser?.data?.id;

export const selectProjectUserRolesMap = createSelector(
  [selectCurrentUserID, selectProjects],
  (currentUserID, projects) => createUserRoleMap(projects, currentUserID),
);

export const selectSitesAndUserRoles = createSelector(
  [selectCurrentUserID, selectProjects, selectSites],
  (userID, projects, sites) => {
    const userRoleMap = createUserRoleMap(projects, userID);
    return Object.fromEntries(
      mapValues(sites, site => {
        let role = undefined;
        if (site.projectId !== undefined) {
          role = userRoleMap[site.projectId];
        }
        return [site.id, role];
      }),
    );
  },
);

export const selectProjectsWithTransferrableSites = createSelector(
  [selectProjectsWithUserRole, selectSites],
  (projects, sites) => {
    const projectSites = projects.flatMap(project =>
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

    const unaffiliatedSites = Object.values(sites)
      .filter(({ projectId }) => projectId === undefined)
      .map(({ id, name }) => ({ siteId: id, siteName: name }));
    const projectRecord = projects.reduce(
      (x, { id, name }) => ({
        ...x,
        [id]: { projectId: id, projectName: name },
      }),
      {} as Record<string, { projectId: string; projectName: string }>,
    );
    return { projects: projectRecord, sites: projectSites, unaffiliatedSites };
  },
);

// Note on "site" kind: In the future, there will also be site level roles, like manager and viewer
// For now we only care if a user owns a site or not.
export type SiteUserRole =
  | { kind: 'site'; role: 'owner' }
  | { kind: 'project'; role: UserRole };

const selectSiteId = (_state: any, siteId: string) => siteId;

export const selectUserRoleSite = createSelector(
  [selectSites, selectProjects, selectSiteId, selectCurrentUserID],
  (sites, projects, siteId, userId): SiteUserRole | null => {
    const site = sites[siteId];
    if (!site) {
      return null;
    }
    if (site.ownerId === userId) {
      return { kind: 'site', role: 'owner' };
    }
    if (site.projectId === undefined) {
      return null;
    }
    const project = projects[site.projectId];
    const membership = Object.values(project.memberships).find(
      ({ userId: projectUserId }) => userId === projectUserId,
    );
    if (membership === undefined) {
      return null;
    }
    return { kind: 'project', role: membership.userRole };
  },
);
