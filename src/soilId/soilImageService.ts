/*
 * Copyright © 2026 Technology Matters
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

import { graphql } from 'terraso-client-shared/graphqlSchema';
import type { SoilImageUploadUrlRequestInput } from 'terraso-client-shared/graphqlSchema/graphql';
import * as terrasoApi from 'terraso-client-shared/terrasoApi/api';

// Request a short-lived presigned S3 PUT URL for a soil image tied to a site +
// depth interval. The caller uploads the bytes directly to S3 at `uploadUrl`
// (sending a Content-Type header matching `input.contentType`); the object
// lands at `objectKey`. See the backend requestSoilImageUploadUrl mutation.
//
// NOTE: the explicit return type re-exposes `errors` from the backend
// payload. requestGraphQL's typed return runs the response through
// `WithoutEntryErrors` (terrasoApi/api.ts), which strips per-entry `errors`
// keys from the inferred type — convenient for most mutations where
// top-level GraphQL errors are the only failure mode. This mutation uses
// per-entry `errors` (GenericScalar) to surface business-rule failures
// (e.g. "no permission on this site"), so the caller needs to see it.
// GenericScalar is opaque; typing as `unknown` forces callers to inspect
// the shape they get rather than assume. The data is present at runtime
// regardless — only the inferred type was dropping it.
export const requestSoilImageUploadUrl = async (
  input: SoilImageUploadUrlRequestInput,
): Promise<{
  uploadUrl?: string | null;
  objectKey?: string | null;
  errors?: unknown;
}> => {
  const query = graphql(`
    mutation requestSoilImageUploadUrl(
      $input: SoilImageUploadUrlRequestInput!
    ) {
      requestSoilImageUploadUrl(input: $input) {
        uploadUrl
        objectKey
        errors
      }
    }
  `);

  const resp = await terrasoApi.requestGraphQL(query, { input });
  return resp.requestSoilImageUploadUrl;
};
