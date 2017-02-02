import AccountsClient from '@accounts/client';

const headers = new Headers();
headers.append('Content-Type', 'application/json');

const client = {
  async fetch(route, args) {
    const res = await fetch(`${AccountsClient.options().server}${AccountsClient.options().path}/${route}`, {
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
  },
  loginWithPassword(user, password) {
    return this.fetch('loginWithPassword', {
      method: 'POST',
      body: JSON.stringify({
        user,
        password,
      }),
    });
  },
  createUser(user) {
    return this.fetch('createUser', {
      method: 'POST',
      body: JSON.stringify({ user }),
    });
  },
  refreshTokens(accessToken, refreshToken) {
    return this.fetch('refreshTokens', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });
  },
  logout(accessToken) {
    return this.fetch('logout', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
      }),
    });
  },
};

export default client;

const authFetch = async (path, request) => {
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
