import { merge } from 'lodash/fp';
import {
  initialState as accountInitialState,
  User,
} from 'terraso-client-shared/account/accountSlice';
import { ProjectPrivacy } from 'terraso-client-shared/graphqlSchema/graphql';
import {
  Project,
  ProjectMembership,
} from 'terraso-client-shared/project/projectSlice';
import { selectProjectMembershipsWithUsers } from 'terraso-client-shared/selectors';
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
  memberships: ProjectMembership[],
  privacy?: ProjectPrivacy,
): Project => {
  const id = uuidv4();
  return {
    id,
    name: id,
    privacy: privacy ?? 'PRIVATE',
    description: '',
    updatedAt: '2023-10-12',
    siteIds: {},
    archived: false,
    memberships: keyBy(memberships, 'id'),
  };
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

function initState(projects: Project[], users: User[]) {
  return merge(
    {
      account: {
        users: keyBy(users, 'id'),
      },
      project: {
        projects: keyBy(projects, 'id'),
      },
    },
    { account: { ...accountInitialState } },
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
