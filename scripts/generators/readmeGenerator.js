/**
 * README Generator
 * Responsibility: read the existing README.md, replace content between
 * placeholder markers, and write back only if a change occurred.
 *
 * This is a pure I/O module — all content decisions are made by formatters.
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const { readme } = config;

/**
 * Inject new content between the START and END markers in README.md.
 * Performs a no-op write if the content hasn't changed (safe for CI commits).
 *
 * @param {string} newSection - Formatted Markdown to inject
 * @returns {Promise<boolean>} - true if file was updated, false if no change
 */
export async function updateReadme(newSection) {
    const filePath = resolve(readme.path);

    logger.info(`Reading README from: ${filePath}`);
    let original;
    try {
        original = await readFile(filePath, 'utf-8');
    } catch (err) {
        throw new Error(`Cannot read README at ${filePath}: ${err.message}`);
    }

    const startMarker = readme.startMarker;
    const endMarker = readme.endMarker;

    const startIdx = original.indexOf(startMarker);
    const endIdx = original.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
        throw new Error(
            `README is missing placeholder markers.\n` +
            `Expected: "${startMarker}" and "${endMarker}"\n` +
            `Please add them to your README.md.`
        );
    }

    if (startIdx >= endIdx) {
        throw new Error(`END marker appears before START marker in README.md`);
    }

    // Build replacement — preserve markers themselves
    const before = original.slice(0, startIdx + startMarker.length);
    const after = original.slice(endIdx);
    const updated = `${before}\n\n${newSection}\n\n${after}`;

    // Only write if there is an actual diff (avoids spurious git commits)
    if (updated === original) {
        logger.info('README is already up-to-date. No changes written.');
        return false;
    }

    await writeFile(filePath, updated, 'utf-8');
    logger.info('README.md updated successfully ✓');
    return true;
}
