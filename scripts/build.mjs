import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchProfile } from './lib/github.mjs';
import { computeMetrics } from './lib/metrics.mjs';
import { THEMES, renderAbout, renderBanner, renderLanguages, renderStats } from './lib/cards.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'assets');

const CARDS = {
  banner: { render: renderBanner, alt: 'Banner de perfil' },
  stats: { render: renderStats, alt: 'Métricas de GitHub' },
  languages: { render: renderLanguages, alt: 'Lenguajes más usados' },
  about: { render: renderAbout, alt: 'Sobre mí' },
};

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!token) {
  throw new Error('Falta GITHUB_TOKEN. En local: GITHUB_TOKEN=$(gh auth token) npm run build');
}

const config = JSON.parse(await readFile(path.join(root, 'profile.config.json'), 'utf8'));
const user = await fetchProfile(config.login, token);
const metrics = computeMetrics(user, config);
const data = { config, metrics };

await mkdir(assetsDir, { recursive: true });
for (const [name, { render }] of Object.entries(CARDS)) {
  for (const [themeName, theme] of Object.entries(THEMES)) {
    await writeFile(path.join(assetsDir, `${name}-${themeName}.svg`), render(data, theme));
  }
}

const picture = (name) => `<picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg">
    <img alt="${CARDS[name].alt}" src="assets/${name}-light.svg">
  </picture>`;

const values = {
  ...config,
  age: metrics.age,
  daysCoding: metrics.daysCoding,
  updatedAt: metrics.updatedAt,
};

const template = await readFile(path.join(root, 'README.template.md'), 'utf8');
const readme = template
  .replace(/\{\{picture:(\w+)\}\}/g, (_, name) => {
    if (!CARDS[name]) throw new Error(`Tarjeta desconocida en la plantilla: ${name}`);
    return picture(name);
  })
  .replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Variable sin valor en la plantilla: ${key}`);
    return String(values[key]);
  });

await writeFile(path.join(root, 'README.md'), readme);
console.log(`Listo: ${Object.keys(CARDS).length} tarjetas en ${Object.keys(THEMES).length} temas + README (${metrics.updatedAt}).`);
