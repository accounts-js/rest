import * as express from 'express';
import { Router } from 'express';
import { get, isEmpty, pick } from 'lodash';
import { AccountsError } from '@accounts/common';
import { AccountsServer } from '@accounts/server';
import requestIp from 'request-ip';

export const getUserAgent = req => {
  let userAgent = req.headers['user-agent'] || '';
  if (req.headers['x-ucbrowser-ua']) {
    // special case of UC Browser
    userAgent = req.headers['x-ucbrowser-ua'];
  }
  return userAgent;
};

export const sendError = (res, err) =>
  res.status(400).json({
    message: err.message,
    loginInfo: err.loginInfo,
    errorCode: err.errorCode,
  });

export interface AccountsExpressOptions {
  path: string;
}

const defaultOptions = {
  path: '/accounts',
};

const accountsExpress = (
  accountsServer: AccountsServer,
  options: AccountsExpressOptions
): Router => {
  const { path } = options;
  const router = express.Router();

  router.use(async (req, res, next) => {
    const accessToken =
      get(req.headers, 'accounts-access-token', undefined) ||
      get(req.body, 'accessToken', undefined);
    if (!isEmpty(accessToken)) {
      try {
        const user = await accountsServer.resumeSession(accessToken);
        req.user = user;
        req.userId = user.id;
      } catch (e) {
        // Do nothing
      }
    }
    next();
  });

  router.post(`${path}impersonate`, async (req, res) => {
    try {
      const { username, accessToken } = req.body;
      const userAgent = getUserAgent(req);
      const ip = requestIp.getClientIp(req);
      const impersonateRes = await accountsServer.impersonate(
        accessToken,
        username,
        ip,
        userAgent
      );
      res.json(impersonateRes);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}user`, async (req, res) => {
    try {
      const { accessToken } = req.body;
      const user = await accountsServer.resumeSession(accessToken);
      res.json(user);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}refreshTokens`, async (req, res) => {
    try {
      const { accessToken, refreshToken } = req.body;
      const userAgent = getUserAgent(req);
      const ip = requestIp.getClientIp(req);
      const refreshedSession = await accountsServer.refreshTokens(
        accessToken,
        refreshToken,
        ip,
        userAgent
      );
      res.json(refreshedSession);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}logout`, async (req, res) => {
    try {
      const { accessToken } = req.body;
      await accountsServer.logout(accessToken);
      res.json({ message: 'Logged out' });
    } catch (err) {
      sendError(res, err);
    }
  });

  const services = accountsServer.getServices();

  // @accounts/password
  if (services.password) {
    router.post(`${path}/register/password`, async (req, res) => {
      try {
        const loggedInUser = await services.password.createUser(
          pick(req.body.user, ['username', 'password', 'email', 'profile'])
        );
        res.json(loggedInUser);
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}verifyEmail`, async (req, res) => {
      try {
        const { token } = req.body;
        await services.password.verifyEmail(token);
        res.json({ message: 'Email verified' });
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}resetPassword`, async (req, res) => {
      try {
        const loggedInUser = await services.password.createUser(
          pick(req.body.user, ['username', 'password', 'email', 'profile'])
        );
        res.json(loggedInUser);
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}sendVerificationEmail`, async (req, res) => {
      try {
        const { email } = req.body;
        await services.password.sendVerificationEmail(email);
        res.json({ message: 'Email sent' });
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}sendResetPasswordEmail`, async (req, res) => {
      try {
        const { email } = req.body;
        await services.password.sendResetPasswordEmail(email);
        res.json({ message: 'Email sent' });
      } catch (err) {
        sendError(res, err);
      }
    });
  }

  return router;
};

export default accountsExpress;
