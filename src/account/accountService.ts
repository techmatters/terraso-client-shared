/*
 * Copyright © 2021-2023 Technology Matters
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

import _ from 'lodash/fp';
import { User } from 'terraso-client-shared/account/accountSlice';
import { getUserEmail } from 'terraso-client-shared/account/auth';
import { getAPIConfig } from 'terraso-client-shared/config';
import { graphql } from 'terraso-client-shared/graphqlSchema';
import type {
  UserFieldsFragment,
  UserPreferencesFragment,
} from 'terraso-client-shared/graphqlSchema/graphql';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';

export const parsePreferences = (
  user: UserFieldsFragment & UserPreferencesFragment,
): User => ({
  ...user,
  preferences: _.fromPairs(
    user.preferences.edges.map(({ node: { key, value } }) => [key, value]),
  ),
});

const getURL = (provider: string) =>
  fetch(
    new URL(`/auth/${provider}/authorize`, getAPIConfig().terrasoAPIURL).href,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
    .then(response => response.json())
    .then(response => response.request_url as string);

export const getAuthURLs = () =>
  Promise.all([getURL('google'), getURL('apple'), getURL('microsoft')]).then(
    ([google, apple, microsoft]) => ({
      google,
      apple,
      microsoft,
    }),
  );

export const fetchProfile = async (
  params: null,
  currentUser: { email: string } | null,
) => {
  const query = graphql(`
    query userProfile($email: String) {
      users(email: $email) {
        edges {
          node {
            ...userFields
            ...userPreferences
          }
        }
      }
    }
  `);
  const result = await terrasoApi.requestGraphQL(query, {
    email: currentUser?.email,
  });

  const user = result.users?.edges.at(0);
  if (user === undefined) {
    return Promise.reject('not_found');
  }
  return parsePreferences(user.node);
};

// TODO: this is a temporary solution to get the user's email address,
// the API should have a account query to get the logged in user data
export const fetchUser = async () => {
  const email = await getUserEmail();
  return fetchProfile(null, email === undefined ? null : { email });
};

export const saveUser = (user: User) => {
  const query = graphql(`
    mutation updateUser($input: UserUpdateMutationInput!) {
      updateUser(input: $input) {
        user {
          ...userFields
          ...userPreferences
        }
        errors
      }
    }
  `);
  return terrasoApi
    .requestGraphQL(query, {
      input: _.omit(['profileImage', 'email', 'preferences'], user),
    })
    .then(resp => parsePreferences(resp.updateUser.user!));
};

export const savePreference = async (
  { key, value }: { key: string; value: string },
  currentUser: User | null,
) => {
  const query = graphql(`
    mutation updateUserPreference($input: UserPreferenceUpdateInput!) {
      updateUserPreference(input: $input) {
        preference {
          ...userPreferencesFields
        }
        errors
      }
    }
  `);
  const result = await terrasoApi.requestGraphQL(query, {
    input: {
      userEmail: currentUser!.email,
      key,
      value,
    },
  });
  return result.updateUserPreference.preference!;
};

export type DeletionBlocker = {
  model: string;
  qualifier: string | null;
  field: string;
  count: number;
  ids: string[];
};

export type DeleteUserAccountResult =
  | { kind: 'deleted'; email: string }
  | { kind: 'blocked'; blockers: DeletionBlocker[] };

export const deleteUserAccount = async (
  userId: string,
  currentUser: User | null,
): Promise<DeleteUserAccountResult> => {
  const query = graphql(`
    mutation deleteUserAccount($input: UserDeleteMutationInput!) {
      deleteUser(input: $input) {
        user {
          ...userFields
        }
        blockers {
          model
          qualifier
          field
          count
          ids
        }
        errors
      }
    }
  `);
  // Note: when the backend populates `errors` (e.g. the blocked-and-
  // HubSpot-down case), terrasoApi's handleApiErrors rejects this promise
  // before we get here. The thunk lands in the .rejected state and the
  // app's standard error-toast machinery surfaces it. So this resolver
  // only sees the two success shapes below.
  const response = await terrasoApi.requestGraphQL(query, {
    input: { id: userId },
  });
  const payload = response.deleteUser;

  if (payload.user) {
    return { kind: 'deleted', email: currentUser!.email };
  }

  // `blockers` is typed as `Array<Maybe<BlockerType>>` by codegen but the
  // backend never returns null entries — drop them so the typed result
  // matches what callers actually receive.
  const blockers = (payload.blockers ?? []).filter(
    (b): b is NonNullable<typeof b> => b !== null,
  ) as DeletionBlocker[];

  return { kind: 'blocked', blockers };
};

export const unsubscribeFromNotifications = (token: string) => {
  const query = graphql(`
    mutation unsubscribeUser($input: UserUnsubscribeUpdateInput!) {
      unsubscribeUser(input: $input) {
        errors
      }
    }
  `);
  return terrasoApi.requestGraphQL(query, { input: { token } });
};

export const signOut = async () => {
  const response = await fetch(
    new URL(`/auth/logout`, getAPIConfig().terrasoAPIURL).href,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status !== 200) {
    await Promise.reject(response);
  }
};

export type UserInProjectError = 'NoUser' | 'InProject';

export const checkUserInProject = async ({
  projectId,
  userEmail,
}: {
  projectId: string;
  userEmail: string;
}) => {
  const existQuery = graphql(`
    query userExistsInProject($email: String!, $project: String!) {
      userExists: users(email_Iexact: $email) {
        edges {
          node {
            ...userFields
          }
        }
      }
      userInProject: users(project: $project, email_Iexact: $email) {
        totalCount
      }
    }
  `);

  let { userExists, userInProject } = await terrasoApi.requestGraphQL(
    existQuery,
    { email: userEmail, project: projectId },
  );
  if (userExists === undefined || userExists.edges.length === 0) {
    return { type: 'NoUser' as UserInProjectError };
  }
  if (userInProject === undefined || userInProject.totalCount !== 0) {
    return { type: 'InProject' as UserInProjectError };
  }

  return userExists.edges[0].node;
};
