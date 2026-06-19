import { useCallback } from 'react';
import { usePlaidLink as useOfficialPlaidLink } from 'react-plaid-link';
import { handlePlaidError } from '../../shared/utils';

/** Invoke a consumer callback (if any), rethrowing failures with a normalized, user-facing message. */
const callOrRethrow = async (cb, args) => {
  try {
    if(cb) await cb(...args);
  } catch(error) {
    throw new Error(handlePlaidError(error).message);
  }
};

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
  const handleSuccess = useCallback(
    (publicToken, metadata) => callOrRethrow(onSuccess, [publicToken, metadata]),
    [onSuccess],
  );

  const handleExit = useCallback(
    (error, metadata) => callOrRethrow(onExit, [error, metadata]),
    [onExit],
  );

  return useOfficialPlaidLink({
    token,
    onSuccess: handleSuccess,
    onExit: handleExit,
    ...config,
  });
};
