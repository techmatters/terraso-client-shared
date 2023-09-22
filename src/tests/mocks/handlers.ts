import { graphql } from 'msw';
import {
  ProjectNodeConnection,
  QueryProjectsArgs,
} from 'terraso-client-shared/graphqlSchema/graphql';

export const handlers = [
  graphql.query<ProjectNodeConnection, QueryProjectsArgs>(
    'projects',
    (_req, res, ctx) => {
      return res(
        ctx.data({
          edges: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
          totalCount: 0,
        })
      );
    }
  ),
];
