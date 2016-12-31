import { defaultsDeep } from 'lodash';
import { AccountsClient } from '@accounts/accounts';

const defaultConfig = {
};

const client = {
  fetch(route, args) {
    return fetch(`${AccountsClient.options().server}${AccountsClient.options().path}/${route}`, {
      mode: 'no-cors',
      ...args,
    }).then(res => res.json());
  },
  login(body) {
    return this.fetch('login', {
      method: 'POST',
      body,
    }).then(res => (res.json()));
  },
  createUser(body) {
    return this.fetch('createUser', {
      method: 'POST',
      body,
    });
  },
  config(config) {
    // TODO Validation
    this._config = defaultsDeep({}, config, defaultConfig);
  },
};

export default client;
