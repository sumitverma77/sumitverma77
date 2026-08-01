/**
 * Cyberpunk SVG Generator
 * Support for both Dark and Light modes with theme-aware color palettes.
 * Ultra-sleek widescreen height (180px) with zero wasted vertical gap & full telemetry info.
 */

import config from '../config/config.js';

/**
 * Get color palette based on theme
 */
function getColors(theme = 'dark', type = 'leetcode') {
    const isDark = theme === 'dark';
    
    // Base colors that switch between modes
    const base = {
        bg: isDark ? '#0D1117' : '#FFFFFF',
        grid: isDark 
            ? (type === 'leetcode' ? 'rgba(0, 255, 255, 0.05)' : 'rgba(0, 255, 0, 0.05)')
            : 'rgba(0, 0, 0, 0.05)',
        textMain: isDark ? '#E0E0E0' : '#1F2328',
        textDim: isDark ? '#8B949E' : '#656D76',
        ringBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    };

    // Neon accents - slightly adjusted for legibility on light background
    const accents = {
        cyan: isDark ? '#00F5FF' : '#0099CC',
        magenta: isDark ? '#FF00FF' : '#CC00CC',
        green: isDark ? '#00FF66' : '#008833',
        yellow: isDark ? '#FFEB3B' : '#AA8800',
        orange: isDark ? '#FF9800' : '#CC6600',
        red: isDark ? '#FF3333' : '#CC0000',
        purple: isDark ? '#B000FF' : '#8800CC',
    };

    // Filter intensities
    const filters = {
        glow: isDark ? '0.6' : '0.4',
        shadow: isDark ? '5px' : '3px',
    };

    return { ...base, ...accents, ...filters };
}

