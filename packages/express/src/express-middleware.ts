import * as express from 'express';
import { Router } from 'express';
import { get, isEmpty, pick } from 'lodash';
import * as requestIp from 'request-ip';
import { AccountsError } from '@accounts/common';
import { AccountsServer } from '@accounts/server';

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
  path?: string;
}

const defaultOptions: AccountsExpressOptions = {
  path: '/accounts',
};

const accountsExpress = (
  accountsServer: AccountsServer,
  options: AccountsExpressOptions = {}
): Router => {
  options = { ...defaultOptions, ...options };
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

  router.post(`${path}/impersonate`, async (req, res) => {
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

  router.post(`${path}/user`, async (req, res) => {
    try {
      const { accessToken } = req.body;
      const user = await accountsServer.resumeSession(accessToken);
      res.json(user);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}/refreshTokens`, async (req, res) => {
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

  router.post(`${path}/logout`, async (req, res) => {
    try {
      const { accessToken } = req.body;
      await accountsServer.logout(accessToken);
      res.json({ message: 'Logged out' });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}/:service/authenticate`, async (req, res) => {
    try {
      const serviceName = req.params.service;
      const userAgent = getUserAgent(req);
      const ip = requestIp.getClientIp(req);
      const loggedInUser = await accountsServer.loginWithService(
        serviceName,
        req.body,
        { ip, userAgent }
      );
      res.json(loggedInUser);
    } catch (err) {
      sendError(res, err);
    }
  });

  const services = accountsServer.getServices();

  // @accounts/password
  if (services.password) {
    router.post(`${path}/password/register`, async (req, res) => {
      try {
        const userId = await services.password.createUser(
          pick(req.body, ['username', 'password', 'email', 'profile'])
        );
        res.json({ userId });
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}/password/verifyEmail`, async (req, res) => {
      try {
        const { token } = req.body;
        await services.password.verifyEmail(token);
        res.json({ message: 'Email verified' });
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}/password/resetPassword`, async (req, res) => {
      try {
        const { token, newPassword } = req.body;
        await services.password.resetPassword(token, newPassword);
        res.json({ message: 'Password changed' });
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}/password/sendVerificationEmail`, async (req, res) => {
      try {
        const { email } = req.body;
        await services.password.sendVerificationEmail(email);
        res.json({ message: 'Email sent' });
      } catch (err) {
        sendError(res, err);
      }
    });

    router.post(`${path}/password/sendResetPasswordEmail`, async (req, res) => {
      try {
        const { email } = req.body;
        await services.password.sendResetPasswordEmail(email);
        res.json({ message: 'Email sent' });
      } catch (err) {
        sendError(res, err);
      }
    });
  }

  if (services.oauth) {
    router.get(`${path}/oauth/:provider/callback`, async (req, res) => {
      try {
        const userAgent = getUserAgent(req);
        const ip = requestIp.getClientIp(req);
        const loggedInUser = await accountsServer.loginWithService(
          'oauth',
          {
            ...req.params,
            ...req.query,
          },
          { ip, userAgent }
        );
        res.json(loggedInUser);
      } catch (err) {
        sendError(res, err);
      }
    });
  }

  return router;
};

export default accountsExpress;
