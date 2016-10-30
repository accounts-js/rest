/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import 'isomorphic-fetch';
import client from './index';

const PATH = 'http://127.0.0.1';

chai.use(sinonChai);
chai.use(chaiAsPromised);

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
      expect(res).to.eql({
        state: 200,
        message: 'Mocked response',
      });
    });
  });
});
