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

type MandatoryFields<Input, Output> = Partial<Input | Output> & // fields in Input, but not Output: optional
  Omit<Output, keyof Input>; // fields in Output, but not Input: mandatory

export function collapseFields<Input, Output>(
  changes: {
    [Property in keyof MandatoryFields<Input, Output>]: (
      inp: Input,
    ) => Output[Property];
  },
  clean: boolean = false,
): (input: Input) => Output {
  return (input: Input) => {
    const update = (Object.keys(changes) as (keyof typeof changes)[]).reduce(
      (output, field) => {
        let result = changes[field](input);
        output[field as keyof Output] = result;
        return output;
      },
      {} as Output,
    );
    if (clean) {
      return update;
    }
    return { ...input, ...update };
  };
}
