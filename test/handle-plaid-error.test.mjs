import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  handlePlaidError,
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../src/shared/utils.js';

describe('handlePlaidError', () => {
  describe('mapped Plaid error codes', () => {
    for (const code of Object.values(ERROR_CODES)) {
      it(`maps ${code} from a Plaid API response body`, () => {
        const error = { response: { data: { error_code: code } } };
        assert.deepStrictEqual(handlePlaidError(error), {
          message: ERROR_MESSAGES[code],
          code,
        });
      });
    }

    it('reads error_code directly off the error object', () => {
      const error = { error_code: ERROR_CODES.MFA_ERROR };
      assert.deepStrictEqual(handlePlaidError(error), {
        message: ERROR_MESSAGES[ERROR_CODES.MFA_ERROR],
        code: ERROR_CODES.MFA_ERROR,
      });
    });

    it('reads code off the error object', () => {
      const error = { code: ERROR_CODES.INSTITUTION_DOWN };
      assert.deepStrictEqual(handlePlaidError(error), {
        message: ERROR_MESSAGES[ERROR_CODES.INSTITUTION_DOWN],
        code: ERROR_CODES.INSTITUTION_DOWN,
      });
    });

    it('prefers the response body code over the error object code', () => {
      const error = {
        response: { data: { error_code: ERROR_CODES.INVALID_ACCESS_TOKEN } },
        error_code: ERROR_CODES.MFA_ERROR,
        code: ERROR_CODES.INSTITUTION_DOWN,
      };
      assert.strictEqual(
        handlePlaidError(error).code,
        ERROR_CODES.INVALID_ACCESS_TOKEN
      );
    });
  });

  describe('message sniffing', () => {
    it('detects rate limiting from the error message', () => {
      const error = new Error('Rate limit exceeded for client');
      assert.deepStrictEqual(handlePlaidError(error), {
        message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      });
    });

    it('detects institution problems from the error message', () => {
      const error = new Error('The institution is busy');
      assert.deepStrictEqual(handlePlaidError(error), {
        message: ERROR_MESSAGES[ERROR_CODES.INSTITUTION_NOT_RESPONDING],
        code: ERROR_CODES.INSTITUTION_NOT_RESPONDING,
      });
    });

    it('routes a "down" institution message to INSTITUTION_DOWN', () => {
      const error = new Error('Institution is temporarily down');
      assert.deepStrictEqual(handlePlaidError(error), {
        message: ERROR_MESSAGES[ERROR_CODES.INSTITUTION_DOWN],
        code: ERROR_CODES.INSTITUTION_DOWN,
      });
    });

    it('routes a "no longer supported" message to INSTITUTION_NO_LONGER_SUPPORTED', () => {
      const error = new Error('This institution is no longer supported');
      assert.deepStrictEqual(handlePlaidError(error), {
        message: ERROR_MESSAGES[ERROR_CODES.INSTITUTION_NO_LONGER_SUPPORTED],
        code: ERROR_CODES.INSTITUTION_NO_LONGER_SUPPORTED,
      });
    });
  });

  describe('fallback', () => {
    const fallback = {
      message: ERROR_MESSAGES.PLAID_ERROR,
      code: 'PLAID_ERROR',
    };

    it('falls back for an unmapped Plaid error code', () => {
      const error = { response: { data: { error_code: 'ITEM_LOGIN_REQUIRED' } } };
      assert.deepStrictEqual(handlePlaidError(error), fallback);
    });

    it('falls back for a generic non-Plaid error', () => {
      assert.deepStrictEqual(handlePlaidError(new TypeError('boom')), fallback);
    });

    it('falls back without throwing for null, undefined, and non-error values', () => {
      assert.deepStrictEqual(handlePlaidError(null), fallback);
      assert.deepStrictEqual(handlePlaidError(undefined), fallback);
      assert.deepStrictEqual(handlePlaidError('not an error'), fallback);
    });
  });
});
