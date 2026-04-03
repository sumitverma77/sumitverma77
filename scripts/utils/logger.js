/**
 * Logger Utility — Structured, Leveled, Observable
 *
 * Produces machine-parseable and human-readable log lines compatible
 * with GitHub Actions annotations and CI/CD runners.
 *
 * Format: [ISO_TIMESTAMP][LEVEL] message {optional_json_meta}
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const ACTIVE_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase() ?? 'INFO'];

function timestamp() {
    return new Date().toISOString();
}

function emit(level, message, meta = null) {
    if (LOG_LEVELS[level] < ACTIVE_LEVEL) return;

    const prefix = `[${timestamp()}][${level.padEnd(5)}]`;
    const metaPart = meta ? ` ${JSON.stringify(meta)}` : '';
    const line = `${prefix} ${message}${metaPart}`;

    if (level === 'ERROR' || level === 'WARN') {
        console.error(line);
    } else {
        console.log(line);
    }
}

const logger = {
    debug: (msg, meta) => emit('DEBUG', msg, meta),
    info: (msg, meta) => emit('INFO', msg, meta),
    warn: (msg, meta) => emit('WARN', msg, meta),
    error: (msg, meta) => emit('ERROR', msg, meta),

    /**
     * Start a named timer. Call .end() to log elapsed time.
     * @param {string} label
     * @returns {{ end: () => number }} returns elapsed ms from .end()
     */
    time(label) {
        const start = Date.now();
        emit('INFO', `⏱  ${label} — started`);
        return {
            end: () => {
                const elapsed = Date.now() - start;
                emit('INFO', `✓  ${label} — completed`, { elapsedMs: elapsed });
                return elapsed;
            },
        };
    },

    /**
     * Emit a structured summary line — useful for top-level phase reporting.
     * @param {string} phase - e.g. "Phase 1", "Data Collection"
     * @param {Object} stats - key-value pairs to log
     */
    summary(phase, stats) {
        emit('INFO', `[SUMMARY] ${phase}`, stats);
    },
};

export default logger;
