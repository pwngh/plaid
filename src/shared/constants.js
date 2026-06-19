/** Plaid API environments accepted by `createPlaidClient`. */
export const PLAID_ENV = {
  SANDBOX: 'sandbox',
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
};

/** Top-level Plaid account types, as returned in `account.type`. */
export const ACCOUNT_TYPE = {
  DEPOSITORY: 'depository',
  CREDIT: 'credit',
  LOAN: 'loan',
  INVESTMENT: 'investment',
  OTHER: 'other',
};

/** Plaid error codes that `handlePlaidError` maps to a user-facing message. */
export const ERROR_CODES = {
  INVALID_ACCESS_TOKEN: 'INVALID_ACCESS_TOKEN',
  INVALID_LINK_TOKEN: 'INVALID_LINK_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  MFA_ERROR: 'MFA_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INSTITUTION_DOWN: 'INSTITUTION_DOWN',
  INSTITUTION_NOT_RESPONDING: 'INSTITUTION_NOT_RESPONDING',
  INSTITUTION_NO_LONGER_SUPPORTED: 'INSTITUTION_NO_LONGER_SUPPORTED',
};

/** User-facing messages keyed by Plaid error code, plus the generic `PLAID_ERROR` fallback. */
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_ACCESS_TOKEN]: 'Invalid access token provided',
  [ERROR_CODES.INVALID_LINK_TOKEN]: 'Link token has expired',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials provided',
  [ERROR_CODES.MFA_ERROR]: 'Multi-factor authentication failed',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests, please try again later',
  [ERROR_CODES.INSTITUTION_DOWN]: 'Institution is temporarily down',
  [ERROR_CODES.INSTITUTION_NOT_RESPONDING]: 'Institution is not responding',
  [ERROR_CODES.INSTITUTION_NO_LONGER_SUPPORTED]: 'Institution is no longer supported',
  PLAID_ERROR: 'There was an error connecting to your bank',
};
