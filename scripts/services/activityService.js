/**
 * Activity Service
 * Responsibility: fetch the user's most recent public push event
 * to report the latest commit message and repository.
 */

import { get } from '../clients/githubClient.js';
import config from '../config/config.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const { github, cache: cacheConfig } = config;

/**
 * Get the latest push activity for the user.
 * @returns {Promise<{repo, branch, message, url, timestamp} | null>}
 */
export async function getLatestActivity() {
    const cacheKey = `activity:${github.username}`;

    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: latest activity');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Fetching latest activity');
    const url = `${github.apiBase}/users/${github.username}/events/public?per_page=30`;

    let events;
    try {
        events = await get(url);
    } catch (err) {
        logger.warn(`Could not fetch events: ${err.message}`);
        return null;
    }

    timer.end();

    if (!Array.isArray(events) || events.length === 0) {
        logger.warn('No public events found');
        return null;
    }

    // Find the most recent PushEvent
    const pushEvent = events.find((e) => e.type === 'PushEvent');

    if (!pushEvent) {
        logger.warn('No PushEvent found in recent events');
        return null;
    }

    const commits = pushEvent.payload?.commits ?? [];
    const lastCommit = commits[commits.length - 1];
    const repoName = pushEvent.repo?.name ?? 'unknown';
    const branch = (pushEvent.payload?.ref ?? 'refs/heads/main').replace('refs/heads/', '');

    const activity = {
        repo: repoName,
        repoUrl: `https://github.com/${repoName}`,
        branch,
        message: lastCommit?.message ?? 'No commit message',
        timestamp: pushEvent.created_at,
    };

    logger.info(`Latest activity: [${repoName}] ${activity.message}`);
    cache.set(cacheKey, activity, cacheConfig.ttlMs);
    return activity;
}
