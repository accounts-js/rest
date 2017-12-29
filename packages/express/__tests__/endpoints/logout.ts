import { logout } from '../../src/endpoints/logout';

const res = {
  json: jest.fn(),
  status: jest.fn(() => res),
};

describe('logout endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls loginWithService and returns the user in json format', async () => {
    const accountsServer = {
      logout: jest.fn(),
    };
    const middleware = logout(accountsServer as any);

    const req = {
      body: {
        accessToken: 'token'
      },
    };
    const reqCopy = { ...req };

    await middleware(req, res);

    expect(req).toEqual(reqCopy);
    expect(accountsServer.logout).toBeCalledWith('token');
    expect(res.json).toBeCalledWith({message: 'Logged out'});
    expect(res.status).not.toBeCalled();
  });

  it('Sends error if it was thrown on loginWithService', async () => {
    const error = { message: 'Could not login' };
    const accountsServer = {
      logout: jest.fn(() => {
        throw error;
      }),
    };
    const middleware = logout(accountsServer as any);
    const req = {
      body: {
        accessToken: 'token',
      }
    };
    const reqCopy = { ...req };

    await middleware(req, res);

    expect(req).toEqual(reqCopy);
    expect(accountsServer.logout).toBeCalledWith('token');
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith(error);
  });
});
