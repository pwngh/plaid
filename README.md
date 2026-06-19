## @pwngh/plaid

> Plaid integration for Remix applications.

### Overview

This package provides a structured way to interact with Plaid in both Node.js and React environments. 

- Server-side Plaid client setup and API methods
- React components for Plaid Link integration
- Custom hooks for managing Plaid state
- Standardized error handling
- Remix-specific integrations

Install from GitHub:

> npm install git+https://github.com/pwngh/plaid.git


### Server-Side Features (<small>`@pwngh/plaid/node`</small>)
- Simple client initialization
- Link token creation
- Token exchange handling
- Account and transaction fetching
- Balance, identity, institution, and auth retrieval
- Standardized error handling

### Server-Side Usage

```js
import { createPlaidClient, getAccounts } from '@pwngh/plaid/node';

// Initialize once
const client = createPlaidClient({
 clientId: process.env.PLAID_CLIENT_ID,
 secret: process.env.PLAID_SECRET
});

// Use in your loader/action
export async function loader() {
 const { accounts } = await getAccounts(client, accessToken);
 return Response.json({ accounts });
}
```

### Client-Side Features (<small>`@pwngh/plaid/react`</small>)
- Ready-to-use Plaid Link component
- Account list component with default styling
- Custom hooks for Plaid Link and account management
- Remix form integration
- Loading and error states

The components and hooks never touch the Plaid access token — it stays on the server (see [Required route](#required-route) below).

> Components are styled with Tailwind CSS utility classes, so the consuming app must have Tailwind configured.

### Client-Side Usage

```jsx
import { PlaidLink, PlaidAccountsList } from '@pwngh/plaid/react';

export default function BankConnect() {
 return (
   <div>
     <PlaidLink linkToken={linkToken} />
     <PlaidAccountsList onAccountSelect={(account) => console.log(account)} />
   </div>
 );
}
```

`PlaidAccountsList` (and the underlying `usePlaidAccounts` hook) fetches accounts on mount and exposes a `refresh()` for re-fetching. The action route defaults to `/api/plaid/accounts` and is configurable:

```jsx
<PlaidAccountsList action="/resources/plaid/accounts" />

// or with the hook directly
const { accounts, isLoading, error, refresh } = usePlaidAccounts({
  action: '/resources/plaid/accounts',
});
```

### Required route

`usePlaidAccounts` POSTs to a Remix action (default `/api/plaid/accounts`) that you must define in your app. The action looks up the Plaid access token server-side — from the session or your database — and calls `getAccounts` there. Plaid access tokens must never be sent to or stored in the browser.

```jsx
// app/routes/api.plaid.accounts.jsx
import { createPlaidClient, getAccounts } from '@pwngh/plaid/node';
import { getSession } from '~/sessions.server';
import { getPlaidAccessTokenForUser } from '~/models/plaid.server';

const client = createPlaidClient({
  clientId: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
});

export async function action({ request }) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return Response.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  // Retrieve the Plaid access token server-side (session, database, etc.)
  const accessToken = await getPlaidAccessTokenForUser(userId);

  try {
    const { accounts } = await getAccounts(client, accessToken);
    return Response.json({ accounts });
  } catch (error) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: 500 },
    );
  }
}
```

### Error Handling

The package includes standardized error handling with specific error codes and user-friendly messages. 

All server methods return consistent error structures that can be easily handled on the client.

### Requirements

- Node.js >= 20.0.0
- Remix >= 2.13.1
- React >= 18.2.0
- Plaid >= 20.0.0
- react-plaid-link >= 3.5.1 (peer dependency of the React entry)
- Tailwind CSS (for the bundled components' styling)

### License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Preston Neal.