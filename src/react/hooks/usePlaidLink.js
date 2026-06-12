import { useCallback } from 'react';
import { usePlaidLink as useOfficialPlaidLink } from 'react-plaid-link';
import { handlePlaidError } from '../../shared/utils';

/**
 * Wrap `react-plaid-link`'s `usePlaidLink` with normalized error handling.
 *
 * Errors thrown by the consumer's `onSuccess`/`onExit` callbacks are rethrown
 * with the user-facing message from `handlePlaidError`. All other options pass
 * through to `react-plaid-link` unchanged. The token must be created
 * server-side (e.g. a Remix loader calling `createLinkToken`).
 *
 * @param {Object} options - Accepts every `react-plaid-link` option in addition to those below.
 * @param {string} options.token - Link token created server-side by `createLinkToken`.
 * @param {Function} [options.onSuccess] - Receives `(publicToken, metadata)`; typically posts the token to a Remix action that runs `exchangePublicToken`. May be async.
 * @param {Function} [options.onExit] - Receives `(error, metadata)` when the user closes Link. May be async.
 * @returns {{ open: Function, ready: boolean, exit: Function, submit: Function, error: ErrorEvent|null }} `open()` launches the Link flow once `ready` is `true`.
 */
export const usePlaidLink = ({
  token,
  onSuccess,
  onExit,
  ...config
}) => {
  const handleSuccess = useCallback(async (publicToken, metadata) => {
    try {
      if(onSuccess) {
        await onSuccess(publicToken, metadata);
      }
    } catch(error) {
      const { message } = handlePlaidError(error);
      throw new Error(message);
    }
  }, [onSuccess]);

  const handleExit = useCallback(async (error, metadata) => {
    try {
      if(onExit) {
        await onExit(error, metadata);
      }
    } catch(error) {
      const { message } = handlePlaidError(error);
      throw new Error(message);
    }
  }, [onExit]);

  return useOfficialPlaidLink({
    token,
    onSuccess: handleSuccess,
    onExit: handleExit,
    ...config,
  });
};
