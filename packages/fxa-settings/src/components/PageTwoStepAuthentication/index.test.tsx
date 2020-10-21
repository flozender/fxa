/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen } from '@testing-library/react';
import { AuthContext, createAuthClient } from '../../lib/auth';
import {
  renderWithRouter,
  MockedCache,
  MockedProps,
} from '../../models/_mocks';
import React from 'react';
import PageTwoStepAuthentication from '.';
import { CREATE_TOTP_MOCK } from './_mocks';

const client = createAuthClient('none');

const render = (props: MockedProps = { mocks: CREATE_TOTP_MOCK }) =>
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache {...props}>
        <PageTwoStepAuthentication />
      </MockedCache>
    </AuthContext.Provider>
  );

const inputTotp = async (totp: string) => {
  await act(async () => {
    fireEvent.input(screen.getByTestId('totp-input-field'), {
      target: { value: totp },
    });
  });
};

it('renders', async () => {
  await act(async () => {
    render();
  });
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
  expect(screen.getByTestId('totp-input-field')).toBeInTheDocument();
  expect(screen.getByTestId('submit-totp')).toBeInTheDocument();
});

it('updates the disabled state of the continue button', async () => {
  await act(async () => {
    render();
  });
  const button = screen.getByTestId('submit-totp');

  // default
  expect(button).toBeDisabled();

  // not all numbers
  await inputTotp('bigcat');
  expect(button).toBeDisabled();

  // not enough numbers
  await inputTotp('90210');
  expect(button).toBeDisabled();

  // valid code
  await inputTotp('867530');
  expect(button).not.toBeDisabled();
});

it('displays the QR code', async () => {
  await act(async () => {
    render();
  });
  expect(screen.getByTestId('2fa-qr-code')).toBeInTheDocument();
  expect(screen.getByTestId('2fa-qr-code')).toHaveAttribute(
    'alt',
    expect.stringContaining('JFXE6ULUGM4U4WDHOFVFIRDPKZITATSK')
  );
});

it('does not display the QR code for the unverified', async () => {
  await act(async () => {
    render({ verified: false });
  });
  expect(screen.queryByTestId('2fa-qr-code')).toBeNull();
  expect(screen.queryByTestId('alert-bar')).toBeNull();
});
