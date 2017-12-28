import { AccountsServer } from '@accounts/server';
import { sendError } from '../utils/send-error';

export const getUser = (accountsServer: AccountsServer) => async (req, res) => {
  try {
    const { accessToken } = req.body;
    const user = await accountsServer.resumeSession(accessToken);
    res.json(user);
  } catch (err) {
    sendError(res, err);
  }
};
