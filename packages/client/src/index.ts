import { forIn, isPlainObject } from 'lodash';
import { TransportInterface, AccountsClient } from '@accounts/client';
import {
  AccountsError,
  CreateUserType,
  PasswordLoginUserType,
  LoginReturnType,
  UserObjectType,
  ImpersonateReturnType,
} from '@accounts/common';

export interface OptionsType {
  apiHost: string;
  rootPath: string;
}

const headers = {
  'Content-Type': 'application/json',
};

export default class Client implements TransportInterface {
  private options: OptionsType;

  constructor(options: OptionsType) {
    this.options = options;
  }

  public async fetch(
    route: string,
    args: object,
    customHeaders?: object
  ): Promise<any> {
    const fetchOptions = {
      headers: this._loadHeadersObject(customHeaders),
      ...args,
    };
    const res = await fetch(
      `${this.options.apiHost}${this.options.rootPath}/${route}`,
      fetchOptions
    );

    if (res) {
      if (res.status >= 400 && res.status < 600) {
        const { message, loginInfo, errorCode } = await res.json();
        throw new AccountsError(message, loginInfo, errorCode);
      }
      return await res.json();
    } else {
      throw new Error('Server did not return a response');
    }
  }

  public loginWithPassword(
    user: PasswordLoginUserType,
    password: string,
    customHeaders?: object
  ): Promise<LoginReturnType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        user,
        password,
      }),
    };
    return this.fetch('loginWithPassword', args, customHeaders);
  }

  public impersonate(
    accessToken: string,
    username: string,
    customHeaders?: object
  ): Promise<ImpersonateReturnType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        username,
      }),
    };
    return this.fetch('impersonate', args, customHeaders);
  }

  public async createUser(
    user: CreateUserType,
    customHeaders?: object
  ): Promise<string> {
    const args = {
      method: 'POST',
      body: JSON.stringify({ user }),
    };
    return this.fetch('createUser', args, customHeaders);
  }

  public refreshTokens(
    accessToken: string,
    refreshToken: string,
    customHeaders?: object
  ): Promise<LoginReturnType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    };
    return this.fetch('refreshTokens', args, customHeaders);
  }

  public logout(accessToken: string, customHeaders?: object): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
      }),
    };
    return this.fetch('logout', args, customHeaders);
  }

  public verifyEmail(token: string, customHeaders?: object): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
    };
    return this.fetch('verifyEmail', args, customHeaders);
  }

  public async getUser(
    accessToken: string,
    customHeaders?: object
  ): Promise<UserObjectType> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
      }),
    };
    return this.fetch('getUser', args, customHeaders);
  }

  public resetPassword(
    token: string,
    newPassword: string,
    customHeaders?: object
  ): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        token,
        newPassword,
      }),
    };
    return this.fetch('resetPassword', args, customHeaders);
  }

  public sendVerificationEmail(
    email: string,
    customHeaders?: object
  ): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    };
    return this.fetch('sendVerificationEmail', args, customHeaders);
  }

  public sendResetPasswordEmail(
    email: string,
    customHeaders?: object
  ): Promise<void> {
    const args = {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    };
    return this.fetch('sendResetPasswordEmail', args, customHeaders);
  }

  private _loadHeadersObject(plainHeaders: object): object {
    if (isPlainObject(plainHeaders)) {
      const customHeaders = headers;
      forIn(plainHeaders, (v: string, k: string) => {
        customHeaders[k] = v;
      });

      return customHeaders;
    }

    return headers;
  }
}

const authFetch = async (
  accounts: AccountsClient,
  path: string,
  request: object
) => {
  await accounts.refreshSession();
  const { accessToken } = await accounts.tokens();
  const headersCopy = { ...headers };

  if (accessToken) {
    headersCopy['accounts-access-token'] = accessToken;
  }

  /* tslint:disable no-string-literal */
  if (request['headers']) {
    forIn(request['headers'], (v: string, k: string) => {
      headersCopy[v] = k;
    });
  }
  /* tslint:enable no-string-literal */

  const fetchOptions = {
    ...request,
    headers: headersCopy,
  };
  return fetch(path, fetchOptions);
};

export { authFetch };
