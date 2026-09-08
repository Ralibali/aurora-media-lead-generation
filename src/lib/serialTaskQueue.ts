// Preserve the user's order for writes to one record; unrelated records can save independently.
export function createSerialTaskQueue() {
  const pending = new Map<string, Promise<unknown>>();
  return function enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = pending.get(key) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(task);
    pending.set(key, next);
    const cleanup = () => { if (pending.get(key) === next) pending.delete(key); };
    void next.then(cleanup, cleanup);
    return next;
  };
}
