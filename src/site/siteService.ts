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

import type { User } from 'terraso-client-shared/account/accountSlice';
import { graphql } from 'terraso-client-shared/graphqlSchema';
import type {
  SiteAddMutationInput,
  SiteDataFragment,
  SiteDeleteMutationInput,
  SiteUpdateMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import type { Site } from 'terraso-client-shared/site/siteSlice';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import {
  collapseConnectionEdges,
  UpdateArg,
  updateArgToInput,
} from 'terraso-client-shared/terrasoApi/utils';

export const collapseSiteFields = (site: SiteDataFragment): Site => {
  const { project, owner, ...rest } = site;
  return {
    ...rest,
    projectId: project?.id,
    ownerId: owner?.id,
  };
};

export const fetchSite = (id: string) => {
  const query = graphql(`
    query site($id: ID!) {
      site(id: $id) {
        ...siteData
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { id })
    .then(resp => collapseSiteFields(resp.site));
};

export const fetchSitesForProject = (id: string) => {
  const query = graphql(`
    query sitesForProject($id: ID!) {
      sites(project: $id) {
        edges {
          node {
            ...siteData
          }
        }
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { id })
    .then(resp => collapseConnectionEdges(resp.sites).map(collapseSiteFields));
};

export const fetchSitesForUser = async (_: undefined, user: User | null) => {
  if (user === null) {
    return [];
  }

  const query = graphql(`
    query userSites($id: ID!) {
      userSites: sites(owner: $id) {
        edges {
          node {
            ...siteData
          }
        }
      }
      projectSites: sites(project_Member: $id) {
        edges {
          node {
            ...siteData
          }
        }
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { id: user.id })
    .then(resp =>
      collapseConnectionEdges(resp.userSites)
        .concat(collapseConnectionEdges(resp.projectSites))
        .map(collapseSiteFields),
    );
};

export const addSite = (site: SiteAddMutationInput) => {
  const query = graphql(`
    mutation addSite($input: SiteAddMutationInput!) {
      addSite(input: $input) {
        site {
          ...siteData
        }
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { input: site })
    .then(resp => collapseSiteFields(resp.addSite.site));
};

export const updateSite = (
  update: UpdateArg<'id', SiteUpdateMutationInput>,
) => {
  const query = graphql(`
    mutation updateSite($input: SiteUpdateMutationInput!) {
      updateSite(input: $input) {
        site {
          ...siteData
        }
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, updateArgToInput('id', update))
    .then(resp => collapseSiteFields(resp.updateSite.site!));
};

export const deleteSite = (site: SiteDeleteMutationInput) => {
  const query = graphql(`
    mutation deleteSite($input: SiteDeleteMutationInput!) {
      deleteSite(input: $input) {
        site {
          id
        }
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { input: site })
    .then(({ deleteSite: { site } }) => site.id);
};
