/*
 * Copyright © 2023 Technology Matters
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

export const collapseConnectionEdges = <T>(connection: {
  edges: { node: T }[];
}): T[] => {
  return connection.edges.map(({ node }) => node);
};

export function collapseFields<
  Input extends {},
  Output extends { [Property in keyof Partial<Output>]: Output[Property] },
>(changes: {
  [Property in keyof Partial<Output>]: (inp: Input) => Output[Property];
}): (input: Input) => Output {
  return (input: Input) =>
    (Object.keys(input) as (keyof Output)[]).reduce((output, field) => {
      if (field in changes) {
        output[field] = changes[field](input);
      } else {
        if (field in input) {
          output[field] = input[field as unknown as keyof Input] as any;
        } else {
          throw new Error(`field ${String(field)} not mapped to output`);
        }
      }
      return output;
    }, {} as Output);
}
