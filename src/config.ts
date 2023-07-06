import type { Severity } from 'terraso-client-shared/monitoring/logger';

export type TerrasoAPIConfig = {
  terrasoAPIURL: string;
  graphQLEndpoint: string;
  tokenStorage: {
    getToken: (name: string) => Promise<string | undefined>;
    setToken: (name: string, token: string) => Promise<void>;
    removeToken: (name: string) => Promise<void>;
    /**
     * Value of initial token used to init redux store.
     * @remarks
     * Redux requires a synchronous value to be passed to the store initial state.
     * For environments where the token can be fetched synchronously, the token value
     * can be passed. For environments where getToken is by default async, a null
     * value should be provided. Application code is then responsible for initializing
     * the token value on app startup.
     */
    initialToken: string | null;
  };
  logger: (severity: Severity, ...args: any[]) => void;
};

export const { getAPIConfig, setAPIConfig } = (() => {
  let apiConfig: TerrasoAPIConfig | undefined;
  return {
    getAPIConfig: () => {
      if (apiConfig === undefined) {
        throw new Error(
          'Client did not configure Terraso API before starting.'
        );
      }
      return apiConfig;
    },
    setAPIConfig: (config: TerrasoAPIConfig) => {
      apiConfig = config;
    },
  };
})();
