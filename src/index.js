import { defaultsDeep } from 'lodash';

const defaultConfig = {
  path: '',
  prefix: 'accounts',
};

const client = {
  fetch(route, args) {
    return fetch(`${this._config.path}/${this._config.prefix}/${route}`, {
      ...args,
    });
  },
  login(body) {
    return this.fetch('login', {
      method: 'POST',
      body,
    }).then(res => (res.json()));
  },
  signup(body) {
    return this.fetch('signup', {
      method: 'POST',
      body,
    }).then(res => (res.json()));
  },
  config(config) {
    // TODO Validation
    this._config = defaultsDeep({}, config, defaultConfig);
  },
};

export default client;
