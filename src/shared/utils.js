import { ACCOUNT_TYPE, ERROR_CODES, ERROR_MESSAGES } from './constants.js';

/**
 * Format an amount as US dollars, e.g. `1234.5` becomes `"$1,234.50"`.
 *
 * @param {number} [amount] - Dollar amount; `null`/`undefined` format as `$0.00`.
 * @returns {string} Localized USD currency string.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format an account mask for display, e.g. `"1234"` becomes `"****1234"`.
 *
 * @param {string} [mask] - Last digits of the account number, as returned by Plaid.
 * @returns {string} Masked account number, or a fallback message when no mask exists.
 */
export const formatAccountMask = (mask) => {
  return mask ? `****${mask}` : 'No account number available';
};

/**
 * Map a Plaid account type to a human-readable label.
 *
 * @param {string} type - A Plaid `account.type` value (see `ACCOUNT_TYPE`).
 * @returns {string} Display label, or the raw type when unmapped.
 */
export const getAccountTypeLabel = (type) => {
  const labels = {
    [ACCOUNT_TYPE.DEPOSITORY]: 'Bank Account',
    [ACCOUNT_TYPE.CREDIT]: 'Credit Card',
    [ACCOUNT_TYPE.LOAN]: 'Loan',
    [ACCOUNT_TYPE.INVESTMENT]: 'Investment',
    [ACCOUNT_TYPE.OTHER]: 'Other',
  };
  return labels[type] || type;
};

/**
 * User-presentable form of any error raised during a Plaid interaction.
 *
 * @typedef {Object} NormalizedPlaidError
 * @property {string} message - Description safe to render in the UI.
 * @property {string} code - Plaid error code, or `'PLAID_ERROR'` when unrecognized.
 */

/**
 * Normalize any error from a Plaid call into a user-facing message and code.
 *
 * Recognizes mapped Plaid error codes (from the response body or the error
 * itself), falls back to message sniffing for rate-limit and institution
 * outages, and defaults to the generic `PLAID_ERROR`. Never throws.
 *
 * @param {*} error - Anything caught from a Plaid SDK call or consumer callback.
 * @returns {NormalizedPlaidError} Message and code for display and branching.
 */
export const handlePlaidError = (error) => {
  const errorCode = error?.response?.data?.error_code ??
    error?.error_code ??
    error?.code;

  if(errorCode && ERROR_MESSAGES[errorCode]) {
    return {
      message: ERROR_MESSAGES[errorCode],
      code: errorCode,
    };
  }

  const errorMessage = error?.message?.toLowerCase() ?? '';

  if(errorMessage.includes('rate limit')) {
    return {
      message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    };
  }

  if(errorMessage.includes('institution')) {
    return {
      message: ERROR_MESSAGES[ERROR_CODES.INSTITUTION_NOT_RESPONDING],
      code: ERROR_CODES.INSTITUTION_NOT_RESPONDING,
    };
  }

  return {
    message: ERROR_MESSAGES.PLAID_ERROR,
    code: 'PLAID_ERROR',
  };
};

export * from './constants.js';
