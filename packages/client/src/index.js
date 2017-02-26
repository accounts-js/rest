// @flow

import type { TransportInterface, AccountsClient } from '@accounts/client';
import { AccountsError } from '@accounts/common';
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
    // $FlowFixMe
    const res = await fetch(`${this.options.server}${this.options.path}/${route}`, {
      headers,
      ...args,
    });
    if (res) {
      if (res.status >= 400 && res.status < 600) {
        const {
         message,
         loginInfo,
         errorCode,
       } = JSON.parse(await res.json());
        throw new AccountsError(message, loginInfo, errorCode);
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

const authFetch = async (accounts: AccountsClient, path: string, request: Object) => {
  await accounts.resumeSession();
  const { accessToken } = await accounts.tokens();
  const headers = new Headers({ // eslint-disable-line no-shadow
    'Content-Type': 'application/json',
  });
  if (accessToken) {
    headers.set('accounts-access-token', accessToken);
  }
  if (request.headers) {
    for (const pair of request.headers.entries()) {
      headers.set(pair[0], pair[1]);
    }
  }
  return fetch(new Request(path, {
    ...request,
    headers,
  }));
};

export { authFetch };
