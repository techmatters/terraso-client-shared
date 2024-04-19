import _ from 'lodash/fp';
import type * as api from 'terraso-client-shared/terrasoApi/api';

export const requestGraphQL: jest.Mock<typeof api.requestGraphQL> = jest.fn();

export const request: jest.Mock<typeof api.request> = jest.fn();
