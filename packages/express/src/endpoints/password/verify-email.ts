import { AccountsServer } from '@accounts/server';
import { sendError } from '../../utils/send-error';

export const verifyEmail = (accountsServer: AccountsServer) => async (
  req,
  res
) => {
  try {
    const { token } = req.body;
    await accountsServer.getServices().password.verifyEmail(token);
    res.json({ message: 'Email verified' });
  } catch (err) {
    sendError(res, err);
  }
};

export const sendVerificationEmail = (accountsServer: AccountsServer) => async (
  req,
  res
) => {
  try {
    const { email } = req.body;
    await accountsServer.getServices().password.sendVerificationEmail(email);
    res.json({ message: 'Email sent' });
  } catch (err) {
    sendError(res, err);
  }
};
