import assert from 'node:assert/strict';
import test from 'node:test';
import { numericSearchId, prefixSearchPattern } from '../src/utils/searchPattern';

test('search patterns are prefix-index friendly and escape LIKE wildcards', () => {
  assert.equal(prefixSearchPattern(' Rahul '), 'Rahul%');
  assert.equal(prefixSearchPattern('APP-123'), '123%');
  assert.equal(prefixSearchPattern('50%_off'), '50[%][_]off%');
});

test('prefixed identifiers become indexed numeric equality values', () => {
  assert.equal(numericSearchId('APP-123'), 123);
  assert.equal(numericSearchId('TKT-7'), 7);
  assert.equal(numericSearchId('Rahul'), undefined);
});
