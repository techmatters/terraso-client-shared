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

export type UpdateArg<ID extends string, T extends Record<ID, any>> = {
  [K in ID]: T[K];
} & {
  update: Omit<T, ID>;
};

export const updateArgToInput = <ID extends string, T extends Record<ID, any>>(
  idField: ID,
  { [idField]: id, update }: UpdateArg<ID, T>,
) => {
  if (idField in update) {
    throw Error(`
      update arguments should not contain IDs! 
      are you accidentally passing the entire model object into the 
      update arg instead of just the fields you need to update?
    `);
  }
  return {
    input: {
      ...({ [idField]: id } as unknown as { [K in ID]: T[K] }),
      ...update,
    },
  };
};

export const collapseConnectionEdges = <T>(connection: {
  edges: { node: T }[];
}): T[] => {
  return connection.edges.map(({ node }) => node);
};

type MandatoryFields<Input, Output> = Partial<Input | Output> & // fields in Input, but not Output: optional
  Omit<Output, keyof Input>; // fields in Output, but not Input: mandatory

export function collapseFields<Input, Output>(changes: {
  [Property in keyof MandatoryFields<Input, Output>]: (
    inp: Input,
  ) => Output[Property];
}): (input: Input) => Output {
  return (input: Input) => {
    const update = (Object.keys(changes) as (keyof typeof changes)[]).reduce(
      (output, field) => {
        let result = changes[field](input);
        output[field as keyof Output] = result;
        return output;
      },
      {} as Output,
    );
    return { ...input, ...update };
  };
}
