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
import { useEffect } from 'react';
import {
  AnyAction,
  AsyncThunkAction,
  createAsyncThunk as createAsyncThunkBase,
  ThunkAction,
} from '@reduxjs/toolkit';
import type { BaseThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import _ from 'lodash/fp';
import { useDispatch } from 'react-redux';
import { signOut, User } from 'terraso-client-shared/account/accountSlice';
import { refreshToken } from 'terraso-client-shared/account/auth';
import { UNAUTHENTICATED } from 'terraso-client-shared/account/authConstants';
import {
  addMessage,
  Message,
} from 'terraso-client-shared/notifications/notificationsSlice';
import type {
  SharedDispatch,
  SharedState,
} from 'terraso-client-shared/store/store';

const executeAuthRequest = <T>(
  dispatch: SharedDispatch,
  action: () => Promise<T>,
) =>
  action().catch(async error => {
    if (error !== UNAUTHENTICATED) {
      await Promise.reject(error);
    }
    try {
      await refreshToken();
    } catch {
      // Failed token renew
      dispatch(signOut());
      await Promise.reject('account.unauthenticated_message');
    }
    // Retry request after tokens renewed
    return await action();
  });

const generateErrorFallbacksPartial = (name: string) => {
  const [slice, action] = _.split('/', name);
  const baseCodes = [
    (code: string) => [slice, action, code],
    (code: string) => [slice, code],
    (code: string) => [code],
  ];
  return (codes: string | string[]) =>
    [
      ..._.flatMap(baseCode => _.flatten([codes]).map(baseCode), baseCodes),
      ...[
        [slice, action, 'unexpected_error'],
        ['common', 'unexpected_error'],
      ],
    ].map(parts => parts.join('.'));
};

// Background reading on typing createAsyncThunk:
// https://redux-toolkit.js.org/usage/usage-with-typescript#typing-the-thunkapi-object
// There is code dup here between ThunkAPIConfig and ThunkAPI pending this PR getting
// merged upstream: https://github.com/reduxjs/redux-toolkit/pull/3393
type RejectPayload = { error: any; parsedErrors: any };
type ThunkAPIConfig = {
  state: SharedState;
  dispatch: SharedDispatch;
  rejectValue: RejectPayload;
};
export type ThunkAPI = BaseThunkAPI<
  SharedState,
  unknown,
  SharedDispatch,
  RejectPayload
>;

export const createAsyncThunk = <Returned, ThunkArg = void>(
  typePrefix: string,
  action: (
    arg: ThunkArg,
    currentUser: User | null,
    thunkAPI: ThunkAPI,
  ) => Returned | Promise<Returned>,
  onSuccessMessage:
    | ((result: Returned, input: ThunkArg) => Message)
    | null = null,
  dispatchErrorMessage = true,
  onErrorMessage: (_: { message: Message; input: ThunkArg }) => Message = ({
    message,
  }) => message,
) => {
  const generateErrorFallbacks = generateErrorFallbacksPartial(typePrefix);
  return createAsyncThunkBase<Returned, ThunkArg, ThunkAPIConfig>(
    typePrefix,
    async (input, thunkAPI: ThunkAPI) => {
      const { rejectWithValue, dispatch } = thunkAPI;

      const executeAction = async () => {
        const state = thunkAPI.getState();
        const currentUser = state.account.currentUser.data;
        const result = await action(input, currentUser, thunkAPI);
        if (onSuccessMessage !== null) {
          dispatch(addMessage(onSuccessMessage(result, input)));
        }
        return result;
      };

      try {
        return await executeAuthRequest(dispatch, executeAction);
      } catch (error: any) {
        const parsedErrors = _.flatten([error]).map(error => {
          const baseMessage = _.has('content', error)
            ? { severity: 'error', ...error }
            : { severity: 'error', content: [error], params: { error } };
          return {
            ...baseMessage,
            content: generateErrorFallbacks(baseMessage.content),
          };
        });

        if (dispatchErrorMessage && !thunkAPI.signal.aborted) {
          parsedErrors.forEach(message =>
            dispatch(addMessage(onErrorMessage({ message, input }))),
          );
        }

        return rejectWithValue({ error, parsedErrors });
      }
    },
  );
};

export const withExtra =
  <Extra>() =>
  <OriginalArg, Return>(
    fn: (_: OriginalArg) => Return,
  ): ((_: OriginalArg & Extra) => Return) =>
    fn;

export const useFetchData = (
  dataFetchCallback: () => AsyncThunkAction<any, any, ThunkAPIConfig> | null,
) => {
  const dispatch = useDispatch<SharedDispatch>();
  useEffect(() => {
    const dataFetchRequest = dataFetchCallback();
    if (!dataFetchRequest) {
      return;
    }
    const req = dispatch(dataFetchRequest);
    return () => req.abort();
  }, [dispatch, dataFetchCallback]);
};

export type Thunker<U, T> = Parameters<typeof createAsyncThunk<U, T>>[1];

interface Dehydratable<T> {
  dehydrated: T;
}

type DispatchMap<Result> = {
  [Property in keyof Result]: (
    arg: Result[Property],
  ) =>
    | AnyAction
    | ThunkAction<Result[Property], SharedState, undefined, AnyAction>;
};

type ThunkFunct<Dehydrated, Hydrated extends Dehydratable<Dehydrated>> = {
  sing: <T>(fetcher: Thunker<Hydrated, T>) => Thunker<Dehydrated, T>;
  plural: <T>(fetcher: Thunker<Hydrated[], T>) => Thunker<Dehydrated[], T>;
};

export function dehydrated<
  Dehydrated,
  Hydrated extends Dehydratable<Dehydrated>,
>(
  dispatchMap: DispatchMap<Omit<Hydrated, 'dehydrated'>>,
): ThunkFunct<Dehydrated, Hydrated> {
  const sing = <T>(fetcher: Thunker<Hydrated, T>): Thunker<Dehydrated, T> => {
    return async (arg, currentUser, thunkAPI) => {
      const result = await fetcher(arg, currentUser, thunkAPI);
      let toDispatch: Omit<Dehydratable<Dehydrated>, 'dehydrated'> = {
        ...result,
        ...{ dehydrated: undefined },
      };
      dispatchAll(toDispatch, dispatchMap, thunkAPI.dispatch);
      return result.dehydrated;
    };
  };
  const plural = <T>(
    fetcher: Thunker<Hydrated[], T>,
  ): Thunker<Dehydrated[], T> => {
    return async (arg, currentUser, thunkAPI) => {
      const result = await fetcher(arg, currentUser, thunkAPI);
      if (result.length === 0) {
        return [];
      }
      let toDispatch: Omit<Dehydratable<Dehydrated>, 'dehydrated'> = {
        ...result[0],
        ...{ dehydrated: undefined },
      };
      let returnItems = [result[0].dehydrated];
      for (let res of result.slice(1)) {
        for (let key of Object.keys(toDispatch)) {
          Object.assign(
            toDispatch[key as keyof typeof toDispatch],
            res[key as keyof typeof res],
          );
        }
        returnItems.push(res.dehydrated);
      }
      dispatchAll(toDispatch, dispatchMap, thunkAPI.dispatch);
      return returnItems;
    };
  };
  return { sing, plural };
}

function dispatchAll<T>(
  toDispatch: T,
  dispatchMap: DispatchMap<T>,
  dispatch: ThunkAPI['dispatch'],
) {
  let dispatches = [];
  for (let key in toDispatch) {
    let f = dispatchMap[key];
    let args = toDispatch[key];
    dispatches.push(dispatch(f(args)));
  }
  // in case we ever wanted to await this
  return Promise.all(dispatches);
}
