import test from 'node:test';
import assert from 'node:assert/strict';
import { createMutationCoordinator } from '../workflow/concurrent-updates.mjs';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('concurrent updates for one incident execute in submission order', async () => {
  const coordinate = createMutationCoordinator();
  const events = [];

  const first = coordinate('incident-1', async () => {
    events.push('first:start');
    await wait(20);
    events.push('first:end');
  });
  const second = coordinate('incident-1', async () => {
    events.push('second:start');
    events.push('second:end');
  });

  await Promise.all([first, second]);
  assert.deepEqual(events, ['first:start', 'first:end', 'second:start', 'second:end']);
});

test('updates for different incidents can run concurrently', async () => {
  const coordinate = createMutationCoordinator();
  let active = 0;
  let maximumActive = 0;

  const operation = async () => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await wait(20);
    active -= 1;
  };

  await Promise.all([
    coordinate('incident-1', operation),
    coordinate('incident-2', operation)
  ]);
  assert.equal(maximumActive, 2);
});

test('a failed incident update does not block the next queued update', async () => {
  const coordinate = createMutationCoordinator();
  const events = [];

  const failed = coordinate('incident-1', async () => {
    events.push('failed');
    throw new Error('simulated conflict');
  });
  const recovered = coordinate('incident-1', async () => {
    events.push('recovered');
  });

  await assert.rejects(failed, /simulated conflict/);
  await recovered;
  assert.deepEqual(events, ['failed', 'recovered']);
});
