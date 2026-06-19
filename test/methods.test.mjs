import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getInstitution } from '../src/node/methods.js';

describe('getInstitution', () => {
  it('short-circuits to null without calling Plaid when no id is given', async () => {
    let called = false;
    const client = {
      institutionsGetById: async () => {
        called = true;
        return { data: {} };
      },
    };
    assert.strictEqual(await getInstitution(client, null), null);
    assert.strictEqual(await getInstitution(client, undefined), null);
    assert.strictEqual(called, false);
  });

  it('defaults country_codes to ["US"] and returns response.data', async () => {
    let received;
    const client = {
      institutionsGetById: async (req) => {
        received = req;
        return { data: { institution: { name: 'Bank' } } };
      },
    };
    const result = await getInstitution(client, 'ins_1');
    assert.deepStrictEqual(received, {
      institution_id: 'ins_1',
      country_codes: ['US'],
    });
    assert.deepStrictEqual(result, { institution: { name: 'Bank' } });
  });

  it('forwards custom country codes', async () => {
    let received;
    const client = {
      institutionsGetById: async (req) => {
        received = req;
        return { data: {} };
      },
    };
    await getInstitution(client, 'ins_2', ['GB', 'CA']);
    assert.deepStrictEqual(received.country_codes, ['GB', 'CA']);
  });
});
