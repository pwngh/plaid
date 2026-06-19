import { useCallback, useEffect, useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { handlePlaidError } from '../../shared/utils';

/**
 * Fetch the user's linked bank accounts from a Remix action route.
 *
 * Accounts are fetched on mount and can be re-fetched with `refresh()`. The
 * consumer must provide a Remix action that looks up the Plaid access token
 * server-side (session, database, etc.), calls `getAccounts`, and responds
 * with `{ accounts }` — or `{ error }` on failure. The access token is never
 * sent from, or exposed to, the browser.
 *
 * @param {Object} [options]
 * @param {string} [options.action='/api/plaid/accounts'] - Remix action route the hook POSTs to.
 * @returns {{ accounts: Object[], isLoading: boolean, error: string|null, refresh: () => void }} `error` is the user-facing message from `handlePlaidError`.
 */
export const usePlaidAccounts = ({ action = '/api/plaid/accounts' } = {}) => {
  const fetcher = useFetcher();
  const [error, setError] = useState(null);
  const { submit } = fetcher;

  const refresh = useCallback(() => {
    setError(null);
    submit(null, { method: 'POST', action });
  }, [submit, action]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if(fetcher.data?.error) {
      const { message } = handlePlaidError(fetcher.data.error);
      setError(message);
    } else {
      setError(null);
    }
  }, [fetcher.data]);

  return {
    accounts: fetcher.data?.accounts ?? [],
    // Treat the pre-first-response idle phase as loading so the empty state
    // doesn't flash before the on-mount fetch starts.
    isLoading: fetcher.state !== 'idle' || fetcher.data === undefined,
    error,
    refresh,
  };
};
