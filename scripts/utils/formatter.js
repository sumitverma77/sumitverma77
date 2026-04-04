/**
 * Formatter Utility — Cyberpunk SVG-only output (v3)
 *
 * v3: All legacy markdown table formatters removed.
 *     Output is purely two <details open> blocks embedding
 *     github-stats.svg and leetcode-stats.svg.
 */

// ── Section formatters ────────────────────────────────────────────────────────

/**
 * Compose the complete stats block injected into README between marker comments.
 * @param {Object} data
 * @param {string} updatedAt - ISO timestamp
 */
export function formatStatsBlock(data, updatedAt) {
    return `
<details open>
  <summary><h2>📊 GitHub Cyberpunk Stats</h2></summary>

  <br/>
  <p align="center">
    <img src="github-stats.svg" alt="GitHub Cyberpunk Card" style="width: 100%; max-width: 800px;" />
  </p>
</details>

---

<details open>
  <summary><h2>🏆 LeetCode Cyberpunk Stats</h2></summary>

  <br/>
  <p align="center">
    <img src="leetcode-stats.svg" alt="LeetCode Cyberpunk Card" style="width: 100%; max-width: 800px;" />
  </p>
</details>

---

<sub>🐼 Auto-updated by <a href=".github/workflows/update-readme.yml">NeonPanda</a> · ${new Date(updatedAt).toUTCString()}</sub>
`.trim();
}
