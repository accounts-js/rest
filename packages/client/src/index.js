// @flow

import { forIn, isPlainObject } from 'lodash';
import type { TransportInterface, AccountsClient } from '@accounts/client';
import { AccountsError } from '@accounts/common';
import type {
  CreateUserType,
  PasswordLoginUserType,
  LoginReturnType,
  UserObjectType,
  ImpersonateReturnType,
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

  async fetch(route: string, args: Object, customHeaders?: Object): Promise<any> {
    const res = await fetch(`${this.options.apiHost}${this.options.rootPath}/${route}`, {
      headers: this._loadHeadersObject(customHeaders),
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

  // eslint-disable-next-line max-len
  loginWithPassword(user: PasswordLoginUserType, password: string, customHeaders?: Object): Promise<LoginReturnType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        user,
        password,
      }),
    };
    return this.fetch('loginWithPassword', args, customHeaders);
  }

  // eslint-disable-next-line max-len
  impersonate(accessToken: string, username: string, customHeaders?: Object): Promise<ImpersonateReturnType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        username,
      }),
    };
    return fetch('impersonate', args, customHeaders);
  }

  async createUser(user: CreateUserType, customHeaders?: Object): Promise<string> {
    const args = {
      method: 'POST',
      body: JSON.stringify({ user }),
    };
    return this.fetch('createUser', args, customHeaders);
  }

  // eslint-disable-next-line max-len
  refreshTokens(accessToken: string, refreshToken: string, customHeaders?: Object): Promise<LoginReturnType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    };
    return this.fetch('refreshTokens', args, customHeaders);
  }

  logout(accessToken: string, customHeaders?: Object): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
      }),
    };
    return this.fetch('logout', args, customHeaders);
  }

  verifyEmail(token: string, customHeaders?: Object): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
    };
    return this.fetch('verifyEmail', args, customHeaders);
  }

  async getUser(accessToken: string, customHeaders?: Object): Promise<UserObjectType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
      }),
    };
    return this.fetch('getUser', args, customHeaders);
  }

  resetPassword(token: string, newPassword: string, customHeaders?: Object): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        token,
        newPassword,
      }),
    };
    return this.fetch('resetPassword', args, customHeaders);
  }

  sendVerificationEmail(email: string, customHeaders?: Object): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    };
    return this.fetch('sendVerificationEmail', args, customHeaders);
  }

  sendResetPasswordEmail(email: string, customHeaders?: Object): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    };
    return this.fetch('sendResetPasswordEmail', args, customHeaders);
  }

  _loadHeadersObject(plainHeaders: ?Object): Headers {
    if (isPlainObject(plainHeaders)) {
      const customHeaders = new Headers(headers);
      forIn(plainHeaders, (v: string, k: string) => customHeaders.set(k, v));

      return customHeaders;
    }

    return headers;
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
