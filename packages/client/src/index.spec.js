import fetch from 'node-fetch';

window.fetch = jest.fn().mockImplementation(() => ({
  status: 200,
  json: jest.fn().mockImplementation(() => ({ test: 'test' })),
}));

window.Headers = fetch.Headers;

const RestClient = require('./index').default;

describe('RestClient', () => {
  it('should have a way to configure api host address and root path', () => {
    const client = new RestClient({
      apiHost: 'http://localhost:3000/',
      rootPath: 'accounts',
    });

    expect(client.options.apiHost).toBe('http://localhost:3000/');
    expect(client.options.rootPath).toBe('accounts');

    return client.fetch('try').then(() => {
      expect(window.fetch.mock.calls[0][0]).toBe('http://localhost:3000/accounts/try');
    });
  });

  describe('fetch', () => {
    const client = new RestClient({
      apiHost: 'http://localhost:3000/',
      rootPath: 'accounts',
    });

    it('should enable custom headers', () =>
      client.fetch('route', {}, { origin: 'localhost:3000' })
        .then(() => expect(window.fetch.mock.calls[1][1].headers.origin).toBe('localhost:3000')),
    );
  });

  describe('impersonate', () => {
    const client = new RestClient({
      apiHost: 'http://localhost:3000',
      rootPath: '/accounts',
    });

    it('should call fetch with impersonate path', () =>
      client.impersonate('token', 'user')
        .then(() => expect(window.fetch.mock.calls[2][0]).toBe('http://localhost:3000/accounts/impersonate'))
    );
  });
});
