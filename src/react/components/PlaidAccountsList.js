import { usePlaidAccounts } from '../hooks/usePlaidAccounts';
import {
  formatAccountMask,
  formatCurrency,
  getAccountTypeLabel,
} from '../../shared/utils';

/**
 * A linked bank account as returned by the consumer's accounts route.
 *
 * @typedef {Object} PlaidAccount
 * @property {string} account_id
 * @property {string} name
 * @property {string} [official_name]
 * @property {string} type
 * @property {{ current?: number, iso_currency_code?: string, unofficial_currency_code?: string }} [balances]
 * @property {string} [mask]
 */

/**
 * Fetch and render the user's linked bank accounts, with loading, error,
 * and empty states.
 *
 * Built on `usePlaidAccounts`, so the consumer must provide a Remix action
 * route that returns `{ accounts }` (see that hook for the full route
 * contract). Failed loads render the normalized error with a retry button.
 *
 * @param {Object} props
 * @param {string} [props.action] - Remix action route the accounts are fetched from. Defaults to `/api/plaid/accounts` (via `usePlaidAccounts`).
 * @param {(account: PlaidAccount) => void} [props.onAccountSelect] - Called with the account the user clicks.
 * @param {string} [props.className] - Classes appended to the list container.
 */
export const PlaidAccountsList = ({
  action,
  onAccountSelect,
  className = '',
}) => {
  const { accounts, isLoading, error, refresh } = usePlaidAccounts({ action });
  const interactive = typeof onAccountSelect === 'function';

  if(error) {
    return (
      <div className="text-center text-red-600 py-4">
        {error}
        <button
          type="button"
          onClick={refresh}
          className="ml-2 text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if(isLoading) {
    return (
      <div
        className="flex justify-center items-center py-8"
        role="status"
        aria-label="Loading accounts"
      >
        <div
          aria-hidden="true"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {accounts.map((account) => (
        <div
          key={account.account_id}
          className={`p-4 border rounded-lg transition duration-150${
            interactive ? ' hover:bg-gray-50 cursor-pointer' : ''
          }`}
          {...(interactive && {
            role: 'button',
            tabIndex: 0,
            'aria-label': account.name,
            onClick: () => onAccountSelect(account),
            onKeyDown: (event) => {
              if(event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onAccountSelect(account);
              }
            },
          })}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{account.name}</h3>
              <p className="text-sm text-gray-500">
                {getAccountTypeLabel(account.type)}
                {account.official_name && ` • ${account.official_name}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {formatCurrency(
                  account.balances?.current,
                  account.balances?.iso_currency_code ??
                    account.balances?.unofficial_currency_code ??
                    undefined,
                )}
              </p>
              <p className="text-sm text-gray-500">
                {formatAccountMask(account.mask)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {accounts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No accounts found
        </div>
      )}
    </div>
  );
};
