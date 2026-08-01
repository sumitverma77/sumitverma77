/**
 * Formatter Utility — Cyberpunk SVG-only output + All-Time Activity Graph (v4)
 *
 * v4: Includes all-time contribution history & activity graph alongside
 *     the sleek widescreen (height 240) github-stats.svg and leetcode-stats.svg.
 */

/**
 * Compose the complete stats block injected into README between marker comments.
 * @param {Object} data
 * @param {string} updatedAt - ISO timestamp
 */
export function formatStatsBlock(data, updatedAt) {
    return `
<details open>
  <summary><h2>📈 All-Time Contribution History &amp; Activity</h2></summary>

  <br/>
  <p align="center">
    <img src="https://github-readme-activity-graph.vercel.app/graph?username=sumitverma77&bg_color=0D1117&color=00F5FF&line=00F5FF&point=FFFFFF&area=true&area_color=00F5FF1A&hide_border=true&custom_title=All-Time%20Contribution%20History%20(Start%20to%20Today)" alt="GitHub All-Time Contribution History Graph" style="width: 100%; max-width: 800px;" />
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
