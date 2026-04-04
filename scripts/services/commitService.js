/**
 * Commit Service — Production-Grade Implementation
 *
 * Strategy: GitHub's commits API supports per_page=1, which causes GitHub to
 * populate the Link header with the last page number. Since each page = 1 commit,
 * the last page number = total commit count. This avoids downloading every commit.
 *
 * Endpoint: GET /repos/{owner}/{repo}/commits?author={user}&per_page=1
 * Link header example: <...?page=1>; rel="first", <...?page=312>; rel="last"
 *                                                               ^^^--- total commits
 *
 * Performance: repos are processed in batches with Promise.all() for true parallelism.
 * Failure isolation: if one repo fails, others continue; failures contribute 0.
 */

import { getRaw } from '../clients/githubClient.js';
import { fetchAllRepos } from './repoService.js';
import config from '../config/config.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const { github, cache: cacheConfig } = config;

/**
 * Get total commit count for a single repository by reading the `Link` last-page number.
 * Uses per_page=1 so GitHub populates the pagination header with the commit total.
 *
 * @param {string} repoName
 * @returns {Promise<number>}
 */
async function getCommitCountForRepo(repoName) {
    const url = `${github.apiBase}/repos/${github.username}/${repoName}/commits?author=${github.username}&per_page=1`;

    try {
        const response = await getRaw(url);

        // If there are no commits at all, GitHub returns an empty array with no Link header
        const linkHeader = response.headers.get('link');
        if (!linkHeader) {
            // No pagination → either 0 or 1 commit; check body
            const data = await response.json();
            return Array.isArray(data) ? data.length : 0;
        }

        // Extract last page number = total commit count
        const lastPageMatch = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);
        if (lastPageMatch) {
            const count = parseInt(lastPageMatch[1], 10);
            logger.debug(`Repo "${repoName}" → ${count} commits (via Link header)`);
            return count;
        }

        // Fallback: parse body
        const data = await response.json();
        return Array.isArray(data) ? data.length : 0;
    } catch (err) {
        logger.warn(`[COMMIT_SERVICE] Could not fetch commits for "${repoName}": ${err.message}`);
        return 0; // failure isolation — one broken repo doesn't stop the total
    }
}

/**
 * Compute total commits across all non-fork repos owned by the user.
 *
 * Uses Promise.all() in batches of 8 for parallel API calls, balancing
 * throughput vs rate-limit impact.
 *
 * @returns {Promise<number>}
 */
export async function getTotalCommits() {
    const cacheKey = `commits:total:${github.username}`;

    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: total commits');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Computing total commits');
    const repos = await fetchAllRepos();
    const ownedRepos = repos.filter((r) => !r.fork);

    logger.info(`[COMMIT_SERVICE] Counting commits across ${ownedRepos.length} owned repos (parallel batches)...`);

    const BATCH_SIZE = 8; // parallel requests per batch
    let total = 0;

    for (let i = 0; i < ownedRepos.length; i += BATCH_SIZE) {
        const batch = ownedRepos.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(ownedRepos.length / BATCH_SIZE);

        logger.info(`[COMMIT_SERVICE] Batch ${batchNum}/${totalBatches} → repos: [${batch.map(r => r.name).join(', ')}]`);

        // True parallel execution within each batch
        const counts = await Promise.all(batch.map((r) => getCommitCountForRepo(r.name)));
        const batchTotal = counts.reduce((sum, c) => sum + c, 0);
        total += batchTotal;

        logger.info(`[COMMIT_SERVICE] Batch ${batchNum} subtotal=${batchTotal} | running total=${total}`);
    }

    timer.end();
    logger.info(`[COMMIT_SERVICE] Total commits calculated (count=${total})`);

    cache.set(cacheKey, total, cacheConfig.ttlMs);
    return total;
}

/**
 * Compute total contributions and streak data over the last year using GitHub GraphQL.
 * 
 * @returns {Promise<{totalContributions: number, currentStreak: number, longestStreak: number}>}
 */
export async function getGithubStats() {
    const { graphql } = await import('../clients/githubClient.js');
    
    const cacheKey = `github:stats:${github.username}`;
    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: github stats');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Computing GitHub Stats (GraphQL)');
    const query = `
        query($username: String!) {
            user(login: $username) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const data = await graphql(query, { username: github.username });
        const calendar = data?.user?.contributionsCollection?.contributionCalendar;
        
        if (!calendar) throw new Error('No calendar data');

        const totalContributions = calendar.totalContributions || 0;
        
        let currentStreak = 0;
        let longestStreak = 0;
        let currentRun = 0;
        
        // Flatten days
        const days = calendar.weeks.flatMap(w => w.contributionDays);
        
        // Find today (or the last day in the calendar)
        const todayStr = new Date().toISOString().split('T')[0];
        let hitToday = false;

        // Iterate forward to calculate longest streak
        for (const day of days) {
            if (day.contributionCount > 0) {
                currentRun++;
                longestStreak = Math.max(longestStreak, currentRun);
            } else {
                currentRun = 0;
            }
        }

        // Calculate current streak by looking backwards from today (the last element)
        let backRun = 0;
        for (let i = days.length - 1; i >= 0; i--) {
            if (days[i].contributionCount > 0) {
                backRun++;
            } else {
                // If today has 0, we check yesterday. If yesterday is 0, streak is 0.
                if (i === days.length - 1) {
                    continue; // Skip today being 0 and see if yesterday had a streak
                } else if (i === days.length - 2 && backRun === 0 && days[days.length-1].contributionCount === 0) {
                   break;
                } else {
                    break;
                }
            }
        }
        currentStreak = backRun;
        
        const result = { totalContributions, currentStreak, longestStreak };
        
        timer.end();
        logger.info(`[COMMIT_SERVICE] GitHub Stats calculated: Total=${totalContributions}, Streak=${currentStreak}, Longest=${longestStreak}`);
        
        cache.set(cacheKey, result, cacheConfig.ttlMs);
        return result;
    } catch (err) {
        logger.error(`[COMMIT_SERVICE] Failed to fetch GitHub stats: ${err.message}`);
        return { totalContributions: 0, currentStreak: 0, longestStreak: 0 };
    }
}
