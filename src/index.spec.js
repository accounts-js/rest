import nock from 'nock';
import 'isomorphic-fetch';
import client from './index';

const PATH = 'http://127.0.0.1';

client.config({
  path: PATH,
});

describe('client', () => {
  it('login', () => {
    nock(PATH)
    .post('/accounts/login', {})
    .reply(200, {
      state: 200,
      message: 'Mocked response',
    });

    return client.login({}).then((res) => {
      expect(res).toEqual({
        state: 200,
        message: 'Mocked response',
      });
    });
  });
});
