import * as requestIp from 'request-ip';
import { AccountsServer } from '@accounts/server';
import { getUserAgent } from '../../utils/get-user-agent';
import { sendError } from '../../utils/send-error';

export const providerCallback = (accountsServer: AccountsServer) => async (
  req,
  res
) => {
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
};
