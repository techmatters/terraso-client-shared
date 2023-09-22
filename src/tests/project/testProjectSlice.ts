import { fetchProjectsForUser } from 'terraso-client-shared/project/projectSlice';
import createStoreFactory from 'terraso-client-shared/store/store';

// test that the project slice is doing what we expect

test('project added properly to store', async () => {
  const store = createStoreFactory({})();
  await store.dispatch(fetchProjectsForUser());
  expect(store.getState().project.projects).toBe({
    '1': {
      id: '',
      name: 'TEST PROJECT',
      privacy: 'PRIVATE',
      description: '',
      updatedAt: '2023-09-22T00:00:00Z',
      memberships: {
        user: '',
        role: 'manager',
      },
      siteIds: { '1': true },
      archived: false,
    },
  });
});
