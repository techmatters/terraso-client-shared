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
  SiteDataFragment,
  SiteNoteDataFragment,
  SiteTransferMutationInput,
  SiteUpdateMutationInput,
} from 'terraso-client-shared/graphqlSchema/graphql';
import type { Site, SiteNote } from 'terraso-client-shared/site/siteTypes';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';
import {
  collapseEdges,
  Connection,
} from 'terraso-client-shared/terrasoApi/utils';

// Note: we used to have some mutations in this file that are now covered by pushUserData

export const collapseSite = (site: SiteDataFragment): Site => {
  const { project, owner, notes, ...rest } = site;
  return {
    ...rest,
    elevation: rest.elevation ?? null,
    projectId: project?.id,
    ownerId: owner?.id,
    notes: collapseSiteNotes(notes),
  };
};

export const collapseSites = (sites: Connection<SiteDataFragment>) =>
  Object.fromEntries(
    collapseEdges(sites).map(site => [site.id, collapseSite(site)]),
  );

export const collapseSiteNotes = (
  siteNotes: Connection<SiteNoteDataFragment>,
) =>
  Object.fromEntries(
    collapseEdges(siteNotes).map(siteNote => [
      siteNote.id,
      collapseSiteNote(siteNote),
    ]),
  );

export const collapseSiteNote = (siteNote: SiteNoteDataFragment): SiteNote => {
  const { author, site, ...rest } = siteNote;
  return {
    ...rest,
    authorId: author.id,
    authorFirstName: author.firstName,
    authorLastName: author.lastName,
    siteId: site.id,
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
    .then(resp => collapseSite(resp.site));
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
    .then(resp => collapseEdges(resp.sites).map(collapseSite));
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
      collapseEdges(resp.userSites)
        .concat(collapseEdges(resp.projectSites))
        .map(collapseSite),
    );
};

export const updateSite = (site: SiteUpdateMutationInput) => {
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
    .requestGraphQL(query, { input: site })
    .then(resp => collapseSite(resp.updateSite.site!));
};

export const deleteSite = (site: Site) => {
  const query = graphql(`
    mutation deleteSite($input: SiteDeleteMutationInput!) {
      deleteSite(input: $input) {
        errors
      }
    }
  `);

  return terrasoApi
    .requestGraphQL(query, { input: { id: site.id } })
    .then(_ => site.id);
};

export const transferSitesToProject = (input: SiteTransferMutationInput) => {
  const query = graphql(`
    mutation transferSites($input: SiteTransferMutationInput!) {
      transferSites(input: $input) {
        project {
          id
        }
        updated {
          site {
            id
          }
          oldProject {
            id
          }
        }
      }
    }
  `);
  return terrasoApi.requestGraphQL(query, { input }).then(
    ({
      transferSites: {
        project: { id: projectId },
        updated,
      },
    }) => {
      const condensedUpdated = updated.map(
        ({ site: { id: siteId }, oldProject }) => {
          const obj: { siteId: string; oldProjectId?: string } = { siteId };
          if (oldProject) {
            obj.oldProjectId = oldProject.id;
          }
          return obj;
        },
      );
      return { projectId, updated: condensedUpdated };
    },
  );
};
