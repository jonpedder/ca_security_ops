export function createMutationCoordinator() {
  const pending = new Map();

  return function coordinate(key, operation) {
    const previous = pending.get(key) ?? Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(operation)
      .finally(() => {
        if (pending.get(key) === current) pending.delete(key);
      });
    pending.set(key, current);
    return current;
  };
}
