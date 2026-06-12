import { usePlaidLink } from '../hooks/usePlaidLink';

/**
 * Button that opens the Plaid Link flow when clicked.
 *
 * Disabled until the Link script is ready. Any extra props spread onto the
 * underlying `<button>`.
 *
 * @param {Object} props
 * @param {string} props.linkToken - Link token created server-side by `createLinkToken`.
 * @param {Function} [props.onSuccess] - Receives `(publicToken, metadata)`; typically posts the token to a Remix action that runs `exchangePublicToken`.
 * @param {Function} [props.onExit] - Receives `(error, metadata)` when the user closes Link.
 * @param {Function} [props.onLoad] - Called when the Link UI finishes loading.
 * @param {Function} [props.onEvent] - Receives `(eventName, metadata)` for Link analytics events.
 * @param {string} [props.className] - Classes appended to the default button styling.
 * @param {import('react').ReactNode} [props.children] - Button label; defaults to "Connect Bank Account".
 */
export const PlaidLink = ({
  linkToken,
  onLoad,
  onEvent,
  onSuccess,
  onExit,
  children,
  className = '',
  ...props
}) => {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onLoad,
    onEvent,
    onSuccess,
    onExit,
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children || 'Connect Bank Account'}
    </button>
  );
};
