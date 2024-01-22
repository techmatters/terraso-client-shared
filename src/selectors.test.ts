import { merge } from 'lodash/fp';
import {
  initialState as accountInitialState,
  User,
} from 'terraso-client-shared/account/accountSlice';
import { PRESETS } from 'terraso-client-shared/constants';
import {
  DepthInterval,
  ProjectPrivacy,
  UserRole,
} from 'terraso-client-shared/graphqlSchema/graphql';
import {
  Project,
  ProjectMembership,
} from 'terraso-client-shared/project/projectSlice';
import {
  selectProjectMembershipsWithUsers,
  selectProjectsWithTransferrableSites,
  selectSitesAndUserRoles,
  selectSoilDataIntervals,
  selectUserRoleSite,
} from 'terraso-client-shared/selectors';
import { Site } from 'terraso-client-shared/site/siteSlice';
import {
  methodEnabled,
  methodRequired,
  ProjectDepthInterval,
  ProjectSoilSettings,
  SoilData,
  SoilDataDepthInterval,
  SoilPitMethod,
  soilPitMethods,
  SoilState,
} from 'terraso-client-shared/soilId/soilIdSlice';
import { SerializableSet } from 'terraso-client-shared/store/utils';
import { createStore } from 'terraso-client-shared/tests/utils';
import { v4 as uuidv4 } from 'uuid';

const generateUser = () => {
  const id = uuidv4();
  return {
    id,
    email: id + '@example.org',
    firstName: id,
    lastName: id,
    profileImage: 'user.jpg',
    preferences: {},
  };
};

const generateProject = (
  memberships: ProjectMembership[] = [],
  privacy?: ProjectPrivacy,
  sites: Site[] = [],
): Project => {
  const id = uuidv4();
  const siteSet: SerializableSet = {};
  for (let site of sites) {
    site.projectId = id;
    siteSet[site.id] = true;
  }
  return {
    id,
    name: id,
    privacy: privacy ?? 'PRIVATE',
    description: '',
    updatedAt: '2023-10-12',
    sites: siteSet,
    archived: false,
    memberships: keyBy(memberships, 'id'),
    measurementUnits: 'METRIC',
    siteInstructions: '',
  };
};

const generateSite = (args?: { project: Project } | { owner: User }): Site => {
  let project = undefined,
    owner = undefined;
  if (args && 'project' in args) {
    project = args.project;
  } else if (args) {
    owner = args.owner;
  }
  const id = uuidv4();
  const site: Site = {
    projectId: project?.id,
    ownerId: owner?.id,
    id,
    name: 'Test Site',
    latitude: 0,
    longitude: 0,
    privacy: 'PRIVATE',
    archived: false,
    updatedAt: '2023-10-24',
    notes: {},
  };
  if (project !== undefined) {
    project.sites[site.id] = true;
  }
  return site;
};

const generateMembership = (userId: string, userRole: UserRole) => {
  return { id: uuidv4(), userId, userRole };
};

const createSoilData = (
  site: Site,
  defaults?: Partial<SoilData>,
): Record<string, SoilData> => {
  return {
    [site.id]: {
      depthDependentData: [],
      depthIntervals: [],
      ...defaults,
    },
  };
};

const createProjectSettings = (
  project: Project,
  defaults?: Partial<ProjectSoilSettings>,
): Record<string, ProjectSoilSettings> => {
  return {
    [project.id]: {
      carbonatesRequired: false,
      depthIntervalPreset: 'LANDPKS',
      depthIntervals: [],
      electricalConductivityRequired: false,
      landUseLandCoverRequired: false,
      measurementUnits: 'METRIC',
      notesRequired: false,
      phRequired: false,
      photosRequired: false,
      slopeRequired: false,
      sodiumAdsorptionRatioRequired: false,
      soilColorRequired: false,
      soilLimitationsRequired: false,
      soilOrganicCarbonMatterRequired: false,
      soilPitRequired: false,
      soilStructureRequired: false,
      soilTextureRequired: false,
      verticalCrackingRequired: false,
      ...defaults,
    },
  };
};

