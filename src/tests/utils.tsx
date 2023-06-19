import 'terraso-client-shared/tests/config';
import React, { ReactElement } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { axe } from 'jest-axe';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import createStoreFactory, {
  DispatchFromStoreFactory,
  StateFromStoreFactory,
} from 'terraso-client-shared/store/store';

const executeAxe = process.env['TEST_A11Y'] === 'true';

export const createStore = createStoreFactory({});
export type TestAppState = StateFromStoreFactory<typeof createStore>;
export type TestAppDispatch = DispatchFromStoreFactory<typeof createStore>;

const baseRender = (component: ReactElement, intialState?: TestAppState) => {
  const store = createStore(intialState);
  const Wrapper = ({ children }: { children: ReactElement }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { renderResult: rtlRender(component, { wrapper: Wrapper }), store };
};

export const render = async (
  component: ReactElement,
  intialState?: TestAppState
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

export { mockLogger } from 'terraso-client-shared/tests/config';
