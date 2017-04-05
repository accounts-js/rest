import express from 'express';
import { get, isEmpty, pick } from 'lodash';
import cors from 'cors';
import { AccountsError } from '@accounts/common';
import requestIp from 'request-ip';

const getUserAgent = (req) => {
  let userAgent = req.headers['user-agent'] || '';
  if (req.headers['x-ucbrowser-ua']) {  // special case of UC Browser
    userAgent = req.headers['x-ucbrowser-ua'];
  }
  return userAgent;
};

const accountsExpress = (accountsServerProvider, { path = '/accounts/' }) => {
  const getAccountsServer = typeof accountsServerProvider === 'function' ?
    (req, res) => accountsServerProvider(req, res) : () => accountsServerProvider;

  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.use(cors());

  const sendError = (res, err) => (res.status(500).jsonp(err.toString()));

  router.use(async (req, res, next) => {
    const accessToken = get(req.headers, 'accounts-access-token', undefined) || get(req.body, 'accessToken', undefined);
    if (!isEmpty(accessToken)) {
      try {
        const accountsServer = getAccountsServer(req, res);
        const user = await accountsServer.resumeSession(accessToken);
        // eslint-disable-next-line no-param-reassign
        req.user = user;
        // eslint-disable-next-line no-param-reassign
        req.userId = user.id;
      } catch (e) {
        console.log('Failed to resume session');
      }
    }
    next();
  });

  router.post(`${path}loginWithPassword`, async (req, res) => {
    try {
      const { user, password } = req.body;
      const userAgent = getUserAgent(req);
      const ip = requestIp.getClientIp(req);
      const accountsServer = getAccountsServer(req, res);
      const loggedInUser = await accountsServer.loginWithPassword(user, password, ip, userAgent);
      res.jsonp(loggedInUser);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}impersonate`, async (req, res) => {
    try {
      const { username, accessToken } = req.body;
      const userAgent = getUserAgent(req);
      const ip = requestIp.getClientIp(req);
      const accountsServer = getAccountsServer(req, res);
      const impersonateRes = await accountsServer.impersonate(accessToken, username, ip, userAgent);
      res.jsonp(impersonateRes);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}getUser`, async (req, res) => {
    try {
      const { accessToken } = req.body;
      const accountsServer = getAccountsServer(req, res);
      const user = await accountsServer.resumeSession(accessToken);
      res.jsonp(user);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}createUser`, async (req, res) => {
    const accountsServer = getAccountsServer(req, res);
    if (accountsServer.options().forbidClientAccountCreation) {
      sendError(res, new AccountsError('Client account creation is forbidden'));
    }
    try {
      const user = await accountsServer.createUser(pick(req.body.user, [
        'username',
        'password',
        'email',
        'profile',
      ]));
      res.jsonp(user);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}refreshTokens`, async (req, res) => {
    try {
      const { accessToken, refreshToken } = req.body;
      const userAgent = getUserAgent(req);
      const ip = requestIp.getClientIp(req);
      const accountsServer = getAccountsServer(req, res);
      const refreshedSession = await accountsServer.refreshTokens(
        accessToken, refreshToken, ip, userAgent,
      );
      res.jsonp(refreshedSession);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}logout`, async (req, res) => {
    try {
      const { accessToken } = req.body;
      const accountsServer = getAccountsServer(req, res);
      await accountsServer.logout(accessToken);
      res.jsonp({ message: 'Logged out' });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}verifyEmail`, async (req, res) => {
    try {
      const { token } = req.body;
      const accountsServer = getAccountsServer(req, res);
      await accountsServer.verifyEmail(token);
      res.jsonp({ message: 'Email verified' });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}resetPassword`, async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const accountsServer = getAccountsServer(req, res);
      await accountsServer.resetPassword(token, newPassword);
      res.jsonp({ message: 'Password changed' });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}sendVerificationEmail`, async (req, res) => {
    try {
      const { email } = req.body;
      const accountsServer = getAccountsServer(req, res);
      await accountsServer.sendVerificationEmail(email);
      res.jsonp({ message: 'Email sent' });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}sendResetPasswordEmail`, async (req, res) => {
    try {
      const { email } = req.body;
      const accountsServer = getAccountsServer(req, res);
      await accountsServer.sendResetPasswordEmail(email);
      res.jsonp({ message: 'Email sent' });
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
};

export default accountsExpress;
