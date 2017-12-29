import accountsExpress from '../src';
import { userLoader } from '../src/express-middleware';
import * as express from 'express';

jest.mock('express', () => {
  const mockRouter = {
    post: jest.fn(),
    use: jest.fn(),
    get: jest.fn(),
  };
  return {
    Router: () => mockRouter,
  };
});

const router = express.Router();

describe('express middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Defines default endpoints on given path fragment', () => {
    accountsExpress(
      {
        getServices: () => ({}),
      } as any,
      { path: 'test' }
    );
    expect(router.use).toHaveBeenCalledTimes(1); // Assigning user provider
    expect(router.post.mock.calls[0][0]).toBe('test/impersonate');
    expect(router.post.mock.calls[1][0]).toBe('test/user');
    expect(router.post.mock.calls[2][0]).toBe('test/refreshTokens');
    expect(router.post.mock.calls[3][0]).toBe('test/logout');
    expect(router.post.mock.calls[4][0]).toBe('test/:service/authenticate');
  });

  it('Defines password endpoints when password service is present', () => {
    accountsExpress(
      {
        getServices: () => ({
          password: {},
        }),
      } as any,
      { path: 'test' }
    );
    expect(router.use).toHaveBeenCalledTimes(1); // Assigning user provider
    expect(router.post.mock.calls[0][0]).toBe('test/impersonate');
    expect(router.post.mock.calls[1][0]).toBe('test/user');
    expect(router.post.mock.calls[2][0]).toBe('test/refreshTokens');
    expect(router.post.mock.calls[3][0]).toBe('test/logout');
    expect(router.post.mock.calls[4][0]).toBe('test/:service/authenticate');
    expect(router.post.mock.calls[5][0]).toBe('test/password/register');
    expect(router.post.mock.calls[6][0]).toBe('test/password/verifyEmail');
    expect(router.post.mock.calls[7][0]).toBe('test/password/resetPassword');
    expect(router.post.mock.calls[8][0]).toBe(
      'test/password/sendVerificationEmail'
    );
    expect(router.post.mock.calls[9][0]).toBe(
      'test/password/sendResetPasswordEmail'
    );
  });

  it('Defines oauth endpoints when oauth service is present', () => {
    accountsExpress(
      {
        getServices: () => ({
          oauth: {},
        }),
      } as any,
      { path: 'test' }
    );
    expect(router.use).toHaveBeenCalledTimes(1); // Assigning user provider
    expect(router.post.mock.calls[0][0]).toBe('test/impersonate');
    expect(router.post.mock.calls[1][0]).toBe('test/user');
    expect(router.post.mock.calls[2][0]).toBe('test/refreshTokens');
    expect(router.post.mock.calls[3][0]).toBe('test/logout');
    expect(router.post.mock.calls[4][0]).toBe('test/:service/authenticate');
    expect(router.get.mock.calls[0][0]).toBe('test/oauth/:provider/callback');
  });
});

const user = { id: '1' };
const accountsServer = {
  resumeSession: jest.fn(() => user),
};
describe('userLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does noting when request has no accessToken', async () => {
    const provider = userLoader(accountsServer as any);
    const req = {};
    const res = {};
    const next = jest.fn();
    await provider(req, res, next);

    expect(accountsServer.resumeSession).not.toHaveBeenCalled();
    expect(req).toEqual({});
    expect(res).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });
  
  it('load user to req object when access token is present on the headers', async () => {
    const provider = userLoader(accountsServer as any);
    const req = {
      headers: {
        'accounts-access-token': 'token',
      },
    };
    const reqCopy = {...req};
    const res = {};
    const next = jest.fn();
    await provider(req, res, next);
    
    expect(accountsServer.resumeSession).toHaveBeenCalledWith('token');
    expect(req).toEqual({...reqCopy, user, userId: user.id});
    expect(res).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });
  
  it('load user to req object when access token is present on the body', async () => {
    const provider = userLoader(accountsServer as any);
    const req = {
      body: {
        accessToken: 'token',
      },
    };
    const reqCopy = {...req};
    const res = {};
    const next = jest.fn();
    await provider(req, res, next);
    
    expect(accountsServer.resumeSession).toHaveBeenCalledWith('token');
    expect(req).toEqual({...reqCopy, user, userId: user.id});
    expect(res).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });
});
