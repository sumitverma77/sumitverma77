/**
 * Repository Service
 * Responsibility: fetch all public repos for the user, sort by last activity,
 * and return structured data for recent repos list.
 */

import { getAll } from '../clients/githubClient.js';
import config from '../config/config.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const { github, cache: cacheConfig, recentReposCount } = config;

/**
 * Fetch all public repositories for the configured user.
 * Results are cached for the TTL duration.
 * @returns {Promise<Array>}
 */
export async function fetchAllRepos() {
    const cacheKey = `repos:${github.username}`;

    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: repos');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Fetching all repos');
    const url = `${github.apiBase}/users/${github.username}/repos?type=public&per_page=${github.perPage}`;
    const repos = await getAll(url);
    timer.end();

    logger.info(`Fetched ${repos.length} public repositories`);
    cache.set(cacheKey, repos, cacheConfig.ttlMs);
    return repos;
}

/**
 * Get the N most recently pushed repositories.
 * @returns {Promise<Array<{name, url, description, language, stars, pushedAt}>>}
 */
export async function getRecentRepos() {
    const repos = await fetchAllRepos();

    return repos
        .filter((r) => !r.fork) // exclude forks to show original work
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, recentReposCount)
        .map((r) => ({
            name: r.name,
            url: r.html_url,
            description: r.description || 'No description',
            language: r.language || 'N/A',
            stars: r.stargazers_count,
            pushedAt: r.pushed_at,
        }));
}

/**
 * Get total repo count (public, non-fork).
 * @returns {Promise<number>}
 */
export async function getTotalRepoCount() {
    const repos = await fetchAllRepos();
    return repos.filter((r) => !r.fork).length;
}