const generateSiteInterval = (
  interval: DepthInterval,
  label?: string,
): SoilDataDepthInterval => ({
  ...(label !== undefined ? { label } : { label: '' }),
  depthInterval: interval,
  electricalConductivityEnabled: false,
  phEnabled: false,
  sodiumAdsorptionRatioEnabled: false,
  soilColorEnabled: false,
  soilOrganicCarbonMatterEnabled: false,
  soilStructureEnabled: false,
  soilTextureEnabled: false,
  carbonatesEnabled: false,
});

const projectToSiteInterval = (
  interval: ProjectDepthInterval,
  projectSettings?: ProjectSoilSettings,
) => {
  const siteInterval: SoilDataDepthInterval = {
    depthInterval: interval.depthInterval,
    label: interval.label,
    ...(Object.fromEntries(
      soilPitMethods.map(method => [
        methodEnabled(method),
        projectSettings ? projectSettings[methodRequired(method)] : false,
      ]),
    ) as Record<`${SoilPitMethod}Enabled`, boolean>),
  };
  return siteInterval;
};

type Indexable<T, Index extends keyof T> = T[Index] extends string | number
  ? T
  : never;

const keyBy = <T, Index extends keyof T>(
  elements: Indexable<T, Index>[],
  index: Index,
) => {
  return elements.reduce(
    (x, y) => ({ ...x, [y[index] as string | number]: y }),
    {},
  );
};

function initState(
  projects: Project[],
  users: User[],
  sites: Site[] = [],
  currentUserID?: string,
  soilId?: {
    soilData?: Record<string, SoilData>;
    projectSettings?: Record<string, ProjectSoilSettings>;
  },
) {
  const soilData = soilId?.soilData || {};
  const projectSettings = soilId?.projectSettings || {};
  return merge(
    { account: { ...accountInitialState } },
    {
      account: {
        users: keyBy(users, 'id'),
        currentUser: {
          data: {
            id: currentUserID ?? users[0]?.id,
          },
        },
      },
      project: {
        projects: keyBy(projects, 'id'),
      },
      site: {
        sites: keyBy(sites, 'id'),
      },
      soilId: {
        soilData,
        projectSettings,
        status: 'ready',
      } as SoilState,
    },
  );
}

test('can select memberships', () => {
  const user = generateUser();
  const membership: ProjectMembership = {
    id: uuidv4(),
    userId: user.id,
    userRole: 'manager',
  };
  const project = generateProject([membership]);
  const store = createStore(initState([project], [user]));

  const memberships = selectProjectMembershipsWithUsers(
    store.getState(),
    project.id,
  );
  expect(memberships).toStrictEqual([[membership, user]]);
});

test('can select memberships of specific project', () => {
  const user = generateUser();
  const membershipA = generateMembership(user.id, 'viewer');
  const membershipB = generateMembership(user.id, 'manager');
  const projectA = generateProject([membershipA]);
  const projectB = generateProject([membershipB]);
  const store = createStore(initState([projectA, projectB], [user]));

  const memberships = selectProjectMembershipsWithUsers(
    store.getState(),
    projectB.id,
  );
  expect(memberships).toStrictEqual([[membershipB, user]]);
});

test('not found project returns empty membership', () => {
  const store = createStore(initState([], []));
  const memberships = selectProjectMembershipsWithUsers(
    store.getState(),
    'badid',
  );
  expect(memberships).toStrictEqual([]);
});

test('can access all projects with role', () => {
  const user = generateUser();
  const project1 = generateProject([generateMembership(user.id, 'manager')]);
  const project2 = generateProject([
    generateMembership(user.id, 'contributor'),
  ]);
  const project3 = generateProject([generateMembership(user.id, 'manager')]);
  const site1 = generateSite({ project: project1 });
  const site2 = generateSite({ project: project2 });
  const site3 = generateSite();

  const store = createStore(
    initState(
      [project1, project2, project3],
      [user],
      [site1, site2, site3],
      user.id,
    ),
  );
  const pairs = selectProjectsWithTransferrableSites(
    store.getState(),
    'manager',
  );
  expect(pairs).toStrictEqual({
    projects: {
      [project1.id]: { projectName: project1.name, projectId: project1.id },
      [project3.id]: { projectName: project3.name, projectId: project3.id },
    },
    sites: [
      {
        projectId: project1.id,
        projectName: project1.name,
        siteId: site1.id,
        siteName: site1.name,
      },
    ],
    unaffiliatedSites: [{ siteId: site3.id, siteName: site3.name }],
  });
});

