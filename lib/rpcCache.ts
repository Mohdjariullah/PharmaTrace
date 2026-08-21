// The devnet public RPC endpoint's rate limit is low enough that even a
// single page view can trigger several near-duplicate calls (a balance
// check on mount, a cross-verify fetch on every /verify load, React
// StrictMode double-invoking effects in dev). None of that duplication is
// necessary - the underlying data hasn't changed in the seconds between
// calls - so a short in-memory cache directly cuts total request volume
// against whichever RPC endpoint is configured, public or dedicated.
//
// Deliberately just a Map, not a library: this only needs to survive a
// single page session, and clears itself on reload.
const cache = new Map<string, { value: any; expiresAt: number }>();
const inFlight = new Map<string, Promise<any>>();

/**
 * Runs `fn()` and caches its resolved value under `key` for `ttlMs`.
 * Concurrent calls for the same key while a fetch is already in flight
 * share that one request instead of firing duplicates.
 */
export async function withRpcCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fn()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

/** Drops a cached value early - used when an action makes it stale, e.g. a transfer changing the batch a cross-verify entry was cached for. */
export function invalidateRpcCache(key: string) {
  cache.delete(key);
}
