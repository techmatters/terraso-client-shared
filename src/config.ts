import type { Severity } from 'terraso-client-shared/monitoring/logger';

type ConfigParams = {
  usePromise: 'yes' | 'no';
};

type MaybePromise<T extends ConfigParams, V> = T['usePromise'] extends 'yes'
  ? Promise<V>
  : V;

export type TerrasoAPIConfig<Params extends ConfigParams> = {
  terrasoAPIURL: string;
  graphQLEndpoint: string;
  tokenStorage: {
    getToken: (name: string) => MaybePromise<Params, string | undefined>;
    setToken: (name: string, token: string) => MaybePromise<Params, void>;
    removeToken: (name: string) => MaybePromise<Params, void>;
  };
  logger: (severity: Severity, ...args: any[]) => void;
};

export const { getAPIConfig, setAPIConfig } = (<T extends ConfigParams>() => {
  let apiConfig: TerrasoAPIConfig<T> | undefined;
  return {
    getAPIConfig: () => {
      if (apiConfig === undefined) {
        throw new Error(
          'Client did not configure Terraso API before starting.'
        );
      }
      return apiConfig;
    },
    setAPIConfig: (config: TerrasoAPIConfig<T>) => {
      apiConfig = config;
    },
  };
})();

export class APIConfig<T extends ConfigParams> {
  config: TerrasoAPIConfig<T>;
  constructor(config: TerrasoAPIConfig<T>) {
    this.config = config;
  }
}
