/**
 * Main Orchestrator — Entry Point
 *
 * Pipeline:
 *   Config Validation → Parallel Data Collection → Aggregate → Format → Generate README
 *
 * Design:
 *   - All service calls run in parallel via Promise.all (performance)
 *   - Each service has its own failure fallback (resilience)
 *   - Exits with code 1 on fatal errors so GitHub Actions marks run as FAILED
 *   - Logs execution time at every phase (observability)
 */

import config from './config/config.js';
import logger from './utils/logger.js';

import { getTotalRepoCount, getRecentRepos } from './services/repoService.js';
import { getTotalCommits, getTotalContributions } from './services/commitService.js';
import { getTopLanguages } from './services/languageService.js';
import { getLatestActivity } from './services/activityService.js';
import { getInsights } from './services/insightsService.js';
import { getLeetCodeStats } from './services/leetcodeService.js';
import { formatStatsBlock } from './utils/formatter.js';
import { updateReadme } from './generators/readmeGenerator.js';
import { generateLeetCodeSvg } from './generators/svgGenerator.js';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

async function main() {
    const totalTimer = logger.time('Total execution');

    logger.info('═══════════════════════════════════════════════');
    logger.info('  🐼 NeonPanda Automation Bot — Starting   ');
    logger.info(`  User: @${config.github.username}`);
    logger.info('═══════════════════════════════════════════════');

    // ── Phase 1: Fetch all data in parallel ─────────────────────────────────────
    logger.info('[Phase 1] Fetching GitHub data (parallel)...');
    const phase1Timer = logger.time('Phase 1 — Data Collection');

    const [totalRepos, totalCommits, totalContributions, recentRepos, languages, activity, insights, leetcodeStats] =
        await Promise.all([
            getTotalRepoCount().catch((e) => { logger.error('repoCount failed', { error: e.message }); return 0; }),
            getTotalCommits().catch((e) => { logger.error('totalCommits failed', { error: e.message }); return 0; }),
            getTotalContributions().catch((e) => { logger.error('totalContributions failed', { error: e.message }); return 0; }),
            getRecentRepos().catch((e) => { logger.error('recentRepos failed', { error: e.message }); return []; }),
            getTopLanguages().catch((e) => { logger.error('languages failed', { error: e.message }); return []; }),
            getLatestActivity().catch((e) => { logger.error('activity failed', { error: e.message }); return null; }),
            getInsights().catch((e) => { logger.error('insights failed', { error: e.message }); return null; }),
            getLeetCodeStats().catch((e) => { logger.error('leetcodeStats failed', { error: e.message }); return null; }),
        ]);

    phase1Timer.end();

    logger.summary('Data Collection', {
        totalRepos,
        totalCommits,
        totalContributions,
        recentReposCount: recentRepos.length,
        topLanguage: languages[0]?.language ?? 'N/A',
        latestActivity: activity?.repo ?? 'none',
        insightsAvailable: insights !== null,
        leetcodeAvailable: leetcodeStats !== null,
    });

    // ── Phase 2: Format ─────────────────────────────────────────────────────────
    logger.info('[Phase 2] Formatting stats block...');
    const phase2Timer = logger.time('Phase 2 — Formatting');

    const updatedAt = new Date().toISOString();
    const statsBlock = formatStatsBlock(
        { totalRepos, totalCommits, totalContributions, recentRepos, languages, activity, insights, leetcodeStats },
        updatedAt
    );

    phase2Timer.end();

    // ── Phase 3: Assets & README Generation ──────────────────────────────────────
    logger.info('[Phase 3] Generating Assets and README.md...');
    const phase3Timer = logger.time('Phase 3 — Output Generation');

    // Generate Cyberpunk SVG if LeetCode data is available
    if (leetcodeStats) {
        try {
            const svgContent = generateLeetCodeSvg(leetcodeStats);
            const svgPath = resolve('leetcode-stats.svg');
            await writeFile(svgPath, svgContent, 'utf-8');
            logger.info(`✨ Generated cyberpunk SVG: leetcode-stats.svg`);
        } catch (err) {
            logger.error(`Failed to write leetcode-stats.svg: ${err.message}`);
        }
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
