import { AccountsError } from '@accounts/common';

const headers = new Headers();
headers.append('Content-Type', 'application/json');

export class RestClient {
  constructor(options) {
    this.options = options;
  }
  async fetch(route, args) {
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
  loginWithPassword(user, password) {
    return this.fetch('loginWithPassword', {
      method: 'POST',
      body: JSON.stringify({
        user,
        password,
      }),
    });
  }
  createUser(user) {
    return this.fetch('createUser', {
      method: 'POST',
      body: JSON.stringify({ user }),
    });
  }
  refreshTokens(accessToken, refreshToken) {
    return this.fetch('refreshTokens', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });
  }
  logout(accessToken) {
    return this.fetch('logout', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
      }),
    });
  }
  verifyEmail(token) {
    return this.fetch('verifyEmail', {
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
    });
  }
  resetPassword(token, newPassword) {
    return this.fetch('resetPassword', {
      method: 'POST',
      body: JSON.stringify({
        token,
        newPassword,
      }),
    });
  }
  sendVerificationEmail(userId, email) {
    return this.fetch('sendVerificationEmail', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        email,
      }),
    });
  }
  sendResetPasswordEmail(userId, email) {
    return this.fetch('sendResetPasswordEmail', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        email,
      }),
    });
  }
}

export default RestClient;

const authFetch = async (path, request) => {
  await this.accounts.resumeSession();
  const tokens = this.accounts.tokens();
  const headers = new Headers({ // eslint-disable-line no-shadow
    'Content-Type': 'application/json',
  });
  if (tokens.accessToken) {
    headers.set('accounts-access-token', tokens.accessToken);
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
