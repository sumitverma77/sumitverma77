/**
 * Cyberpunk SVG Generator
 * Support for both Dark and Light modes with theme-aware color palettes.
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
    const height = 450;
    
    const total = stats.totalSolved || 0;
    const easy = stats.easySolved || 0;
    const medium = stats.mediumSolved || 0;
    const hard = stats.hardSolved || 0;
    const rating = stats.rating || 'N/A';
    const rank = stats.globalRanking || 'N/A';
    const contests = stats.contestsAttended || 0;

    const diffSum = easy + medium + hard || 1; 
    const radius = 40;
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
                
                .title { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
                .big-number { font-size: 72px; font-weight: bold; }
                .label { font-size: 16px; letter-spacing: 1px; }
                .stat-value { font-size: 22px; font-weight: bold; }
                
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

                .blink { animation: blink-anim 1s infinite; }
                @keyframes blink-anim {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px ${colors.red}); }
                    50% { opacity: 0.3; filter: none; }
                }

                .ring-bg { fill: none; stroke: ${colors.ringBg}; stroke-width: 6; }
                .ring {
                    fill: none;
                    stroke-width: 6;
                    stroke-linecap: round;
                    stroke-dasharray: ${maxDash};
                    transform: rotate(-90deg);
                    transform-origin: center;
                }
            </style>

            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" class="grid"/>
            </pattern>
        </defs>

        <rect width="100%" height="100%" class="bg" rx="10"/>
        <rect width="100%" height="100%" fill="url(#gridPattern)" rx="10"/>

        <text x="40" y="50" class="cyan title">LEETCODE_SYSTEM::STATS</text>
        <line x1="40" y1="65" x2="350" y2="65" stroke="${colors.cyan}" stroke-width="2" opacity="0.5"/>
        <line x1="330" y1="65" x2="350" y2="45" stroke="${colors.cyan}" stroke-width="2" opacity="0.5"/>
        
        <g transform="translate(560, 45)">
            <circle cx="0" cy="-5" r="4" fill="${colors.red}" class="blink"/>
            <text x="12" y="0" class="red" style="font-size: 16px; font-weight: bold; letter-spacing: 2px;">${config.leetcode.username}.LIVE</text>
        </g>
        
        <g transform="translate(40, 160)">
            <text x="0" y="0" class="dim label">TOTAL_SOLVED</text>
            <text x="0" y="70" class="cyan big-number glitch">${total}</text>
        </g>

        <g transform="translate(480, 150)">
            <rect x="0" y="-30" width="280" height="120" fill="${theme === 'dark' ? 'rgba(255,0,255,0.05)' : 'rgba(204,0,204,0.05)'}" stroke="${colors.magenta}" stroke-width="1" rx="5" opacity="0.3"/>
            <text x="20" y="0" class="dim label">CONTEST_RATING</text>
            <text x="20" y="40" class="magenta big-number pulse" style="font-size: 42px;">${rating}</text>
            
            <text x="20" y="70" class="dim label">GLOBAL_RANK: <tspan class="white">${rank}</tspan></text>
            <text x="20" y="100" class="dim label">ATTENDED: <tspan class="white">${contests}</tspan></text>
        </g>

        <g transform="translate(0, 320)">
            <g transform="translate(100, 40)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring green" style="stroke-dashoffset: ${maxDash - (easyPerc * maxDash)}; filter: drop-shadow(0 0 5px ${colors.green});" />
                <text x="0" y="5" class="white stat-value" text-anchor="middle">${easy}</text>
                <text x="0" y="70" class="green label" text-anchor="middle">EASY</text>
            </g>
            
            <g transform="translate(250, 40)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring yellow" style="stroke-dashoffset: ${maxDash - (mediumPerc * maxDash)}; filter: drop-shadow(0 0 5px ${colors.yellow});" />
                <text x="0" y="5" class="white stat-value" text-anchor="middle">${medium}</text>
                <text x="0" y="70" class="yellow label" text-anchor="middle">MEDIUM</text>
            </g>

            <g transform="translate(400, 40)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring red" style="stroke-dashoffset: ${maxDash - (hardPerc * maxDash)}; filter: drop-shadow(0 0 5px ${colors.red});" />
                <text x="0" y="5" class="white stat-value" text-anchor="middle">${hard}</text>
                <text x="0" y="70" class="red label" text-anchor="middle">HARD</text>
            </g>
        </g>
        
        <text x="700" y="430" class="dim" style="font-size: 10px;">v1.1</text>
    </svg>`;
}

export function generateGithubSvg(stats, theme = 'dark') {
    if (!stats) return '';

    const colors = getColors(theme, 'github');
    const width = 800;
    const height = 450;
    
    const total = stats.totalContributions || 0;
    const currentStreak = stats.currentStreak || 0;
    const longestStreak = stats.longestStreak || 0;
    const topLang = stats.topLanguage || 'N/A';
    const bestDay = stats.mostActiveDay || 'N/A';

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
                
                .title { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
                .big-number { font-size: 72px; font-weight: bold; }
                .label { font-size: 16px; letter-spacing: 1px; }
                .stat-value { font-size: 22px; font-weight: bold; }
                
                .glitch { animation: glitch-anim 3s infinite alternate; }
                @keyframes glitch-anim {
                    0% { transform: translate(0); opacity: 1; }
                    20% { transform: translate(-2px, 1px); }
                    21% { transform: translate(2px, -1px); opacity: 0.8; }
                    22% { transform: translate(0); opacity: 1; filter: drop-shadow(0 0 10px ${colors.green}) drop-shadow(-2px 0 ${colors.purple}); }
                    25% { filter: drop-shadow(0 0 ${colors.shadow} rgba(${theme === 'dark' ? '0, 255, 102' : '0, 136, 51'}, ${colors.glow})); }
                    100% { transform: translate(0); }
                }

                .blink { animation: blink-anim 1s infinite; }
                @keyframes blink-anim {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px ${colors.red}); fill: ${colors.red};}
                    50% { opacity: 0.25; filter: none; }
                }
                .live-text {
                    fill: ${colors.red};
                    filter: drop-shadow(0 0 4px rgba(${theme === 'dark' ? '255,0,0' : '204,0,0'},0.7));
                }
            </style>

            <pattern id="gridPatternGithub" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" class="grid"/>
            </pattern>
        </defs>

        <rect width="100%" height="100%" class="bg" rx="10"/>
        <rect width="100%" height="100%" fill="url(#gridPatternGithub)" rx="10"/>

        <text x="40" y="50" class="green title">GITHUB_SYSTEM::STATS</text>
        <line x1="40" y1="65" x2="350" y2="65" stroke="${colors.green}" stroke-width="2" opacity="0.5"/>
        <line x1="330" y1="65" x2="350" y2="45" stroke="${colors.green}" stroke-width="2" opacity="0.5"/>
        
        <g transform="translate(530, 45)">
            <circle cx="0" cy="-5" r="4" class="blink"/>
            <text x="12" y="0" class="live-text" style="font-size: 16px; font-weight: bold; letter-spacing: 2px;">sumitverma77.LIVE</text>
        </g>
        
        <g transform="translate(40, 160)">
            <text x="0" y="0" class="dim label">TOTAL_CONTRIBUTIONS</text>
            <text x="0" y="70" class="green big-number glitch">${total}</text>
        </g>

        <g transform="translate(480, 150)">
            <rect x="0" y="-30" width="280" height="120" fill="${theme === 'dark' ? 'rgba(0,255,102,0.05)' : 'rgba(0,136,51,0.05)'}" stroke="${colors.green}" stroke-width="1" rx="5" opacity="0.3"/>
            <text x="20" y="0" class="dim label">CURRENT_STREAK</text>
            <text x="20" y="40" class="magenta stat-value" style="font-size: 38px;">${currentStreak} <tspan class="dim" style="font-size: 16px">DAYS</tspan></text>
            
            <text x="20" y="75" class="dim label">LONGEST_STREAK: <tspan class="white">${longestStreak}</tspan></text>
        </g>

        <g transform="translate(40, 340)">
            <g transform="translate(0, 0)">
                <text x="0" y="0" class="dim label">TOP_LANGUAGE</text>
                <text x="0" y="30" class="cyan stat-value">${topLang}</text>
            </g>
            
            <g transform="translate(250, 0)">
                <text x="0" y="0" class="dim label">MOST_ACTIVE_DAY</text>
                <text x="0" y="30" class="orange stat-value">${bestDay}</text>
            </g>
        </g>
        
        <text x="700" y="430" class="dim" style="font-size: 10px;">v1.1</text>
    </svg>`;
}

