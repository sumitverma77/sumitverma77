/**
 * Formatter Utility — SVG-only output without headings or collapsible details (v6)
 *
 * v6: Removes all <h2> headings and <details> wrappers to save vertical space.
 *     Outputs pure center-aligned SVGs for contribution history and telemetry.
 */

/**
 * Compose the complete stats block injected into README between marker comments.
 * @param {Object} data
 * @param {string} updatedAt - ISO timestamp
 */
export function formatStatsBlock(data, updatedAt) {
    return `
<p align="center">
  <img src="./assets/contribution-history.svg" alt="GitHub Contribution History" style="width: 100%; max-width: 880px;" />
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="github-stats-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="github-stats-light.svg">
    <img src="github-stats-dark.svg" alt="GitHub Cyberpunk Card" style="width: 100%; max-width: 800px;" />
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="leetcode-stats-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="leetcode-stats-light.svg">
    <img src="leetcode-stats-dark.svg" alt="LeetCode Cyberpunk Card" style="width: 100%; max-width: 800px;" />
  </picture>
</p>

---

<sub>🐼 Auto-updated by <a href=".github/workflows/update-readme.yml">NeonPanda</a> · ${new Date(updatedAt).toUTCString()}</sub>
`.trim();
}
