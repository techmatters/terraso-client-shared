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

import 'terraso-client-shared/tests/config';

import React, { act, ReactElement } from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { renderHook, render as rtlRender } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Provider } from 'react-redux';
import {
  DispatchFromStoreFactory,
  handleAbortMiddleware,
  sharedReducers,
  SharedState,
  StateFromStoreFactory,
} from 'terraso-client-shared/store/store';

const executeAxe = process.env['TEST_A11Y'] === 'true';

export const createStore = (intialState?: Partial<SharedState>) =>
  configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(handleAbortMiddleware),
    reducer: combineReducers(sharedReducers),
    preloadedState: intialState,
  });

export type TestAppState = StateFromStoreFactory<typeof createStore>;
export type TestAppDispatch = DispatchFromStoreFactory<typeof createStore>;

const baseRender = (component: ReactElement, intialState?: TestAppState) => {
  const store = createStore(intialState);
  const Wrapper = ({ children }: React.PropsWithChildren<{}>) => (
    <Provider store={store}>{children}</Provider>
  );
  return { renderResult: rtlRender(component, { wrapper: Wrapper }), store };
};

export const render = async (
  component: ReactElement,
  intialState?: TestAppState,
) => {
  const result = await act(async () => baseRender(component, intialState));
  if (executeAxe) {
    const {
      renderResult: { container },
    } = result;
    await act(async () => {
      const axeResults = await axe(container);
      expect(axeResults).toHaveNoViolations();
    });
  }
  return result;
};

export const renderSelectorHook = <Result,>(
  callback: () => Result,
  initialStoreState: Partial<SharedState>,
) =>
  renderHook(callback, {
    wrapper: props => (
      <Provider store={createStore(initialStoreState)} {...props} />
    ),
  }).result.current;

export { mockLogger } from 'terraso-client-shared/tests/config';
