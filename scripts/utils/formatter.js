/**
 * Formatter Utility — Cyberpunk SVG-only output + All-Time Contribution History Card (v5)
 *
 * v5: Employs clean DomiRosario-style all-time contribution history card
 *     and ultra-sleek widescreen (180px height) telemetry SVGs.
 */

/**
 * Compose the complete stats block injected into README between marker comments.
 * @param {Object} data
 * @param {string} updatedAt - ISO timestamp
 */
export function formatStatsBlock(data, updatedAt) {
    return `
<details open>
  <summary><h2>📈 All-Time Contribution History (2022 – Today)</h2></summary>

  <br/>
  <p align="center">
    <img src="./assets/contribution-history.svg" alt="Sumit Verma All-Time Contribution History" style="width: 100%; max-width: 880px;" />
  </p>
</details>

---

<details open>
  <summary><h2>📊 GitHub Cyberpunk Telemetry</h2></summary>

  <br/>
  <p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="github-stats-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="github-stats-light.svg">
      <img src="github-stats-dark.svg" alt="GitHub Cyberpunk Card" style="width: 100%; max-width: 800px;" />
    </picture>
  </p>
</details>

---

<details open>
  <summary><h2>🏆 LeetCode Cyberpunk Telemetry</h2></summary>

  <br/>
  <p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="leetcode-stats-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="leetcode-stats-light.svg">
      <img src="leetcode-stats-dark.svg" alt="LeetCode Cyberpunk Card" style="width: 100%; max-width: 800px;" />
    </picture>
  </p>
</details>

---

<sub>🐼 Auto-updated by <a href=".github/workflows/update-readme.yml">NeonPanda</a> · ${new Date(updatedAt).toUTCString()}</sub>
`.trim();
}
