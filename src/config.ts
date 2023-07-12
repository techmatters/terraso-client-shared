import type { Severity } from 'terraso-client-shared/monitoring/logger';

export type TerrasoAPIConfig = {
  terrasoAPIURL: string;
  graphQLEndpoint: string;
  tokenStorage: {
    getToken: (
      name: string,
    ) => Promise<string | undefined> | string | undefined;
    setToken: (name: string, token: string) => Promise<void> | void;
    removeToken: (name: string) => Promise<void> | void;
  };
  logger: (severity: Severity, ...args: any[]) => void;
};

export const { getAPIConfig, setAPIConfig } = (() => {
  let apiConfig: TerrasoAPIConfig | undefined;
  return {
    getAPIConfig: () => {
      if (apiConfig === undefined) {
        throw new Error(
          'Client did not configure Terraso API before starting.',
        );
      }
      return apiConfig;
    },
    setAPIConfig: (config: TerrasoAPIConfig) => {
      apiConfig = config;
    },
  };
})();
