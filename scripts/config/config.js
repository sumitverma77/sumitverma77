/**
 * Configuration Module
 * Single Responsibility: manage all environment-based configuration.
 * Fail-fast: throws on missing required variables so failures surface immediately.
 */

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`[Config] Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optionalEnv(name, defaultValue) {
  return process.env[name]?.trim() || defaultValue;
}

const config = {
  github: {
    token: requireEnv('GITHUB_TOKEN'),
    username: requireEnv('GITHUB_USERNAME'),
    apiBase: 'https://api.github.com',
    maxRetries: parseInt(optionalEnv('GITHUB_MAX_RETRIES', '3'), 10),
    retryDelayMs: parseInt(optionalEnv('GITHUB_RETRY_DELAY_MS', '1000'), 10),
    perPage: 100,
  },
  readme: {
    path: optionalEnv('README_PATH', 'README.md'),
    startMarker: '<!-- GITHUB_STATS:START -->',
    endMarker: '<!-- GITHUB_STATS:END -->',
  },
  cache: {
    ttlMs: parseInt(optionalEnv('CACHE_TTL_MS', '300000'), 10), // 5 minutes
  },
  topLanguagesCount: 6,
  recentReposCount: 5,
  leetcode: {
    username: optionalEnv('LEETCODE_USERNAME', 'sumit_verma_77'),
  },
};

export default config;
