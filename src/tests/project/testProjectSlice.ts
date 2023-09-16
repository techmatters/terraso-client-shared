// test that the project slice is doing what we expect
import {
  CollaborationMembershipListNode,
  ProjectManagementProjectPrivacyChoices,
  ProjectManagementSitePrivacyChoices,
  ProjectNode,
  SiteNode,
  SiteNodeConnection,
  SiteNodeEdge,
  SoilDataNode,
  UserNode,
} from 'terraso-client-shared/graphqlSchema/graphql';
import { v4 as uuidv4 } from 'uuid';

const SAMPLE_USER: UserNode = {
  email: 'test@example.org',
  firstName: 'Test',
  id: 'd5f744d6-52bc-4f90-be4c-907c5c14a476',
  lastName: 'User',
  profileImage: 'user.jpg',
  preferences: {
    edges: [],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
    totalCount: 2,
  },
  memberships: {
    edges: [],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
    totalCount: 2,
  },
};

type SampleSiteArguments = Partial<{
  archived: boolean;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  owner: UserNode;
  privacy: ProjectManagementSitePrivacyChoices;
  soilData: SoilDataNode;
  updatedAt: string;
}>;

const sampleSite: (inp: SampleSiteArguments) => SiteNode = (
  {
    archived = false,
    id = uuidv4(),
    latitude = 0,
    longitude = 0,
    name = 'TEST_SITE',
    owner,
    privacy = 'PRIVATE',
    soilData,
    updatedAt = '1970-01-01T00:00:00Z',
  }
) => ({
  archived,
  id,
  latitude,
  longitude,
  name,
  owner,
  privacy,
  soilData,
  updatedAt,
});

const SAMPLE_SITE = sampleSite({});

type SampleProjectArgs = Partial<{
  archived: boolean;
  description: boolean;
  id: string;
  membershipList: CollaborationMembershipListNode;
  name: string;
  privacy: ProjectManagementProjectPrivacyChoices;
  siteSet: SiteNodeConnection;
  updatedAt: string;
}>;

const sampleProject: (inp: SampleProjectArgs) => ProjectNode = (
  name = 'TEST_PROJECT',
  archived = false,
  description = 'A test project.',
  id = 'ce6fd596-acc1-41e2-8def-468d7e37e63d',
  privacy = 'PRIVATE',
  updatedAt = '1970-01-01T00:00:00',
  sites: {},
  members: {}
) => ({
  name,
});
