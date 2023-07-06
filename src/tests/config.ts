import { setAPIConfig } from 'terraso-client-shared/config';

export const mockLogger = jest.fn();

setAPIConfig({
  terrasoAPIURL: 'http://127.0.0.1:8000',
  graphQLEndpoint: '/graphql',
  tokenStorage: {
    getToken: async () => undefined,
  } as any,
  logger: mockLogger,
});
