window.fetch = jest.fn().mockImplementation(() => ({
  status: 200,
  json: jest.fn().mockImplementation(() => ({ test: 'test' })),
}));

window.Headers = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
}));

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
});
