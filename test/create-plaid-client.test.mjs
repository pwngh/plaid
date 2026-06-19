import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createPlaidClient } from '../src/node/client.js';

const headers = (client) => client.configuration.baseOptions.headers;

describe('createPlaidClient', () => {
  it('sets the auth headers and resolves the env basePath', () => {
    const client = createPlaidClient({ clientId: 'cid', secret: 'sek', env: 'production' });
    assert.strictEqual(client.basePath, 'https://production.plaid.com');
    assert.strictEqual(headers(client)['PLAID-CLIENT-ID'], 'cid');
    assert.strictEqual(headers(client)['PLAID-SECRET'], 'sek');
  });

  it('defaults to the sandbox environment', () => {
    const client = createPlaidClient({ clientId: 'x', secret: 'y' });
    assert.strictEqual(client.basePath, 'https://sandbox.plaid.com');
  });

  it('merges custom headers without dropping the auth headers', () => {
    const client = createPlaidClient({
      clientId: 'cid',
      secret: 'sek',
      options: { headers: { 'X-Custom': '1' } },
    });
    assert.strictEqual(headers(client)['PLAID-CLIENT-ID'], 'cid');
    assert.strictEqual(headers(client)['PLAID-SECRET'], 'sek');
    assert.strictEqual(headers(client)['X-Custom'], '1');
  });

  it('lets a caller intentionally override one auth header, keeping the rest', () => {
    const client = createPlaidClient({
      clientId: 'a',
      secret: 'b',
      options: { headers: { 'PLAID-SECRET': 'override' } },
    });
    assert.strictEqual(headers(client)['PLAID-CLIENT-ID'], 'a');
    assert.strictEqual(headers(client)['PLAID-SECRET'], 'override');
  });

  it('throws a clear error for an unknown env', () => {
    assert.throws(
      () => createPlaidClient({ clientId: 'x', secret: 'y', env: 'staging' }),
      /Unknown Plaid env "staging"/
    );
  });
});
