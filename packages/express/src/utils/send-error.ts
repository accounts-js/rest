export const sendError = (res, err) =>
  res.status(400).json({
    message: err.message,
    loginInfo: err.loginInfo,
    errorCode: err.errorCode,
  });