/**
 * GitHub API HTTP Client
 * Responsibilities:
 *   - Inject auth headers on every request
 *   - Detect and wait on rate-limit responses (HTTP 403/429)
 *   - Exponential backoff retry on transient 5xx failures
 *   - getRaw(): returns full Response object (for Link-header pagination in callers)
 *   - getAll(): auto-paginates collecting all pages
 */

import fetch from 'node-fetch';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const { github } = config;

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildHeaders() {
    return {
        Authorization: `Bearer ${github.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': `${github.username}-readme-bot/1.0`,
    };
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse the `Link` header and extract the `next` page URL.
 * Returns null if there is no next page.
 */
function extractNextPageUrl(linkHeader) {
    if (!linkHeader) return null;
    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    return match ? match[1] : null;
}

// ── Core fetch with retry + rate-limit handling ──────────────────────────────

/**
 * Internal: fetch with exponential backoff retry and rate-limit handling.
 * Returns the raw Response object so callers can read headers + body themselves.
 */
async function fetchWithRetry(url, attempt = 1) {
    logger.debug(`GET ${url} (attempt ${attempt}/${github.maxRetries})`);

    const response = await fetch(url, { headers: buildHeaders() });

    // ── Rate limit handling ──────────────────────────────────────────────────
    if (response.status === 403 || response.status === 429) {
        const resetEpoch = response.headers.get('x-ratelimit-reset');
        const retryAfter = response.headers.get('retry-after');
        const remaining = response.headers.get('x-ratelimit-remaining');

        if (remaining === '0' && resetEpoch) {
            // Add 2-second buffer to avoid edge-case failures right at the reset boundary
            const waitMs = Math.max(0, parseInt(resetEpoch, 10) * 1000 - Date.now()) + 2000;
            logger.warn(
                `[RATE_LIMIT] x-ratelimit-remaining=0. Sleeping ${Math.ceil(waitMs / 1000)}s (reset + 2s buffer)...`
            );
            await sleep(waitMs);
            return fetchWithRetry(url, attempt); // retry after reset — not counted as a backoff attempt
        }

        if (retryAfter) {
            // Add 2-second buffer here too
            const waitMs = parseInt(retryAfter, 10) * 1000 + 2000;
            logger.warn(`[RATE_LIMIT] 429 received. Retry-After=${retryAfter}s + 2s buffer.`);
            await sleep(waitMs);
            return fetchWithRetry(url, attempt);
        }
    }

    // ── Transient 5xx errors — exponential backoff ────────────────────────────
    if (response.status >= 500 && attempt <= github.maxRetries) {
        const delayMs = github.retryDelayMs * Math.pow(2, attempt - 1);
        logger.warn(`[RETRY] HTTP ${response.status} from GitHub. Attempt ${attempt}/${github.maxRetries}. Retrying in ${delayMs}ms...`);
        await sleep(delayMs);
        return fetchWithRetry(url, attempt + 1);
    }

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`GitHub API error [${response.status}] for ${url}: ${body}`);
    }

    return response;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch a single page and return parsed JSON.
 * @param {string} url - Full GitHub API URL
 * @returns {Promise<any>}
 */
export async function get(url) {
    const response = await fetchWithRetry(url);
    return response.json();
}

/**
 * Fetch a single page and return the raw Response object.
 * Use this when you need to inspect response headers (e.g. Link header for pagination).
 * @param {string} url
 * @returns {Promise<Response>}
 */
export async function getRaw(url) {
    return fetchWithRetry(url);
}

/**
 * Fetch ALL pages for a paginated endpoint.
 * Automatically follows Link: next headers.
 * @param {string} url - Initial URL (should include per_page param)
 * @returns {Promise<Array>} - Flat array of all results across pages
 */
export async function getAll(url) {
    const results = [];
    let next = url;

    while (next) {
        const response = await fetchWithRetry(next);
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(`Expected array from paginated endpoint, got: ${typeof data}`);
        }

        results.push(...data);

        const linkHeader = response.headers.get('link');
        next = extractNextPageUrl(linkHeader);

        if (next) {
            logger.debug(`Paginating → ${next} (total so far: ${results.length})`);
        }
    }

    return results;
}

/**
 * Execute a GraphQL query against GitHub's API.
 * @param {string} query
 * @param {Object} variables
 * @returns {Promise<any>}
 */
export async function graphql(query, variables = {}) {
    const url = 'https://api.github.com/graphql';
    logger.debug(`[GITHUB] POST ${url}`);
    
    // We must use node-fetch directly here to do a POST, 
    // or add a method param to fetchWithRetry. For simplicity:
    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`GitHub GraphQL API error [${response.status}]: ${body}`);
    }

    const { data, errors } = await response.json();
    if (errors && errors.length > 0) {
        throw new Error(`GitHub GraphQL error: ${errors[0].message}`);
    }

    return data;
}

export default { get, getRaw, getAll, graphql };
