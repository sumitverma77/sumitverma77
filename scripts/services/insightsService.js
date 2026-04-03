/**
 * Insights Engine Service
 * Responsibility: compute analytics beyond raw totals — most active repo,
 * commit frequency, weekly activity pattern — turning this into an
 * "analytics system", not just automation.
 */

import { get } from '../clients/githubClient.js';
import { fetchAllRepos } from './repoService.js';
import config from '../config/config.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const { github, cache: cacheConfig } = config;

const FALLBACK = null; // callers treat null as "data unavailable"

/**
 * Find the most active repository by star count + recency scoring.
 * @param {Array} repos - raw repo array from repoService
 * @returns {{ name, url, stars, language, pushedAt }}
 */
function computeMostActiveRepo(repos) {
    if (!repos || repos.length === 0) return FALLBACK;

    const now = Date.now();
    const scored = repos
        .filter((r) => !r.fork)
        .map((r) => {
            const daysSincePush = (now - new Date(r.pushed_at).getTime()) / 86400000;
            // Score: stars weighted + recency bonus (fresher = higher score)
            const score = r.stargazers_count * 2 + Math.max(0, 30 - daysSincePush);
            return { ...r, score };
        })
        .sort((a, b) => b.score - a.score);

    const top = scored[0];
    return {
        name: top.name,
        url: top.html_url,
        stars: top.stargazers_count,
        language: top.language || 'N/A',
        pushedAt: top.pushed_at,
    };
}

/**
 * Compute commit frequency (commits per week) over the last 4 weeks
 * using the repo with the most recent activity.
 * @param {string} repoName - most active repo name
 * @returns {Promise<{commitsLast4Weeks: number, perWeek: string}>}
 */
async function computeCommitFrequency(repoName) {
    try {
        const since = new Date(Date.now() - 28 * 86400000).toISOString(); // 4 weeks back
        const url = `${github.apiBase}/repos/${github.username}/${repoName}/commits?author=${github.username}&since=${since}&per_page=100`;
        const data = await get(url);
        const count = Array.isArray(data) ? data.length : 0;
        return {
            commitsLast4Weeks: count,
            perWeek: (count / 4).toFixed(1),
        };
    } catch (err) {
        logger.warn(`[INSIGHTS] Could not compute commit frequency: ${err.message}`);
        return { commitsLast4Weeks: 0, perWeek: '0.0' };
    }
}

/**
 * Analyze weekly activity — which day of week has the most commits.
 * Uses the public events API for the last 30 events.
 * @returns {Promise<{busiestDay: string, dayDistribution: Object}>}
 */
async function computeWeeklyActivity() {
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const distribution = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };

    try {
        const url = `${github.apiBase}/users/${github.username}/events/public?per_page=100`;
        const events = await get(url);

        if (!Array.isArray(events)) return { busiestDay: 'N/A', dayDistribution: distribution };

        events
            .filter((e) => e.type === 'PushEvent')
            .forEach((e) => {
                const day = DAYS[new Date(e.created_at).getDay()];
                distribution[day] = (distribution[day] || 0) + 1;
            });

        const busiestDay = Object.entries(distribution)
            .sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'N/A';

        return { busiestDay, dayDistribution: distribution };
    } catch (err) {
        logger.warn(`[INSIGHTS] Could not compute weekly activity: ${err.message}`);
        return { busiestDay: 'N/A', dayDistribution: distribution };
    }
}

/**
 * Run full insights analysis.
 * @returns {Promise<{mostActiveRepo, commitFrequency, weeklyActivity} | null>}
 */
export async function getInsights() {
    const cacheKey = `insights:${github.username}`;

    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: insights');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Computing Insights Engine');

    try {
        const repos = await fetchAllRepos();
        const mostActiveRepo = computeMostActiveRepo(repos);

        const [commitFrequency, weeklyActivity] = await Promise.all([
            mostActiveRepo ? computeCommitFrequency(mostActiveRepo.name) : Promise.resolve(null),
            computeWeeklyActivity(),
        ]);

        const insights = { mostActiveRepo, commitFrequency, weeklyActivity };

        timer.end();
        logger.summary('Insights Engine', {
            mostActiveRepo: mostActiveRepo?.name,
            commitsLast4Weeks: commitFrequency?.commitsLast4Weeks,
            busiestDay: weeklyActivity?.busiestDay,
        });

        cache.set(cacheKey, insights, cacheConfig.ttlMs);
        return insights;
    } catch (err) {
        logger.error(`[INSIGHTS] Insights engine failed: ${err.message}`);
        return FALLBACK;
    }
}
