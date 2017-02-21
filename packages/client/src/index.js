// @flow

import AccountsClient from '@accounts/client';
import type { TransportInterface } from '@accounts/client';
import type {
  CreateUserType,
  PasswordLoginUserType,
  LoginReturnType,
} from '@accounts/common';

export type OptionsType = {
  apiHost: string,
  rootPath: string
};

const headers = new Headers();
headers.append('Content-Type', 'application/json');

export default class Client {
  constructor(options: OptionsType) {
    // Enforce flow interface on current class
    // eslint-disable-next-line no-unused-expressions
    (this: TransportInterface);
    this.options = options;
  }

  async fetch(route: string, args: Object): Promise<any> {
    const res = await fetch(`${this.options.apiHost}${this.options.rootPath}/${route}`, {
      headers,
      ...args,
    });
    if (res) {
      if (res.status >= 400 && res.status < 600) {
        const json = await res.json();
        throw new Error(json);
      }
      return await res.json();
      // eslint-disable-next-line no-else-return
    } else {
      throw new Error('Server did not return a response');
    }
  }

  loginWithPassword(user: PasswordLoginUserType, password: string): Promise<LoginReturnType> {
    return this.fetch('loginWithPassword', {
      method: 'POST',
      body: JSON.stringify({
        user,
        password,
      }),
    });
  }

  async createUser(user: CreateUserType): Promise<string> {
    return this.fetch('createUser', {
      method: 'POST',
      body: JSON.stringify({ user }),
    });
  }

  refreshTokens(accessToken: string, refreshToken: string): Promise<LoginReturnType> {
    return this.fetch('refreshTokens', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });
  }

  logout(accessToken: string): Promise<void> {
    return this.fetch('logout', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
      }),
    });
  }

  verifyEmail(token: string): Promise<void> {
    return this.fetch('verifyEmail', {
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
    });
  }

  resetPassword(token: string, newPassword: string): Promise<void> {
    return this.fetch('resetPassword', {
      method: 'POST',
      body: JSON.stringify({
        token,
        newPassword,
      }),
    });
  }

  sendVerificationEmail(userId: string, email: string): Promise<void> {
    return this.fetch('sendVerificationEmail', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        email,
      }),
    });
  }

  sendResetPasswordEmail(userId: string, email: string): Promise<void> {
    return this.fetch('sendResetPasswordEmail', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        email,
      }),
    });
  }

  options: OptionsType;
}

const authFetch = async(path: string, request: Object) => {
  await AccountsClient.resumeSession();
  const tokens = AccountsClient.tokens();
  const headers = new Headers({ // eslint-disable-line no-shadow
    'Content-Type': 'application/json',
  });
  if (tokens.accessToken) {
    headers.append('accounts-access-token', tokens.accessToken);
  }
  return fetch(new Request(path, {
    ...{
      headers,
    },
    ...request,
  }));
};

export { authFetch };
