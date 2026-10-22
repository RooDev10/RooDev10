export const THEMES = {
  dark: {
    bg: '#0d1117',
    panel: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    muted: '#8b949e',
    accent: '#58a6ff',
    accent2: '#a371f7',
  },
  light: {
    bg: '#ffffff',
    panel: '#f6f8fa',
    border: '#d0d7de',
    text: '#1f2328',
    muted: '#59636e',
    accent: '#0969da',
    accent2: '#8250df',
  },
};

const FONT = "'Segoe UI', system-ui, -apple-system, Ubuntu, Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', Consolas, monospace";
const NUMBER = new Intl.NumberFormat('en-US');

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function svg(width, height, t, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>
  text { font-family: ${FONT}; fill: ${t.text}; }
  .label { font: 600 12px ${MONO}; fill: ${t.muted}; letter-spacing: 0.08em; }
  .value { font: 700 30px ${FONT}; }
  .title { font: 600 16px ${FONT}; }
  .muted { fill: ${t.muted}; font-size: 13px; }
  .mono { font-family: ${MONO}; }
  .scan { animation: scan 7s linear infinite; }
  .cursor { animation: blink 1s steps(2) infinite; }
  @keyframes scan { from { transform: translateY(0); } to { transform: translateY(${height}px); } }
  @keyframes blink { to { visibility: hidden; } }
</style>
${body}
</svg>
`;
}

function panel(width, height, t, x = 0, y = 0, w = width, h = height) {
  return `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="12" fill="${t.panel}" stroke="${t.border}"/>`;
}

export function renderBanner({ config, metrics }, t) {
  const width = 1000;
  const height = 300;
  const promptText = `$ ${config.prompt}`;
  // Aproximación del ancho de una letra monoespaciada de 16px (0.6em).
  const cursorX = 56 + promptText.length * 9.6 + 4;

  return svg(width, height, t, `
  <defs>
    <linearGradient id="brand" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${t.accent}"/>
      <stop offset="1" stop-color="${t.accent2}"/>
    </linearGradient>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="${t.border}" opacity="0.5"/>
    </pattern>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.6">
      <stop offset="0" stop-color="${t.accent2}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${t.accent2}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="16" fill="${t.bg}"/>
  <rect width="${width}" height="${height}" rx="16" fill="url(#grid)"/>
  <rect width="${width}" height="${height}" rx="16" fill="url(#glow)"/>
  <rect width="6" height="${height}" rx="3" fill="url(#brand)"/>
  <line class="scan" x1="0" x2="${width}" y1="0" y2="0" stroke="${t.accent}" stroke-opacity="0.25" stroke-width="2"/>

  <text class="mono" x="56" y="78" font-size="16" fill="${t.accent}">${esc(promptText)}</text>
  <rect class="cursor" x="${cursorX.toFixed(1)}" y="62" width="9" height="19" fill="${t.accent}"/>

  <text x="56" y="150" font-size="60" font-weight="800" fill="url(#brand)">${esc(config.name)}</text>
  <text x="56" y="190" font-size="22" font-weight="600">${esc(config.headline)}</text>
  <text class="muted" x="56" y="232" font-size="15">${esc(config.location)}  ·  ${metrics.age} años  ·  ${NUMBER.format(metrics.daysCoding)} días programando</text>

  <text class="mono" x="${width - 40}" y="${height - 24}" font-size="12" text-anchor="end" fill="${t.muted}">actualizado ${metrics.updatedAt}</text>
  `);
}

export function renderStats({ metrics }, t) {
  const width = 1000;
  const height = 150;
  const gap = 16;
  const tileWidth = (width - 48 - gap * 5) / 6;

  const tiles = [
    { label: 'COMMITS / AÑO', value: NUMBER.format(metrics.commitsYear) },
    { label: 'PULL REQUESTS', value: NUMBER.format(metrics.prsYear) },
    { label: 'ESTRELLAS', value: NUMBER.format(metrics.stars) },
    { label: 'REPOS PÚBLICOS', value: NUMBER.format(metrics.repos) },
    { label: 'SEGUIDORES', value: NUMBER.format(metrics.followers) },
    { label: 'RACHA ACTUAL', value: `${metrics.streak.current}d`, sub: `máx ${metrics.streak.longest}d` },
  ];

  const body = tiles
    .map((tile, i) => {
      const x = 24 + i * (tileWidth + gap);
      return `
  ${panel(width, height, t, x, 24, tileWidth, 102)}
  <text class="label" x="${x + 16}" y="52">${tile.label}</text>
  <text class="value" x="${x + 16}" y="98">${tile.value}</text>
  ${tile.sub ? `<text class="muted" x="${x + tileWidth - 16}" y="98" text-anchor="end">${tile.sub}</text>` : ''}`;
    })
    .join('');

  return svg(width, height, t, body);
}

export function renderLanguages({ metrics }, t) {
  const width = 1000;
  const height = 170;
  const barX = 24;
  const barWidth = width - 48;
  let offset = 0;

  const segments = metrics.languages
    .map((lang) => {
      const w = (lang.pct / 100) * barWidth;
      const segment = `<rect x="${(barX + offset).toFixed(2)}" y="56" width="${w.toFixed(2)}" height="14" fill="${lang.color ?? t.muted}"/>`;
      offset += w;
      return segment;
    })
    .join('');

  const legend = metrics.languages
    .map((lang, i) => {
      const x = barX + (i % 3) * 320;
      const y = 102 + Math.floor(i / 3) * 28;
      return `
  <circle cx="${x + 6}" cy="${y - 4}" r="6" fill="${lang.color ?? t.muted}"/>
  <text x="${x + 20}" y="${y}" font-size="14">${esc(lang.name)}</text>
  <text class="muted" x="${x + 300}" y="${y}" text-anchor="end">${lang.pct.toFixed(1)}%</text>`;
    })
    .join('');

  return svg(width, height, t, `
  ${panel(width, height, t)}
  <text class="title" x="${barX}" y="36">Lenguajes más usados</text>
  <clipPath id="bar"><rect x="${barX}" y="56" width="${barWidth}" height="14" rx="7"/></clipPath>
  <g clip-path="url(#bar)">${segments}</g>
  ${legend}
  `);
}
