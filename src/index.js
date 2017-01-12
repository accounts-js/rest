import { defaultsDeep } from 'lodash';
import { AccountsClient } from '@accounts/accounts';

const defaultConfig = {
};

const headers = new Headers();
headers.append('Content-Type', 'application/json');

const client = {
  fetch(route, args) {
    return fetch(`${AccountsClient.options().server}${AccountsClient.options().path}/${route}`, {
      headers,
      ...args,
    }).then(res => res.json());
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