test('select user sites with project role', () => {
  const user = generateUser();
  const project1 = generateProject([generateMembership(user.id, 'manager')]);
  const project2 = generateProject([
    generateMembership(user.id, 'contributor'),
  ]);
  const site1 = generateSite({ project: project1 });
  const site2 = generateSite({ project: project2 });
  const site3 = generateSite();
  const site4 = generateSite({ project: project2 });

  const store = createStore(
    initState(
      [project1, project2],
      [user],
      [site1, site2, site3, site4],
      user.id,
    ),
  );

  const roles = selectSitesAndUserRoles(store.getState());
  expect(roles).toStrictEqual({
    [site1.id]: 'manager',
    [site2.id]: 'contributor',
    [site3.id]: undefined,
    [site4.id]: 'contributor',
  });
});

test('select user role when site owned', () => {
  const user = generateUser();
  const site = generateSite({ owner: user });
  const store = createStore(initState([], [user], [site], user.id));

  const siteRole = selectUserRoleSite(store.getState(), site.id);
  expect(siteRole).toStrictEqual({ kind: 'site', role: 'owner' });
});

test('select user role in project of site', () => {
  const user = generateUser();
  const project = generateProject([generateMembership(user.id, 'viewer')]);
  const site = generateSite({ project });
  const store = createStore(initState([project], [user], [site], user.id));

  const siteRole = selectUserRoleSite(store.getState(), site.id);
  expect(siteRole).toStrictEqual({ kind: 'project', role: 'viewer' });
});

test('select predefined project selector', () => {
  const user = generateUser();
  const project = generateProject([generateMembership(user.id, 'manager')]);
  const site = generateSite({ project });
  const soilData = createSoilData(site);
  const projectSettings = createProjectSettings(project, {
    depthIntervalPreset: 'LANDPKS',
  });

  const store = createStore(
    initState([project], [user], [site], user.id, {
      soilData,
      projectSettings,
    }),
  );

  const aggregatedIntervals = selectSoilDataIntervals(
    store.getState(),
    site.id,
  );

  expect(
    aggregatedIntervals.map(({ interval: { depthInterval } }) => depthInterval),
  ).toStrictEqual(PRESETS['LANDPKS']);
});

test('select predefined project selector with custom preset', () => {
  const user = generateUser();
  const project = generateProject([generateMembership(user.id, 'manager')]);
  const site = generateSite({ project });
  const projectDepthIntervals = [
    { depthInterval: { start: 2, end: 3 }, label: 'first' },
    { depthInterval: { start: 5, end: 6 }, label: '' },
  ];
  const projectSettings = createProjectSettings(project, {
    depthIntervalPreset: 'CUSTOM',
    depthIntervals: projectDepthIntervals,
  });
  const siteDepthIntervals = [
    generateSiteInterval({ start: 1, end: 2 }, 'site-0'),
    generateSiteInterval({ start: 4, end: 6 }, 'site-1'),
    generateSiteInterval({ start: 7, end: 10 }, 'site-2'),
  ];
  const soilData = createSoilData(site, {
    depthIntervals: siteDepthIntervals,
  });

  const store = createStore(
    initState([project], [user], [site], user.id, {
      soilData,
      projectSettings,
    }),
  );

  const aggregatedIntervals = selectSoilDataIntervals(
    store.getState(),
    site.id,
  );

  expect(aggregatedIntervals).toStrictEqual([
    { mutable: true, interval: siteDepthIntervals[0] },
    {
      mutable: false,
      interval: projectToSiteInterval(
        projectDepthIntervals[0],
        projectSettings[project.id],
      ),
    },
    {
      mutable: false,
      interval: projectToSiteInterval(
        projectDepthIntervals[1],
        projectSettings[project.id],
      ),
    },
    { mutable: true, interval: siteDepthIntervals[2] },
  ]);
});
