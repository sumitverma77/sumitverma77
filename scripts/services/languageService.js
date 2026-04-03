/**
 * Language Service
 * Responsibility: aggregate bytes-by-language across all owned repos,
 * compute usage percentages, and return the top N languages.
 */

import { get } from '../clients/githubClient.js';
import { fetchAllRepos } from './repoService.js';
import config from '../config/config.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const { github, cache: cacheConfig, topLanguagesCount } = config;

/**
 * Fetch language bytes for a single repository.
 * @param {string} repoName
 * @returns {Promise<Object>} e.g. { "Java": 40123, "YAML": 5000 }
 */
async function getLanguagesForRepo(repoName) {
    try {
        const url = `${github.apiBase}/repos/${github.username}/${repoName}/languages`;
        return await get(url);
    } catch (err) {
        logger.warn(`Could not fetch languages for ${repoName}: ${err.message}`);
        return {};
    }
}

/**
 * Aggregate languages across all owned repos.
 * Returns top N languages sorted by byte count descending.
 * @returns {Promise<Array<{language, bytes, percentage}>>}
 */
export async function getTopLanguages() {
    const cacheKey = `languages:${github.username}`;

    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: languages');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Aggregating language stats');
    const repos = await fetchAllRepos();
    const ownedRepos = repos.filter((r) => !r.fork);

    logger.info(`Fetching language data for ${ownedRepos.length} repos...`);

    // Batch fetching with concurrency control (10 at a time)
    const BATCH_SIZE = 10;
    const langTotals = {};

    for (let i = 0; i < ownedRepos.length; i += BATCH_SIZE) {
        const batch = ownedRepos.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map((r) => getLanguagesForRepo(r.name)));
        results.forEach((langMap) => {
            for (const [lang, bytes] of Object.entries(langMap)) {
                langTotals[lang] = (langTotals[lang] || 0) + bytes;
            }
        });
    }

    const totalBytes = Object.values(langTotals).reduce((sum, b) => sum + b, 0);

    const sorted = Object.entries(langTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topLanguagesCount)
        .map(([language, bytes]) => ({
            language,
            bytes,
            percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0.0',
        }));

    timer.end();
    logger.info(`Top languages: ${sorted.map((l) => l.language).join(', ')}`);
    cache.set(cacheKey, sorted, cacheConfig.ttlMs);
    return sorted;
}
