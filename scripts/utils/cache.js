/**
 * In-Memory TTL Cache
 * Interface is designed to be swap-compatible with a Redis client.
 * Single Responsibility: caching within a single process lifetime.
 *
 * To migrate to Redis, replace this module with a Redis wrapper
 * that exposes the same get/set/has interface — callers remain unchanged (OCP).
 */

class InMemoryCache {
    #store = new Map();

    /**
     * Store a value with a time-to-live.
     * @param {string} key
     * @param {*} value
     * @param {number} ttlMs - milliseconds until expiry
     */
    set(key, value, ttlMs) {
        const expiresAt = Date.now() + ttlMs;
        this.#store.set(key, { value, expiresAt });
    }

    /**
     * Retrieve a cached value, or undefined if missing/expired.
     * @param {string} key
     * @returns {*}
     */
    get(key) {
        const entry = this.#store.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this.#store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    /**
     * Check if a key is present and not expired.
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== undefined;
    }

    /**
     * Remove a cached entry explicitly.
     * @param {string} key
     */
    delete(key) {
        this.#store.delete(key);
    }

    /**
     * Remove all expired entries (manual GC).
     */
    prune() {
        const now = Date.now();
        for (const [key, entry] of this.#store) {
            if (now > entry.expiresAt) this.#store.delete(key);
        }
    }

    get size() {
        return this.#store.size;
    }
}

// Singleton — one cache per process run
const cache = new InMemoryCache();
export default cache;
