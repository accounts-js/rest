const defaultConfig = {
  path: '',
};

const client = {
  _config: defaultConfig,
  fetch(route, args) {
    return fetch(`${this._config.path}/${route}`, {
      ...args,
    });
  },
  login(args) {
    return this.fetch('login', {
      method: 'POST',
      body: args,
    }).then(res => (res.json()));
  },
  config(config) {
    // TODO Validation and merging.
    this._config = config;
  },
};

export default client;
