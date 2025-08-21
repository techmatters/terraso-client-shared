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

import 'terraso-client-shared/tests/utils';

import React from 'react';
import { fetchAuthURLs } from 'terraso-client-shared/account/accountSlice';
import { Message } from 'terraso-client-shared/notifications/notificationsSlice';
import { useFetchData } from 'terraso-client-shared/store/utils';
import { render } from 'terraso-client-shared/tests/utils';

const TestComponent = () => {
  useFetchData(fetchAuthURLs);
  return <div></div>;
};

const mockFetch = jest.fn<
  ReturnType<typeof global.fetch>,
  Parameters<typeof global.fetch>
>();
global.fetch = mockFetch;

test('AsyncThunk: Handle error', async () => {
  mockFetch.mockRejectedValue('Test error');
  const { store } = await render(<TestComponent />);
  const [message] = Object.values(
    store.getState().notifications.messages,
  ) as Message[];
  expect(message.severity).toBe('error');
  expect(message.params.error).toBe('Test error');
  expect(message.content).toContain('Test error');
});
test('AsyncThunk: Handle multiple errors', async () => {
  mockFetch.mockRejectedValue(['Test error 1', 'Test error 2']);
  const { store } = await render(<TestComponent />);
  const [message1, message2] = Object.values(
    store.getState().notifications.messages,
  ) as Message[];
  expect(message1.severity).toBe('error');
  expect(message1.params.error).toBe('Test error 1');
  expect(message1.content).toContain('Test error 1');
  expect(message2.severity).toBe('error');
  expect(message2.params.error).toBe('Test error 2');
  expect(message2.content).toContain('Test error 2');
});
test('AsyncThunk: Complex error message', async () => {
  mockFetch.mockRejectedValue({
    content: ['common.unexpected_error'],
    params: { error: 'Unexpected' },
  });
  const { store } = await render(<TestComponent />);
  const [message] = Object.values(
    store.getState().notifications.messages,
  ) as Message[];
  expect(message.severity).toBe('error');
  expect(message.params.error).toBe('Unexpected');
  expect(message.content).toContain('common.unexpected_error');
});
