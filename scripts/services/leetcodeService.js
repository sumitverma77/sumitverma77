/**
 * LeetCode Service
 * Responsibility: Fetch and parse user stats from LeetCode.
 */

import { graphql } from '../clients/leetcodeClient.js';
import config from '../config/config.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const { leetcode, cache: cacheConfig } = config;

const LEETCODE_QUERY = `
    query getUserStats($username: String!) { 
        matchedUser(username: $username) { 
            submitStats: submitStatsGlobal { 
                acSubmissionNum { difficulty count } 
            } 
        } 
        userContestRanking(username: $username) { 
            rating 
            globalRanking 
            attendedContestsCount 
        } 
    }
`;

export async function getLeetCodeStats() {
    if (!leetcode.username) {
        logger.warn('[LEETCODE] Not configured (missing username)');
        return null;
    }

    const cacheKey = `leetcode:${leetcode.username}`;
    if (cache.has(cacheKey)) {
        logger.debug('Cache hit: leetcode stats');
        return cache.get(cacheKey);
    }

    const timer = logger.time('Fetching LeetCode Stats');
    try {
        const data = await graphql(LEETCODE_QUERY, { username: leetcode.username });
        
        if (!data || !data.matchedUser) {
            throw new Error('User not found or invalid response');
        }

        const statsArray = data.matchedUser.submitStats?.acSubmissionNum || [];
        const contest = data.userContestRanking || {};

        const submissions = {};
        statsArray.forEach(({ difficulty, count }) => {
            submissions[difficulty.toLowerCase()] = count;
        });

        const result = {
             totalSolved: submissions['all'] || 0,
             easySolved: submissions['easy'] || 0,
             mediumSolved: submissions['medium'] || 0,
             hardSolved: submissions['hard'] || 0,
             rating: contest.rating ? Math.round(contest.rating) : null,
             globalRanking: contest.globalRanking || null,
             contestsAttended: contest.attendedContestsCount || 0
        };

        timer.end();
        logger.summary('LeetCode Stats', result);
        
        cache.set(cacheKey, result, cacheConfig.ttlMs);
        return result;

    } catch (err) {
        logger.error(`[LEETCODE] Failed to fetch stats for ${leetcode.username}: ${err.message}`);
        return null; // Fallback
    }
}
