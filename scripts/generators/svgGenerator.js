/**
 * Cyberpunk LeetCode SVG Generator
 * Generates an animated SVG with glitch effects and neon aesthetic.
 */

export function generateLeetCodeSvg(stats) {
    if (!stats) return '';

    const width = 800;
    const height = 450;
    
    // Fallbacks just in case
    const total = stats.totalSolved || 0;
    const easy = stats.easySolved || 0;
    const medium = stats.mediumSolved || 0;
    const hard = stats.hardSolved || 0;
    const rating = stats.rating || 'N/A';
    const rank = stats.globalRanking || 'N/A';
    const contests = stats.contestsAttended || 0;

    // Calculate ring percentages (total relative to difficulty sum)
    const diffSum = easy + medium + hard || 1; 
    
    // Rings configuration
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
                
                .bg { fill: #0D1117; }
                
                /* Matrix-like subtle grid pattern */
                .grid {
                    stroke: rgba(0, 255, 255, 0.05);
                    stroke-width: 1;
                }
                
                /* Neon Text Classes */
                .cyan { fill: #00F5FF; filter: drop-shadow(0 0 5px rgba(0, 245, 255, 0.6)); }
                .magenta { fill: #FF00FF; filter: drop-shadow(0 0 5px rgba(255, 0, 255, 0.6)); }
                .green { fill: #00FF66; filter: drop-shadow(0 0 5px rgba(0, 255, 102, 0.6)); }
                .yellow { fill: #FFEB3B; filter: drop-shadow(0 0 5px rgba(255, 235, 59, 0.6)); }
                .red { fill: #FF3333; filter: drop-shadow(0 0 5px rgba(255, 51, 51, 0.6)); }
                .white { fill: #E0E0E0; }
                .dim { fill: #8B949E; }
                
                /* Layout Fonts */
                .title { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
                .big-number { font-size: 72px; font-weight: bold; }
                .label { font-size: 16px; letter-spacing: 1px; }
                .stat-value { font-size: 22px; font-weight: bold; }
                
                /* Glitch Animation */
                .glitch {
                    animation: glitch-anim 3s infinite alternate;
                }
                
                @keyframes glitch-anim {
                    0% { transform: translate(0); opacity: 1; }
                    20% { transform: translate(-2px, 1px); }
                    21% { transform: translate(2px, -1px); opacity: 0.8; }
                    22% { transform: translate(0); opacity: 1; filter: drop-shadow(0 0 10px #00F5FF) drop-shadow(-2px 0 #FF00FF); }
                    25% { filter: drop-shadow(0 0 5px rgba(0,245,255,0.6)); }
                    100% { transform: translate(0); }
                }

                /* Pulse for Rating */
                .pulse {
                    animation: pulse-anim 2s ease-in-out infinite alternate;
                }
                
                @keyframes pulse-anim {
                    0% { opacity: 0.8; filter: drop-shadow(0 0 2px #FF00FF); }
                    100% { opacity: 1; filter: drop-shadow(0 0 10px #FF00FF); }
                }

                /* Progress Rings Setup */
                .ring-bg { fill: none; stroke: rgba(255, 255, 255, 0.1); stroke-width: 6; }
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

        <!-- Background -->
        <rect width="100%" height="100%" class="bg" rx="10"/>
        <rect width="100%" height="100%" fill="url(#gridPattern)" rx="10"/>

        <!-- Header -->
        <text x="40" y="50" class="cyan title">LEETCODE_SYSTEM::STATS</text>
        <line x1="40" y1="65" x2="350" y2="65" stroke="#00F5FF" stroke-width="2" opacity="0.5"/>
        <line x1="330" y1="65" x2="350" y2="45" stroke="#00F5FF" stroke-width="2" opacity="0.5"/>
        
        <!-- Main: Total Solved -->
        <g transform="translate(40, 160)">
            <text x="0" y="0" class="dim label">TOTAL_SOLVED</text>
            <text x="0" y="70" class="cyan big-number glitch">${total}</text>
        </g>

        <!-- Right Side: Contest Rating & Rank -->
        <g transform="translate(480, 150)">
            <rect x="0" y="-30" width="280" height="120" fill="rgba(255,0,255,0.05)" stroke="#FF00FF" stroke-width="1" rx="5" opacity="0.3"/>
            <text x="20" y="0" class="dim label">CONTEST_RATING</text>
            <text x="20" y="40" class="magenta big-number pulse" style="font-size: 42px;">${rating}</text>
            
            <text x="20" y="70" class="dim label">GLOBAL_RANK: <tspan class="white">${rank}</tspan></text>
            <text x="20" y="100" class="dim label">ATTENDED: <tspan class="white">${contests}</tspan></text>
        </g>

        <!-- Bottom: Difficulty Rings -->
        <g transform="translate(0, 320)">
            <!-- Easy -->
            <g transform="translate(100, 40)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring green" style="stroke-dashoffset: ${maxDash - (easyPerc * maxDash)}; filter: drop-shadow(0 0 5px #00FF66);" />
                <text x="0" y="5" class="white stat-value" text-anchor="middle">${easy}</text>
                <text x="0" y="70" class="green label" text-anchor="middle">EASY</text>
            </g>
            
            <!-- Medium -->
            <g transform="translate(250, 40)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring yellow" style="stroke-dashoffset: ${maxDash - (mediumPerc * maxDash)}; filter: drop-shadow(0 0 5px #FFEB3B);" />
                <text x="0" y="5" class="white stat-value" text-anchor="middle">${medium}</text>
                <text x="0" y="70" class="yellow label" text-anchor="middle">MEDIUM</text>
            </g>

            <!-- Hard -->
            <g transform="translate(400, 40)">
                <circle cx="0" cy="0" r="${radius}" class="ring-bg"/>
                <circle cx="0" cy="0" r="${radius}" class="ring red" style="stroke-dashoffset: ${maxDash - (hardPerc * maxDash)}; filter: drop-shadow(0 0 5px #FF3333);" />
                <text x="0" y="5" class="white stat-value" text-anchor="middle">${hard}</text>
                <text x="0" y="70" class="red label" text-anchor="middle">HARD</text>
            </g>
        </g>
        
        <!-- Boot Text Decor -->
        <text x="40" y="430" class="dim" style="font-size: 10px;">> sys_ready: true</text>
        <text x="700" y="430" class="dim" style="font-size: 10px;">v1.0</text>
    </svg>`;
}
