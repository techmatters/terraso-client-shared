import merge from 'lodash/fp/merge';
import { initialState as accountInitialState } from 'terraso-client-shared/account/accountSlice';
import { selectProjectMembershipsWithUsers } from 'terraso-client-shared/selectors';
import { createStore } from 'terraso-client-shared/tests/utils';

import { Project, ProjectMembership } from './project/projectSlice';

const user = {
  id: '1',
  email: 'user1@example.org',
  firstName: 'User',
  lastName: 'LastName',
  profileImage: 'user.jpg',
  preferences: {},
};

const membership: ProjectMembership = {
  userId: '1',
  userRole: 'manager',
  id: '1',
};

const projectMeta: Project = {
  id: '1',
  name: 'project1',
  privacy: 'PRIVATE',
  description: '',
  updatedAt: '2023-10-12',
  siteIds: {},
  archived: false,
  memberships: {},
};

test('can select memberships', () => {
  const store = createStore(
    merge(
      {
        account: {
          users: {
            '1': user,
          },
        },
        project: {
          projects: {
            '1': {
              ...projectMeta,
              memberships: {
                '1': membership,
              },
            },
          },
        },
      },
      { account: { ...accountInitialState } },
    ),
  );

  const memberships = selectProjectMembershipsWithUsers(store.getState(), '1');
  expect(memberships).toStrictEqual([[membership, user]]);
});
