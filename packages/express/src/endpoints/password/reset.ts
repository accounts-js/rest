import { AccountsServer } from '@accounts/server';
import { sendError } from '../../utils/send-error';

export const resetPassword = (accountsServer: AccountsServer) => async (
  req,
  res
) => {
  try {
    const { token, newPassword } = req.body;
    await accountsServer
      .getServices()
      .password.resetPassword(token, newPassword);
    res.json({ message: 'Password changed' });
  } catch (err) {
    sendError(res, err);
  }
};

export const sendResetPasswordEmail = (
  accountsServer: AccountsServer
) => async (req, res) => {
  try {
    const { email } = req.body;
    await accountsServer.getServices().password.sendResetPasswordEmail(email);
    res.json({ message: 'Email sent' });
  } catch (err) {
    sendError(res, err);
  }
};
