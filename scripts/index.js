/**
 * Main Orchestrator — Entry Point (NeonPanda v2)
 *
 * Pipeline:
 *   Config Validation → Parallel Data Collection → Generate SVGs → Update README
 *
 * Design:
 *   - All service calls run in parallel via Promise.all (performance)
 *   - Each service has its own failure fallback (resilience)
 *   - Exits with code 1 on fatal errors so GitHub Actions marks run as FAILED
 *   - Logs execution time at every phase (observability)
 */

import config from './config/config.js';
import logger from './utils/logger.js';

import { getTotalRepoCount } from './services/repoService.js';
import { getTotalCommits, getGithubStats } from './services/commitService.js';
import { getTopLanguages } from './services/languageService.js';
import { getLeetCodeStats } from './services/leetcodeService.js';
import { formatStatsBlock } from './utils/formatter.js';
import { updateReadme } from './generators/readmeGenerator.js';
import { generateLeetCodeSvg, generateGithubSvg } from './generators/svgGenerator.js';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

async function main() {
    const totalTimer = logger.time('Total execution');

    logger.info('═══════════════════════════════════════════════');
    logger.info('  🐼 NeonPanda Automation Bot — Starting   ');
    logger.info(`  User: @${config.github.username}`);
    logger.info('═══════════════════════════════════════════════');

    // ── Phase 1: Fetch all data in parallel ─────────────────────────────────────
    logger.info('[Phase 1] Fetching data (parallel)...');
    const phase1Timer = logger.time('Phase 1 — Data Collection');

    const [totalRepos, totalCommits, githubStats, languages, leetcodeStats] =
        await Promise.all([
            getTotalRepoCount().catch((e) => { logger.error('repoCount failed', { error: e.message }); return 0; }),
            getTotalCommits().catch((e) => { logger.error('totalCommits failed', { error: e.message }); return 0; }),
            getGithubStats().catch((e) => { logger.error('githubStats failed', { error: e.message }); return { totalContributions: 0, currentStreak: 0, longestStreak: 0 }; }),
            getTopLanguages().catch((e) => { logger.error('languages failed', { error: e.message }); return []; }),
            getLeetCodeStats().catch((e) => { logger.error('leetcodeStats failed', { error: e.message }); return null; }),
        ]);

    phase1Timer.end();

    logger.summary('Data Collection', {
        totalRepos,
        totalCommits,
        totalContributions: githubStats.totalContributions,
        currentStreak: githubStats.currentStreak,
        longestStreak: githubStats.longestStreak,
        topLanguage: languages[0]?.language ?? 'N/A',
        leetcodeAvailable: leetcodeStats !== null,
    });

    // ── Phase 2: Format ─────────────────────────────────────────────────────────
    logger.info('[Phase 2] Formatting stats block...');
    const phase2Timer = logger.time('Phase 2 — Formatting');

    const updatedAt = new Date().toISOString();
    const statsBlock = formatStatsBlock({ totalRepos, totalCommits, githubStats }, updatedAt);

    phase2Timer.end();

    // ── Phase 3: Assets & README Generation ──────────────────────────────────────
    logger.info('[Phase 3] Generating SVG Assets and updating README.md...');
    const phase3Timer = logger.time('Phase 3 — Output Generation');

    // Generate LeetCode Cyberpunk SVGs (Dark & Light)
    if (leetcodeStats) {
        try {
            const darkSvg = generateLeetCodeSvg(leetcodeStats, 'dark');
            const lightSvg = generateLeetCodeSvg(leetcodeStats, 'light');
            
            await Promise.all([
                writeFile(resolve('leetcode-stats-dark.svg'), darkSvg, 'utf-8'),
                writeFile(resolve('leetcode-stats-light.svg'), lightSvg, 'utf-8')
            ]);
            
            logger.info(`✨ Generated: leetcode-stats-{dark,light}.svg`);
        } catch (err) {
            logger.error(`Failed to write leetcode-stats.svg: ${err.message}`);
        }
    }

    // Generate GitHub Cyberpunk SVGs (Dark & Light)
    try {
        const topLanguage = languages[0]?.language || 'N/A';
        const githubStatsPayload = {
            totalContributions: githubStats.totalContributions,
            currentStreak: githubStats.currentStreak,
            longestStreak: githubStats.longestStreak,
            topLanguage,
        };

        const darkGhSvg = generateGithubSvg(githubStatsPayload, 'dark');
        const lightGhSvg = generateGithubSvg(githubStatsPayload, 'light');

        await Promise.all([
            writeFile(resolve('github-stats-dark.svg'), darkGhSvg, 'utf-8'),
            writeFile(resolve('github-stats-light.svg'), lightGhSvg, 'utf-8')
        ]);

        logger.info(`✨ Generated: github-stats-{dark,light}.svg`);
    } catch (err) {
        logger.error(`Failed to write github-stats.svg: ${err.message}`);
    }

    const wasUpdated = await updateReadme(statsBlock);

    phase3Timer.end();

    // ── Done ─────────────────────────────────────────────────────────────────────
    const totalElapsed = totalTimer.end();

    logger.info('═══════════════════════════════════════════════');
    logger.info(`  Status:     ${wasUpdated ? '✅ README updated' : '⏭️  No changes needed'}`);
    logger.info(`  Total time: ${totalElapsed}ms`);
    logger.info('═══════════════════════════════════════════════');
}

// Top-level error handler — unrecoverable failures exit with code 1
main().catch((err) => {
    logger.error('💥 Fatal error — NeonPanda terminated', { message: err.message });
    logger.error(err.stack);
    process.exit(1);
});