export function generateLeetCodeSvg(stats, theme = 'dark') {
    if (!stats) return '';

    const colors = getColors(theme, 'leetcode');
    const width = 800;
    const height = 180;
    
    const total = stats.totalSolved || 0;
    const easy = stats.easySolved || 0;
    const medium = stats.mediumSolved || 0;
    const hard = stats.hardSolved || 0;
    const rating = stats.rating || 'N/A';
    const rank = stats.globalRanking || 'N/A';
    const contests = stats.contestsAttended || 0;

    const diffSum = easy + medium + hard || 1; 
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const maxDash = circumference;
    
    const easyPerc = easy / diffSum;
    const mediumPerc = medium / diffSum;
    const hardPerc = hard / diffSum;

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&amp;display=swap');
                
                * { font-family: 'Share Tech Mono', monospace; }
                
                .bg { fill: ${colors.bg}; }
                .grid { stroke: ${colors.grid}; stroke-width: 1; }
                
                .cyan { fill: ${colors.cyan}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '0, 245, 255' : '0, 153, 204'}, ${colors.glow})); }
                .magenta { fill: ${colors.magenta}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '255, 0, 255' : '204, 0, 204'}, ${colors.glow})); }
                .green { fill: ${colors.green}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '0, 255, 102' : '0, 136, 51'}, ${colors.glow})); }
                .yellow { fill: ${colors.yellow}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '255, 235, 59' : '170, 136, 0'}, ${colors.glow})); }
                .red { fill: ${colors.red}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '255, 51, 51' : '204, 0, 0'}, ${colors.glow})); }
                .white { fill: ${colors.textMain}; }
                .dim { fill: ${colors.textDim}; }
                
                .title { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
                .big-number { font-size: 46px; font-weight: bold; }
                .label { font-size: 12px; letter-spacing: 1px; }
                .stat-value { font-size: 15px; font-weight: bold; }
                
                .glitch { animation: glitch-anim 3s infinite alternate; }
                @keyframes glitch-anim {
                    0% { transform: translate(0); opacity: 1; }
                    20% { transform: translate(-2px, 1px); }
                    21% { transform: translate(2px, -1px); opacity: 0.8; }
                    22% { transform: translate(0); opacity: 1; filter: drop-shadow(0 0 10px ${colors.cyan}) drop-shadow(-2px 0 ${colors.magenta}); }
                    25% { filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '0, 245, 255' : '0, 153, 204'}, ${colors.glow})); }
                    100% { transform: translate(0); }
                }

                .pulse { animation: pulse-anim 2s ease-in-out infinite alternate; }
                @keyframes pulse-anim {
                    0% { opacity: 0.8; filter: drop-shadow(0 0 2px ${colors.magenta}); }
                    100% { opacity: 1; filter: drop-shadow(0 0 10px ${colors.magenta}); }
                }

                .blink { animation: blink-anim 1.5s infinite ease-in-out; }
                @keyframes blink-anim {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px ${colors.red}); }
                    50% { opacity: 0.2; filter: none; }
                }

                .ring-bg { fill: none; stroke: ${colors.ringBg}; stroke-width: 4.5; }
                .ring {
                    fill: none;
                    stroke-width: 4.5;
                    stroke-linecap: round;
                    stroke-dasharray: ${maxDash};
                    transform: rotate(-90deg);
                    transform-origin: center;
                }
            </style>

            <pattern id="gridPattern" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" class="grid"/>
            </pattern>
        </defs>

        <rect width="100%" height="100%" class="bg" rx="8"/>
        <rect width="100%" height="100%" fill="url(#gridPattern)" rx="8"/>

        <text x="25" y="30" class="cyan title">LEETCODE_SYSTEM::TELEMETRY</text>
        <line x1="25" y1="40" x2="310" y2="40" stroke="${colors.cyan}" stroke-width="1.5" opacity="0.5"/>
        <line x1="295" y1="40" x2="310" y2="28" stroke="${colors.cyan}" stroke-width="1.5" opacity="0.5"/>
        
        <g transform="translate(720, 28)">
            <circle cx="0" cy="-4" r="4" fill="${colors.red}" class="blink"/>
            <text x="12" y="0" class="red" style="font-size: 12px; font-weight: bold; letter-spacing: 2px;">LIVE</text>
        </g>
        
        <g transform="translate(25, 65)">
            <text x="0" y="0" class="dim label">TOTAL_SOLVED</text>
            <text x="0" y="46" class="cyan big-number glitch">${total}</text>
            <text x="0" y="72" class="dim label">ALGORITHMS &amp; DATA STRUCTURES</text>
        </g>

        <g transform="translate(260, 52)">
            <rect x="0" y="0" width="230" height="105" fill="${theme === 'dark' ? 'rgba(255,0,255,0.05)' : 'rgba(204,0,204,0.05)'}" stroke="${colors.magenta}" stroke-width="1" rx="6" opacity="0.3"/>
            <text x="15" y="22" class="dim label">CONTEST_RATING</text>
            <text x="15" y="56" class="magenta big-number pulse" style="font-size: 30px;">${rating}</text>
            <text x="15" y="78" class="dim label">GLOBAL_RANK: <tspan class="white">${rank}</tspan></text>
            <text x="15" y="95" class="dim label">ATTENDED: <tspan class="white">${contests}</tspan></text>
        </g>

        <g transform="translate(515, 95)">
            <g transform="translate(45, 0)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring green" style="stroke-dashoffset: ${maxDash - (easyPerc * maxDash)}; filter: drop-shadow(0 0 5px ${colors.green});" />
                <text x="0" y="4" class="white stat-value" text-anchor="middle">${easy}</text>
                <text x="0" y="44" class="green label" text-anchor="middle">EASY</text>
            </g>
            
            <g transform="translate(140, 0)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring yellow" style="stroke-dashoffset: ${maxDash - (mediumPerc * maxDash)}; filter: drop-shadow(0 0 5px ${colors.yellow});" />
                <text x="0" y="4" class="white stat-value" text-anchor="middle">${medium}</text>
                <text x="0" y="44" class="yellow label" text-anchor="middle">MEDIUM</text>
            </g>

            <g transform="translate(235, 0)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring red" style="stroke-dashoffset: ${maxDash - (hardPerc * maxDash)}; filter: drop-shadow(0 0 5px ${colors.red});" />
                <text x="0" y="4" class="white stat-value" text-anchor="middle">${hard}</text>
                <text x="0" y="44" class="red label" text-anchor="middle">HARD</text>
            </g>
        </g>
        
        <text x="740" y="168" class="dim" style="font-size: 9px;">v3.0_SLIM</text>
    </svg>`;
}

export function generateGithubSvg(stats, theme = 'dark') {
    if (!stats) return '';

    const colors = getColors(theme, 'github');
    const width = 800;
    const height = 180;
    
    const total = stats.totalContributions || 0;
    const currentStreak = stats.currentStreak || 0;
    const longestStreak = stats.longestStreak || 0;
    const topLang = stats.topLanguage || 'N/A';
    const bestDay = stats.mostActiveDay || 'N/A';
    const totalCommits = stats.totalCommits || 'N/A';

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&amp;display=swap');
                
                * { font-family: 'Share Tech Mono', monospace; }
                
                .bg { fill: ${colors.bg}; }
                .grid { stroke: ${colors.grid}; stroke-width: 1; }
                
                .cyan { fill: ${colors.cyan}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '0, 245, 255' : '0, 153, 204'}, ${colors.glow})); }
                .magenta { fill: ${colors.magenta}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '255, 0, 255' : '204, 0, 204'}, ${colors.glow})); }
                .green { fill: ${colors.green}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '0, 255, 102' : '0, 136, 51'}, ${colors.glow})); }
                .orange { fill: ${colors.orange}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '255, 152, 0' : '204, 102, 0'}, ${colors.glow})); }
                .purple { fill: ${colors.purple}; filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '176, 0, 255' : '136, 0, 204'}, ${colors.glow})); }
                .white { fill: ${colors.textMain}; }
                .dim { fill: ${colors.textDim}; }
                
                .title { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
                .big-number { font-size: 46px; font-weight: bold; }
                .label { font-size: 12px; letter-spacing: 1px; }
                .stat-value { font-size: 16px; font-weight: bold; }
                
                .glitch { animation: glitch-anim 3s infinite alternate; }
                @keyframes glitch-anim {
                    0% { transform: translate(0); opacity: 1; }
                    20% { transform: translate(-2px, 1px); }
                    21% { transform: translate(2px, -1px); opacity: 0.8; }
                    22% { transform: translate(0); opacity: 1; filter: drop-shadow(0 0 10px ${colors.green}) drop-shadow(-2px 0 ${colors.purple}); }
                    25% { filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '0, 245, 102' : '0, 136, 51'}, ${colors.glow})); }
                    100% { transform: translate(0); }
                }

                .blink { animation: blink-anim 1.5s infinite ease-in-out; }
                @keyframes blink-anim {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px ${colors.red}); fill: ${colors.red};}
                    50% { opacity: 0.2; filter: none; stroke: ${colors.red}; stroke-width: 1; }
                }
                .live-text {
                    fill: ${colors.red};
                    filter: drop-shadow(0 0 4px rgba(${theme === 'dark' ? '255,0,0' : '204,0,0'},0.7));
                }
            </style>

            <pattern id="gridPatternGithub" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" class="grid"/>
            </pattern>
        </defs>

        <rect width="100%" height="100%" class="bg" rx="8"/>
        <rect width="100%" height="100%" fill="url(#gridPatternGithub)" rx="8"/>

        <text x="25" y="30" class="green title">GITHUB_SYSTEM::TELEMETRY</text>
        <line x1="25" y1="40" x2="310" y2="40" stroke="${colors.green}" stroke-width="1.5" opacity="0.5"/>
        <line x1="295" y1="40" x2="310" y2="28" stroke="${colors.green}" stroke-width="1.5" opacity="0.5"/>
        
        <g transform="translate(720, 28)">
            <circle cx="0" cy="-4" r="4" class="blink"/>
            <text x="12" y="0" class="live-text" style="font-size: 12px; font-weight: bold; letter-spacing: 2px;">LIVE</text>
        </g>
        
        <g transform="translate(25, 65)">
            <text x="0" y="0" class="dim label">TOTAL_CONTRIBUTIONS</text>
            <text x="0" y="46" class="green big-number glitch">${total}</text>
            <text x="0" y="72" class="dim label">TOTAL_COMMITS: <tspan class="white">${totalCommits}</tspan></text>
        </g>

        <g transform="translate(290, 52)">
            <rect x="0" y="0" width="240" height="105" fill="${theme === 'dark' ? 'rgba(0,255,102,0.05)' : 'rgba(0,136,51,0.05)'}" stroke="${colors.green}" stroke-width="1" rx="6" opacity="0.3"/>
            <text x="18" y="22" class="dim label">CURRENT_STREAK</text>
            <text x="18" y="56" class="magenta stat-value" style="font-size: 30px;">${currentStreak} <tspan class="dim" style="font-size: 14px">DAYS</tspan></text>
            
            <text x="18" y="82" class="dim label">LONGEST_STREAK: <tspan class="white">${longestStreak} DAYS</tspan></text>
        </g>

        <g transform="translate(565, 65)">
            <g transform="translate(0, 0)">
                <text x="0" y="0" class="dim label">TOP_LANGUAGE</text>
                <text x="0" y="24" class="cyan stat-value">${topLang}</text>
            </g>
            
            <g transform="translate(0, 60)">
                <text x="0" y="0" class="dim label">MOST_ACTIVE_DAY</text>
                <text x="0" y="24" class="orange stat-value">${bestDay}</text>
            </g>
        </g>
        
        <text x="740" y="168" class="dim" style="font-size: 9px;">v3.0_SLIM</text>
    </svg>`;
}

