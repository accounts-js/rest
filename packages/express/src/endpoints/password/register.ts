import * as pick from 'lodash/pick';
import { AccountsServer } from '@accounts/server';
import { sendError } from '../../utils/send-error';

export const registerPassword = (accountsServer: AccountsServer) => async (
  req,
  res
) => {
  try {
    const userId = await accountsServer
      .getServices()
      .password.createUser(
        pick(req.body, ['username', 'password', 'email', 'profile'])
      );
    res.json({ userId });
  } catch (err) {
    sendError(res, err);
  }
};
