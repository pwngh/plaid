import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { PLAID_ENV } from '../shared/utils.js';

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
 * @param {Object} [config.options] - Extra axios request options spread into `baseOptions`. Any `options.headers` are merged with (and individually override) the Plaid auth headers.
 * @returns {import('plaid').PlaidApi} Configured Plaid client.
 * @throws {Error} When `env` is not a known Plaid environment.
 */
export const createPlaidClient = ({
  clientId,
  secret,
  env = PLAID_ENV.SANDBOX,
  options = {},
}) => {
  const basePath = PlaidEnvironments[env];
  if(!basePath) {
    throw new Error(
      `Unknown Plaid env "${env}". Use one of: ${Object.values(PLAID_ENV).join(', ')}.`
    );
  }

  const { headers, ...restOptions } = options;
  const config = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
        ...headers,
      },
      ...restOptions,
    },
  });

  return new PlaidApi(config);
};
