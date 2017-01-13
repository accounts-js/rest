import { defaultsDeep } from 'lodash';
import { AccountsClient } from '@accounts/accounts';

const defaultConfig = {
};

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
  config(config) {
    // TODO Validation
    this._config = defaultsDeep({}, config, defaultConfig);
  },
};

export default client;
