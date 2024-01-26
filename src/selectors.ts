import { createSelector } from '@reduxjs/toolkit';
import { User } from 'terraso-client-shared/account/accountSlice';
import { PRESETS } from 'terraso-client-shared/constants';
import {
  DepthInterval,
  UserRole,
} from 'terraso-client-shared/graphqlSchema/graphql';
import {
  Project,
  ProjectMembership,
} from 'terraso-client-shared/project/projectSlice';
import {
  checkOverlap,
  LabelOptional,
  methodEnabled,
  methodRequired,
  ProjectDepthInterval,
  ProjectSoilSettings,
  sameDepth,
  SoilData,
  SoilDataDepthInterval,
  SoilPitMethod,
  soilPitMethods,
} from 'terraso-client-shared/soilId/soilIdSlice';
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

const selectProjectId = (_state: SharedState, projectId: string) => projectId;

export const selectUserRoleProject = createSelector(
  [selectProjects, selectCurrentUserID, selectProjectId],
  (projects, userId, projectId) => {
    const project = projects[projectId];
    if (project === undefined) {
      return null;
    }
    const membership = Object.values(project.memberships).find(
      ({ userId: projectUserId }) => userId === projectUserId,
    );
    if (membership === undefined) {
      return null;
    }
    return membership.userRole;
  },
);

const generateProjectIntervals = (settings: ProjectSoilSettings) => {
  let depthIntervals: LabelOptional<ProjectDepthInterval>[] | undefined;
  switch (settings.depthIntervalPreset) {
    case 'LANDPKS':
    case 'NRCS':
      depthIntervals = PRESETS[settings.depthIntervalPreset].map(
        depthInterval => ({ depthInterval }),
      );
      break;
    case 'CUSTOM':
      depthIntervals = settings.depthIntervals;
      break;
    case 'NONE':
      depthIntervals = undefined;
      break;
  }
  return depthIntervals;
};

const generateSiteIntervalPreset = (soilData: SoilData) => {
  switch (soilData.depthIntervalPreset) {
    case 'LANDPKS':
    case 'NRCS':
      return PRESETS[soilData.depthIntervalPreset];
    default:
      return [];
  }
};

export const selectProjectSettings = createSelector(
  [
    (state: SharedState, projectId: string) =>
      state.soilId.projectSettings[projectId],
  ],
  (projectSettings: ProjectSoilSettings) => {
    if (!projectSettings) {
      return undefined;
    }
    const depthIntervals = generateProjectIntervals(projectSettings) || [];
    return { ...projectSettings, depthIntervals };
  },
);

const sortFn = (
  { depthInterval: A }: { depthInterval: DepthInterval },
  { depthInterval: B }: { depthInterval: DepthInterval },
) => A.start - B.start;

//  transform a project depth interval into a site soil interval + input methods
//  i.e. a site soil interval
export const makeSoilDepth = (
  depthInterval: LabelOptional<ProjectDepthInterval>,
  soilSettings?: ProjectSoilSettings,
): LabelOptional<SoilDataDepthInterval> => {
  const methodsEnabled = Object.fromEntries(
    soilPitMethods.map(method => [
      methodEnabled(method),
      soilSettings ? soilSettings[methodRequired(method)] : false,
    ]),
  ) as Record<`${SoilPitMethod}Enabled`, boolean>;
  return { ...depthInterval, ...methodsEnabled };
};

export type AggregatedInterval = {
  // can this interval be deleted + can its bounds be updated?
  mutable: boolean;
  // if label missing, label should not be assigned to this interval
  interval: LabelOptional<SoilDataDepthInterval>;
};

const matchIntervals = (
  presetIntervals: LabelOptional<ProjectDepthInterval>[],
  soilDepthIntervals: SoilDataDepthInterval[],
  soilSettings: ProjectSoilSettings | undefined,
) => {
  // TODO: Check if we can rely on these arrays already being sorted
  const sortedPresets = [...presetIntervals].sort(sortFn);
  const sortedSoilDepth = [...soilDepthIntervals].sort(sortFn);

  const intervals: AggregatedInterval[] = [];

  let i = 0,
    j = 0;
  while (i < sortedPresets.length || j < sortedSoilDepth.length) {
    if (i === sortedPresets.length) {
      // no more preset intervals, and we know B_j doesn't overlap with any A
      // so B_j can be added
      intervals.push({ mutable: true, interval: sortedSoilDepth[j] });
      j++;
      continue;
    }
    const A_i = sortedPresets[i];
    let presetCovered = false;
    while (j < sortedSoilDepth.length) {
      const B_j = sortedSoilDepth[j];
      if (B_j.depthInterval.end <= A_i.depthInterval.start) {
        // B doesn't overlap with A_i-1, and not with A_i, so it can be added
        intervals.push({ mutable: true, interval: B_j });
      } else if (sameDepth(A_i)(B_j)) {
        // if they are the same depth, B_j contains soil info for A_i
        intervals.push({
          mutable: false,
          interval: B_j,
        });
        presetCovered = true;
      } else if (!checkOverlap(A_i)(B_j)) {
        // we break out of the loop when B_j no longer overlaps with A_i
        // (which means we don't add any overlapping B_j's)
        break;
      }
      j++;
    }
    if (!presetCovered) {
      // all preset intervals added as mutable = false
      intervals.push({
        mutable: false,
        interval: makeSoilDepth(A_i, soilSettings),
      });
    }
    i++;
  }

  return intervals;
};

/**
 * Preset intervals can also have soil data intervals on the backend.
 * These soil data intervals are only used to  store configuration values.
 * They are created on an ad-hoc basis when a user enables a data input.
 * This selector performs the "aggregation" logic needed to keep track of all of this.
 */
export const selectSoilDataIntervals = createSelector(
  [
    (state: SharedState, siteId: string) => state.soilId.soilData[siteId],
    (state: SharedState, siteId: string) => {
      const projectId = state.site.sites[siteId]?.projectId;
      if (projectId === undefined) {
        return undefined;
      }
      return state.soilId.projectSettings[projectId];
    },
  ],
  (soilData: SoilData, projectSettings: ProjectSoilSettings | undefined) => {
    if (projectSettings === undefined) {
      // check site presets
      const presetIntervals = generateSiteIntervalPreset({
        ...soilData,
        // default is LANDPKS if preset is not set
        ...(soilData.depthIntervalPreset === undefined
          ? { depthIntervalPreset: 'LANDPKS' }
          : {}),
      });
      // match with overlapping site intervals
      return matchIntervals(
        presetIntervals.map(depthInterval => ({
          depthInterval,
        })),
        soilData.depthIntervals,
        undefined,
      );
    }
    const presetIntervals = generateProjectIntervals(projectSettings);
    return matchIntervals(
      presetIntervals || [],
      soilData.depthIntervals,
      projectSettings,
    );
  },
);
