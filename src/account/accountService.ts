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

const parsePreferences = (
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

export type UserInProjectError = "NoUser" | "InProject";

export const checkUserInProject = async (
  projectId: string,
  userEmail: string,
) => {
  const existQuery = graphql(`
    query userExists($email: String!) {
      users(email: $email) {
        edges {
          node {
            ...userFields
          }
        }
      }
    }
  `);

  const inProjectQuery = graphql(`
    query userExistsInProject($project: String!, $email: String!) {
      users(project: $project, email: $email) {
        totalCount
      }
    }
  `);

  let [userExists, inProject] = await Promise.all([
    terrasoApi.requestGraphQL(existQuery, { email: userEmail }),
    terrasoApi.requestGraphQL(inProjectQuery, {
      project: projectId,
      email: userEmail,
    }),
  ]);
  if (userExists.users === undefined || userExists.users?.edges.length === 0) {
    return { type: 'NoUser' as UserInProjectError};
  }
  if (inProject.users?.totalCount !== 0) {
    return { type: 'InProject' as UserInProjectError};
  }

  return userExists.users.edges[0].node;
};
