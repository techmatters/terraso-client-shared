import { DepthInterval } from './graphqlSchema/graphql';

export const PRESETS: Record<'LANDPKS' | 'NRCS', DepthInterval[]> = {
  LANDPKS: [
    { start: 0, end: 10 },
    { start: 10, end: 20 },
    { start: 20, end: 50 },
    { start: 50, end: 70 },
    { start: 70, end: 100 },
    { start: 100, end: 200 },
  ],
  NRCS: [
    { start: 0, end: 5 },
    { start: 5, end: 15 },
    { start: 15, end: 30 },
    { start: 30, end: 60 },
    { start: 60, end: 100 },
    { start: 100, end: 200 },
  ],
};
