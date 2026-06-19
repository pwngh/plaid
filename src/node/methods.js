import { handlePlaidError } from '../shared/utils.js';

/**
 * Error thrown by every method in this module when a Plaid call fails.
 * `message` is the user-facing text and `code` is the normalized Plaid error
 * code (or `'PLAID_ERROR'`), both produced by `handlePlaidError`.
 *
 * @typedef {Error & { code: string }} PlaidIntegrationError
 */

/** Runs a Plaid SDK call, returning `response.data` and rethrowing any failure as a {@link PlaidIntegrationError}. */
const callPlaid = async (fn) => {
  try {
    const response = await fn();
    return response?.data;
  } catch(error) {
    const { message, code } = handlePlaidError(error);
    const err = new Error(message);
    err.code = code;
    throw err;
  }
};

/**
 * Create a Link token used to initialize Plaid Link for a user.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {Object} options
 * @param {string} options.userId - Stable, unique ID for the end user; sent as `client_user_id`.
 * @param {string} options.clientName - Application name displayed in the Link UI.
 * @param {string[]} [options.products=['auth', 'identity']] - Plaid products to request access to.
 * @param {string[]} [options.countryCodes=['US']] - ISO 3166-1 alpha-2 country codes.
 * @param {string} [options.language='en'] - Link UI language.
 * @returns {Promise<import('plaid').LinkTokenCreateResponse>} Resolves with the `link_token` and its expiration.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const createLinkToken = async (client, {
  userId,
  clientName,
  products = ['auth', 'identity'],
  countryCodes = ['US'],
  language = 'en',
}) =>
  callPlaid(() => client.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: clientName,
    products,
    country_codes: countryCodes,
    language,
  }));

/**
 * Exchange a public token from Link for a permanent access token.
 *
 * Call this from a server-side action after Link's `onSuccess`; the public
 * token is single-use and short-lived.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {string} publicToken - `public_token` produced by Link's `onSuccess`.
 * @returns {Promise<import('plaid').ItemPublicTokenExchangeResponse>} Resolves with `access_token` and `item_id`; store these server-side only.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const exchangePublicToken = async (client, publicToken) =>
  callPlaid(() => client.itemPublicTokenExchange({
    public_token: publicToken,
  }));

/**
 * Fetch the accounts linked under an item, with cached balances.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {string} accessToken - Access token for the linked item.
 * @returns {Promise<import('plaid').AccountsGetResponse>} Resolves with `accounts` and the owning `item`.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const getAccounts = async (client, accessToken) =>
  callPlaid(() => client.accountsGet({
    access_token: accessToken,
  }));

/**
 * Fetch transactions for an item within a date range.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {string} accessToken - Access token for the linked item.
 * @param {Object} options
 * @param {string} options.startDate - Inclusive start date, `YYYY-MM-DD`.
 * @param {string} options.endDate - Inclusive end date, `YYYY-MM-DD`.
 * @param {import('plaid').TransactionsGetRequestOptions} [options.options={}] - Pagination and filtering (`count`, `offset`, `account_ids`, ...).
 * @returns {Promise<import('plaid').TransactionsGetResponse>} Resolves with `transactions`, `accounts`, and `total_transactions`.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const getTransactions = async (client, accessToken, {
  startDate,
  endDate,
  options = {},
}) =>
  callPlaid(() => client.transactionsGet({
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    options,
  }));

/**
 * Fetch real-time balances for every account under an item.
 *
 * Unlike `getAccounts`, this forces a live balance refresh at the
 * institution, so it is slower but always current.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {string} accessToken - Access token for the linked item.
 * @returns {Promise<import('plaid').AccountsGetResponse>} Resolves with `accounts` carrying up-to-date `balances`.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const getBalances = async (client, accessToken) =>
  callPlaid(() => client.accountsBalanceGet({
    access_token: accessToken,
  }));

/**
 * Fetch identity data on file for an item's accounts.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {string} accessToken - Access token for the linked item.
 * @returns {Promise<import('plaid').IdentityGetResponse>} Resolves with `accounts`, each including owner names, emails, addresses, and phone numbers.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const getIdentity = async (client, accessToken) =>
  callPlaid(() => client.identityGet({
    access_token: accessToken,
  }));

/**
 * Look up a US institution by its Plaid institution ID.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {string} [institutionId] - Plaid institution ID (`ins_*`); `null`/`undefined` short-circuits to `null` without calling Plaid.
 * @param {string[]} [countryCodes=['US']] - ISO 3166-1 alpha-2 country codes the institution was created under; must include the item's country.
 * @returns {Promise<import('plaid').InstitutionsGetByIdResponse | null>} Resolves with the `institution`, or `null` when no ID was given.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const getInstitution = async (client, institutionId, countryCodes = ['US']) => {
  if(institutionId == null) {
    return null;
  }
  return callPlaid(() => client.institutionsGetById({
    institution_id: institutionId,
    country_codes: countryCodes,
  }));
};

/**
 * Fetch account and routing numbers for an item's depository accounts.
 *
 * @param {import('plaid').PlaidApi} client - Client from `createPlaidClient`.
 * @param {string} accessToken - Access token for the linked item.
 * @returns {Promise<import('plaid').AuthGetResponse>} Resolves with `accounts` and the ACH/wire `numbers` needed for transfers.
 * @throws {PlaidIntegrationError} When the Plaid request fails.
 */
export const getAuth = async (client, accessToken) =>
  callPlaid(() => client.authGet({
    access_token: accessToken,
  }));
