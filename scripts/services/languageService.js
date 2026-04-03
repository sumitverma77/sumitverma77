/**
 * Language Service — Repo-Frequency Based (v2)
 *
 * WHY THIS APPROACH:
 *   Byte-based aggregation is misleading. A single Jupyter Notebook with
 *   large datasets would dominate purely because of file size, not because
 *   the developer writes Jupyter code. Byte counts measure data volume,
 *   not where a developer actually spends their time.
 *
 *   Repo-frequency (counting repos per language) is a fairer signal:
 *   "How many projects did I choose to build in this language?"
 *
 * STRATEGY:
 *   - Use repo.language (GitHub's auto-detected primary language per repo)
 *   - Exclude repos where language is null (empty/config-only repos)
 *   - Exclude the profile repo itself (username/username)
 *   - Count frequency of each language across all owned, non-fork repos
 *   - Sort descending and return top N with count + percentage
 */

import { fetchAllRepos } from './repoService.js';
import config from '../config/config.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const { github, cache: cacheConfig, topLanguagesCount } = config;

/**
 * Get top languages ranked by number of repositories.
 *
 * @returns {Promise<Array<{language, repoCount, percentage}>>}
 */
export async function getTopLanguages() {
    const cacheKey = `languages:v2:${github.username}`;

    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: languages');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Computing language stats (repo-frequency)');
    const repos = await fetchAllRepos();

    const eligible = repos.filter(
        (r) =>
            !r.fork &&                          // exclude forks
            r.language !== null &&              // exclude repos with no detected language
            r.name !== github.username          // exclude the profile repo itself
    );

    logger.info(`[LANGUAGE_SERVICE] Eligible repos for language count: ${eligible.length}`);

    // Count how many repos use each language
    const frequencyMap = {};
    for (const repo of eligible) {
        frequencyMap[repo.language] = (frequencyMap[repo.language] || 0) + 1;
    }

    const totalRepos = eligible.length;

    const sorted = Object.entries(frequencyMap)
        .sort(([, a], [, b]) => b - a)         // sort by repo count descending
        .slice(0, topLanguagesCount)
        .map(([language, repoCount]) => ({
            language,
            repoCount,
            percentage: totalRepos > 0 ? ((repoCount / totalRepos) * 100).toFixed(1) : '0.0',
        }));

    timer.end();
    logger.summary('Language Stats', {
        primaryLanguage: sorted[0]?.language ?? 'N/A',
        topLanguages: sorted.map((l) => `${l.language}(${l.repoCount})`).join(', '),
        totalEligibleRepos: totalRepos,
    });

    cache.set(cacheKey, sorted, cacheConfig.ttlMs);
    return sorted;
}
