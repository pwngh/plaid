import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { PLAID_ENV } from '../shared/utils';

/**
 * Create a Plaid API client authenticated with the given credentials.
 *
 * The returned client is what every method in this package's `node` entry
 * takes as its first argument. Construct it server-side only — never expose
 * the secret to the browser.
 *
 * @param {Object} config
 * @param {string} config.clientId - Plaid client ID, sent as the `PLAID-CLIENT-ID` header.
 * @param {string} config.secret - Plaid secret for the chosen environment, sent as the `PLAID-SECRET` header.
 * @param {string} [config.env='sandbox'] - One of `PLAID_ENV`: `'sandbox'`, `'development'`, or `'production'`.
 * @param {Object} [config.options] - Extra axios request options spread into `baseOptions`. Caution: passing `options.headers` replaces the auth headers entirely (no merge) — include `PLAID-CLIENT-ID` and `PLAID-SECRET` yourself if you set it.
 * @returns {import('plaid').PlaidApi} Configured Plaid client.
 */
export const createPlaidClient = ({
  clientId,
  secret,
  env = PLAID_ENV.SANDBOX,
  options = {},
}) => {
  const config = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
        ...options.headers,
      },
      ...options,
    },
  });

  return new PlaidApi(config);
};
