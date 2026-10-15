const test = require('node:test');
const assert = require('node:assert');
const { validateTask, isValidDate } = require('../src/validate');

test('accepts a valid task', () => {
  const { errors, data } = validateTask({ title: '  Learn Express ', priority: 'high' });
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(data.title, 'Learn Express');
});

test('rejects missing title on create', () => {
  assert.ok(validateTask({}).errors.length > 0);
});

test('allows missing title on partial update', () => {
  assert.deepStrictEqual(validateTask({ status: 'done' }, true).errors, []);
});

test('rejects invalid enum values', () => {
  const { errors } = validateTask({ title: 'x', status: 'finished', priority: 'urgent' });
  assert.strictEqual(errors.length, 2);
});

test('validates dates strictly', () => {
  assert.ok(isValidDate('2026-11-01'));
  assert.ok(!isValidDate('2026-02-30'));
  assert.ok(!isValidDate('01-11-2026'));
});