export function generateContributionHistorySvg(stats, theme = 'dark') {
    const total = stats?.totalContributions || '1,190';
    const repos = stats?.totalRepos || '25';
    
    return `<svg width="880" height="220" viewBox="0 0 880 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t d">
  <title id="t">Sumit Verma (sumitverma77) Contribution History</title>
  <desc id="d">GitHub contribution details and activity history</desc>
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&amp;display=swap');
      .bg { fill: #0D1117; stroke: #30363d; stroke-width: 1.5; }
      .title { font: bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: #58a6ff; }
      .label { font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: #8b949e; }
      .subtext { font: 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; fill: #8b949e; }
      .axis { stroke: #30363d; stroke-width: 1; }
      .icon { fill: #8b949e; }
      .area { fill: url(#greenGradient); opacity: 0.85; }
      .line { stroke: #3fb950; stroke-width: 2.5; fill: none; filter: drop-shadow(0 0 6px rgba(63, 185, 80, 0.4)); }
    </style>
    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3fb950" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#238636" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  
  <rect class="bg" x="1" y="1" width="878" height="218" rx="10" />

  <!-- Left Column: User Details -->
  <text class="title" x="35" y="45">SumitVerma (Sumit)</text>

  <!-- GitHub Logo & Total Contributions -->
  <g transform="translate(35, 75)">
    <path class="icon" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    <text class="label" x="24" y="12">${total} Contributions in the last year</text>
  </g>

  <!-- Repo Icon & Public Repos -->
  <g transform="translate(35, 115)">
    <path class="icon" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
    <text class="label" x="24" y="12">${repos} Public Repos</text>
  </g>

  <!-- Clock Icon & Join Date -->
  <g transform="translate(35, 155)">
    <path class="icon" d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 4a.75.75 0 01.75.75v3.5l2.25 1.5a.75.75 0 01-.84 1.24L7.66 9.3a.75.75 0 01-.41-.67V4.75A.75.75 0 018 4z" />
    <text class="label" x="24" y="12">Joined GitHub 2022</text>
  </g>

  <!-- Right Column: Contribution Area Chart -->
  <text class="subtext" x="830" y="40" text-anchor="end">contribution activity history</text>
  
  <!-- Chart Axes -->
  <line class="axis" x1="390" y1="175" x2="830" y2="175" />
  <line class="axis" x1="830" y1="65" x2="830" y2="178" />

  <!-- Y Axis Labels -->
  <text class="subtext" x="838" y="178">0</text>
  <text class="subtext" x="838" y="145">300</text>
  <text class="subtext" x="838" y="110">600</text>
  <text class="subtext" x="838" y="75">1,200</text>

  <!-- X Axis Labels -->
  <text class="subtext" x="390" y="195">2022</text>
  <text class="subtext" x="495" y="195">2023</text>
  <text class="subtext" x="600" y="195">2024</text>
  <text class="subtext" x="705" y="195">2025</text>
  <text class="subtext" x="810" y="195">Today</text>

  <!-- Area & Line Paths -->
  <path class="area" d="M 390 174 L 430 165 L 480 155 L 530 148 L 570 135 L 620 120 L 670 95 L 720 110 L 770 85 L 815 72 L 830 70 L 830 174 Z" />
  <path class="line" d="M 390 174 L 430 165 L 480 155 L 530 148 L 570 135 L 620 120 L 670 95 L 720 110 L 770 85 L 815 72 L 830 70" />
</svg>`;
}

