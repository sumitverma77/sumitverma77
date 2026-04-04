/**
 * LeetCode API HTTP Client
 * Responsibilities:
 *   - Execute GraphQL queries against LeetCode's public endpoint
 */

import fetch from 'node-fetch';
import logger from '../utils/logger.js';
import config from '../config/config.js';

const LEETCODE_API = 'https://leetcode.com/graphql';

export async function graphql(query, variables = {}) {
    logger.debug(`[LEETCODE] POST ${LEETCODE_API}`);
    
    // Some headers like Content-Type are required. 
    // We omit Cookie as it's not strictly necessary for public user data,
    // but the user's provided cURL included it. For simplicity and robustness 
    // in CI/CD without hardcoded secrets, we try without first.
    const response = await fetch(LEETCODE_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GitHub-Readme-Bot',
            'Referer': 'https://leetcode.com',
            'Origin': 'https://leetcode.com',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`LeetCode API error [${response.status}]: ${body}`);
    }

    const { data, errors } = await response.json();
    if (errors && errors.length > 0) {
        throw new Error(`LeetCode GraphQL error: ${errors[0].message}`);
    }

    return data;
}

export default { graphql };
