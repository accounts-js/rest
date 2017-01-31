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

const accountsExpress = (AccountsServer) => {
  const router = express.Router();
  const path = `${AccountsServer.options().path}/`;

  router.use(cors());

  const sendError = (res, err) => (err.serialize
  ? res.status(500).jsonp(err.serialize().message)
  : res.status(500).jsonp({ message: err.message }));

  router.use(async (req, res, next) => {
    const accessToken = get(req.headers, 'accounts-access-token', undefined) || get(req.body, 'accessToken', undefined);
    if (!isEmpty(accessToken)) {
      try {
        const user = await AccountsServer.resumeSession(accessToken);
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
      const loggedInUser = await AccountsServer.loginWithPassword(user, password, ip, userAgent);
      res.jsonp(loggedInUser);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post(`${path}createUser`, async (req, res) => {
    if (AccountsServer.options().forbidClientAccountCreation) {
      sendError(res, new AccountsError({
        message: 'Client account creation is forbidden',
      }));
    }
    try {
      const user = await AccountsServer.createUser(pick(req.body.user, [
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
      const refreshedSession = await AccountsServer.refreshTokens(
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
      await AccountsServer.logout(accessToken);
      res.jsonp({ message: 'Logged out' });
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
};

export default accountsExpress;
