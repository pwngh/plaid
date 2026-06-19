import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatCurrency,
  formatAccountMask,
  getAccountTypeLabel,
  ACCOUNT_TYPE,
} from '../src/shared/utils.js';

describe('formatCurrency', () => {
  it('formats amounts as US dollars with grouping and cents', () => {
    assert.strictEqual(formatCurrency(1234.5), '$1,234.50');
    assert.strictEqual(formatCurrency(0.1), '$0.10');
  });

  it('formats negative amounts', () => {
    assert.strictEqual(formatCurrency(-5), '-$5.00');
  });

  it('treats missing amounts as zero', () => {
    assert.strictEqual(formatCurrency(0), '$0.00');
    assert.strictEqual(formatCurrency(null), '$0.00');
    assert.strictEqual(formatCurrency(undefined), '$0.00');
  });

  it('formats other currencies when given an ISO code', () => {
    assert.strictEqual(formatCurrency(1234.5, 'EUR'), '€1,234.50');
    assert.strictEqual(formatCurrency(1000, 'GBP'), '£1,000.00');
  });

  it('honors the locale argument', () => {
    assert.notStrictEqual(
      formatCurrency(1234.5, 'EUR', 'de-DE'),
      formatCurrency(1234.5, 'EUR', 'en-US')
    );
  });
});

describe('formatAccountMask', () => {
  it('prefixes the mask with asterisks', () => {
    assert.strictEqual(formatAccountMask('1234'), '****1234');
  });

  it('returns a fallback message when the mask is missing', () => {
    assert.strictEqual(formatAccountMask(null), 'No account number available');
    assert.strictEqual(formatAccountMask(''), 'No account number available');
    assert.strictEqual(formatAccountMask(undefined), 'No account number available');
  });
});

describe('getAccountTypeLabel', () => {
  it('maps every known account type to its label', () => {
    assert.strictEqual(getAccountTypeLabel(ACCOUNT_TYPE.DEPOSITORY), 'Bank Account');
    assert.strictEqual(getAccountTypeLabel(ACCOUNT_TYPE.CREDIT), 'Credit Card');
    assert.strictEqual(getAccountTypeLabel(ACCOUNT_TYPE.LOAN), 'Loan');
    assert.strictEqual(getAccountTypeLabel(ACCOUNT_TYPE.INVESTMENT), 'Investment');
    assert.strictEqual(getAccountTypeLabel(ACCOUNT_TYPE.OTHER), 'Other');
  });

  it('returns the raw type when unmapped', () => {
    assert.strictEqual(getAccountTypeLabel('crypto'), 'crypto');
  });
});
