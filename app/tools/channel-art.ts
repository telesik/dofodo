// Оформление канала YouTube: шапка 2048×1152 с безопасной зоной 1235×338
// (её видно на всех устройствах, остальное обрезается) и квадратный аватар.
// Графика своя: логотип игры из src/ui/logo.ts и то же сукно, что в ролике.
//
// Запуск: npx vite-node tools/channel-art.ts -- [--out DIR]

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { logoSvg } from '../src/ui/logo';

const args = process.argv.slice(2);
const i = args.indexOf('--out');
const outDir = resolve(__dirname, '..', i >= 0 && args[i + 1] ? args[i + 1] : 'local/channel');
mkdirSync(outDir, { recursive: true });

const W = 2048;
const H = 1152;
const SAFE_W = 1235;
const SAFE_H = 338;

const felt = `
  <radialGradient id="g-felt" cx="0.5" cy="0.4" r="0.8">
    <stop offset="0" stop-color="#20312a"/>
    <stop offset="0.78" stop-color="#131d18"/>
    <stop offset="1" stop-color="#0f1713"/>
  </radialGradient>`;

const font = 'system-ui, -apple-system, Helvetica, sans-serif';

// Безопасная зона: логотип слева, название и строка-пояснение справа от него.
const logoH = 190;
const logoW = (logoH * 69.5) / 96;
const gap = 54;
const title = 150;
const sub = 46;
const blockW = logoW + gap + 760;
const x0 = (W - blockW) / 2;
const midY = H / 2;

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${felt}</defs>
  <rect width="${W}" height="${H}" fill="url(#g-felt)"/>
  <g transform="translate(${x0.toFixed(0)} ${(midY - logoH / 2).toFixed(0)})">${logoSvg(logoH)}</g>
  <text x="${(x0 + logoW + gap).toFixed(0)}" y="${(midY - 6).toFixed(0)}" font-family="${font}"
    font-size="${title}" font-weight="500" fill="#c9a86a" letter-spacing="4">Dofodo</text>
  <text x="${(x0 + logoW + gap + 6).toFixed(0)}" y="${(midY + 66).toFixed(0)}" font-family="${font}"
    font-size="${sub}" fill="#e8e3d8" opacity="0.8">Dominoes with new rules · a game for two</text>
</svg>
`;

// Аватар: логотип на сукне, квадрат 800×800 (рекомендация YouTube).
const A = 800;
const avaLogoH = 520;
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="${A}" height="${A}" viewBox="0 0 ${A} ${A}">
  <defs>${felt}</defs>
  <rect width="${A}" height="${A}" fill="url(#g-felt)"/>
  <g transform="translate(${((A - (avaLogoH * 69.5) / 96) / 2).toFixed(0)} ${((A - avaLogoH) / 2).toFixed(0)})">${logoSvg(avaLogoH)}</g>
</svg>
`;

writeFileSync(resolve(outDir, 'channel-banner.svg'), banner);
writeFileSync(resolve(outDir, 'channel-avatar.svg'), avatar);
console.log(`Шапка ${W}×${H} (безопасная зона ${SAFE_W}×${SAFE_H}) и аватар ${A}×${A} → ${outDir}`);
