// Кадры «живой» партии для GIF и короткого видео (тикет 0037).
//
// Путь 3 из тикета: не запись экрана, а синтез кадров движком — партия
// детерминирована сидом, кадры воспроизводимы побайтово, размер любой.
// Каждый кадр — SVG стола после очередной выложенной кости; растеризация и
// сборка — tools/svg-png.swift и tools/make-gif.sh.
//
// Запуск: npx vite-node tools/gif-frames.ts -- [--out DIR] [--seed N] [--scan N]

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  applyMove,
  chooseBotMove,
  newRound,
  scoreRound,
  type GameState,
  type RoundResult,
  type Vec,
} from '../src/engine';
import { CELL, TILE_L, TILE_W, TILE_R, tileDefs, tileFace } from '../src/ui/tile-svg';

const args = process.argv.slice(2);
const flag = (name: string, def: string): string => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
// По умолчанию — local/ (каталог для рабочих файлов, в git не попадает).
const outDir = resolve(__dirname, '..', flag('out', process.env.DOFODO_OUT ?? 'local/gif'));
const scanTo = Number(flag('scan', '400'));
const fixedSeed = args.includes('--seed') ? Number(flag('seed', '0')) : null;
const names: [string, string] = [flag('p1', 'Alex'), flag('p2', 'Olya')];

const VARIANT = { doubleOnlyCloses: false };
/** Сторона кадра в пикселях (квадрат). Камера живёт в viewBox, холст не меняется. */
const FRAME_PX = 900;

// Та же формула, что в board.ts (tileTransform без зеркала); копия, а не
// импорт: board.ts тянет за собой DOM и i18n — в ноде это лишнее.
function tileTr(a: Vec, b: Vec): string {
  const cx = ((a.x + b.x) / 2) * CELL;
  const cy = ((a.y + b.y) / 2) * CELL;
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${angle.toFixed(1)})`;
}

interface Round {
  readonly seed: number;
  readonly states: GameState[]; // состояние после каждой выложенной кости
  readonly result: RoundResult;
}

/** Партия двух ботов по сиду; снимок состояния после каждой выложенной кости. */
function playRound(seed: number): Round {
  let state = newRound({ seed: seed >>> 0, first: seed % 2 === 0 ? 0 : 1, variant: VARIANT });
  const states: GameState[] = [];
  let placed = 0;
  let guard = 0;
  while (state.phase !== 'over') {
    if (++guard > 500) throw new Error('Партия не закончилась');
    state = applyMove(state, chooseBotMove(state, { level: 'normal' }));
    if (state.placed.length > placed) {
      placed = state.placed.length;
      states.push(state);
    }
  }
  return { seed, states, result: scoreRound(state.hands, 'out') };
}

/** Фотогеничность: короткая партия, но с поворотами и закрытием ветки. */
function beauty(r: Round): number {
  const last = r.states[r.states.length - 1];
  const turns = last.placed.filter((p) => p.kind === 'turn').length;
  const crosses = last.placed.filter((p) => p.kind === 'cross').length;
  const n = last.placed.length;
  return (
    Math.min(turns, 3) * 3 +
    Math.min(crosses, 2) * 3 +
    (n >= 10 && n <= 14 ? 6 : 0) -
    Math.abs(12 - n) * 1.5 -
    (last.placed.some((p) => p.overlap) ? 4 : 0)
  );
}

function pickRound(): Round {
  if (fixedSeed !== null) return playRound(fixedSeed);
  let best: Round | null = null;
  let bestScore = -Infinity;
  for (let seed = 1; seed <= scanTo; seed++) {
    const r = playRound(seed);
    const s = beauty(r);
    if (s > bestScore) {
      bestScore = s;
      best = r;
    }
  }
  if (!best) throw new Error('Кандидат не найден');
  return best;
}

/**
 * Кадр по текущей раскладке: квадрат вокруг выложенных костей, снизу — полоса
 * под панель итога. Камера едет за деревом, как автоподгонка в самой игре.
 */
interface Cam {
  x0: number;
  y0: number;
  side: number;
}

function target(state: GameState): Cam {
  const pad = CELL * 0.9;
  const box = state.placed.map((p) => {
    const cx = ((p.cells[0].x + p.cells[1].x) / 2) * CELL;
    const cy = ((p.cells[0].y + p.cells[1].y) / 2) * CELL;
    const horiz = Math.abs(p.cells[1].x - p.cells[0].x) > Math.abs(p.cells[1].y - p.cells[0].y);
    const hx = (horiz ? TILE_L : TILE_W) / 2;
    const hy = (horiz ? TILE_W : TILE_L) / 2;
    return { x0: cx - hx, x1: cx + hx, y0: cy - hy, y1: cy + hy };
  });
  const minX = Math.min(...box.map((b) => b.x0)) - pad;
  const maxX = Math.max(...box.map((b) => b.x1)) + pad;
  const minY = Math.min(...box.map((b) => b.y0)) - pad;
  const rawMaxY = Math.max(...box.map((b) => b.y1)) + pad;
  const reserve = Math.max(maxX - minX, rawMaxY - minY) * 0.2;
  const maxY = rawMaxY + reserve;
  // Минимум кадра: на первой кости камера не должна упираться в неё вплотную.
  const side = Math.max(maxX - minX, maxY - minY, CELL * 7);
  return {
    x0: minX - (side - (maxX - minX)) / 2,
    y0: minY - (side - (maxY - minY)) / 2,
    side,
  };
}

/**
 * Экспоненциальное сглаживание: камера догоняет цель, а не прыгает на неё.
 * Подъехав вплотную, встаёт ровно на цель: неподвижные кадры GIF ужимает
 * в разы лучше, чем вечно ползущие на доли пикселя.
 */
function follow(cam: Cam, to: Cam, k: number): Cam {
  const next = {
    x0: cam.x0 + (to.x0 - cam.x0) * k,
    y0: cam.y0 + (to.y0 - cam.y0) * k,
    side: cam.side + (to.side - cam.side) * k,
  };
  const far =
    Math.abs(next.x0 - to.x0) + Math.abs(next.y0 - to.y0) + Math.abs(next.side - to.side);
  return far < to.side * 0.004 ? { ...to } : next;
}

/** Панель итога: имена и очки партии (§10.3) — язык не нужен, только цифры. */
function scorePanel(cam: Cam, res: RoundResult): string {
  const w = cam.side * 0.62;
  const h = cam.side * 0.15;
  const x = cam.x0 + (cam.side - w) / 2;
  const y = cam.y0 + cam.side - h - cam.side * 0.045;
  const fs = h * 0.34;
  const win = res.winner;
  const mark = (i: 0 | 1): string => (win === i ? '#c9a86a' : '#8a9a92');
  return `
  <g class="panel">
    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"
      rx="${(h * 0.22).toFixed(1)}" fill="#0b100e" opacity="0.82"/>
    <text x="${(x + w * 0.06).toFixed(1)}" y="${(y + h * 0.62).toFixed(1)}" font-size="${fs.toFixed(1)}"
      fill="${mark(0)}" font-family="system-ui, -apple-system, Helvetica, sans-serif">${names[0]}</text>
    <text x="${(x + w / 2).toFixed(1)}" y="${(y + h * 0.66).toFixed(1)}" font-size="${(fs * 1.25).toFixed(1)}"
      text-anchor="middle" fill="#e8e3d8"
      font-family="system-ui, -apple-system, Helvetica, sans-serif">${res.added[0]} : ${res.added[1]}</text>
    <text x="${(x + w * 0.94).toFixed(1)}" y="${(y + h * 0.62).toFixed(1)}" font-size="${fs.toFixed(1)}"
      text-anchor="end" fill="${mark(1)}"
      font-family="system-ui, -apple-system, Helvetica, sans-serif">${names[1]}</text>
  </g>`;
}

function frameSvg(
  state: GameState,
  cam: Cam,
  opts: { highlight: number; result?: RoundResult; panel?: number },
): string {
  const lastSeq = state.placed.length - 1;
  const tiles = state.placed
    .map((p) => {
      const face = tileFace(p.values[0], p.values[1], { accent: p.kind === 'root' });
      const ring =
        opts.highlight > 0.01 && p.seq === lastSeq
          ? `<rect x="${(-TILE_L / 2 - 3).toFixed(1)}" y="${(-TILE_W / 2 - 3).toFixed(1)}"
               width="${(TILE_L + 6).toFixed(1)}" height="${(TILE_W + 6).toFixed(1)}"
               rx="${(TILE_R + 3).toFixed(1)}" fill="none" stroke="#c9a86a" stroke-width="2.6"
               opacity="${opts.highlight.toFixed(2)}"/>`
          : '';
      return `<g transform="${tileTr(p.cells[0], p.cells[1])}">${face}${ring}</g>`;
    })
    .join('\n');
  const { x0, y0, side } = cam;
  // Пиксельный размер холста постоянный, движется только viewBox: кадры разного
  // размера ffmpeg не склеивает (на смене разрешения ролик обрывается).
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FRAME_PX}" height="${FRAME_PX}"
  viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}">
  <defs>
    ${tileDefs()}
    <radialGradient id="g-felt" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#20312a"/>
      <stop offset="0.78" stop-color="#131d18"/>
      <stop offset="1" stop-color="#101814"/>
    </radialGradient>
  </defs>
  <style>.pip { fill: #322d24; }</style>
  <rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${side.toFixed(1)}" height="${side.toFixed(1)}"
    fill="url(#g-felt)"/>
  ${tiles}
  ${opts.result ? `<g opacity="${(opts.panel ?? 1).toFixed(2)}">${scorePanel(cam, opts.result)}</g>` : ''}
</svg>
`;
}

const round = pickRound();
const final = round.states[round.states.length - 1];
mkdirSync(outDir, { recursive: true });

// Постоянный fps: кадры равной длительности — так проще и ffmpeg, и просмотр.
const FPS = 12;
const HOLD_ROOT = 10; // кадров на корень (≈0,8 с)
const PER_MOVE = 6; // кадров на ход (0,5 с)
const SETTLE = 10; // камера доезжает после последнего хода
const PANEL_IN = 3; // проявление панели итога
const PANEL_HOLD = 22; // панель на экране (≈1,8 с)

let cam = target(round.states[0]);
let n = 0;
const emit = (state: GameState, opts: { highlight: number; result?: RoundResult; panel?: number }): void => {
  writeFileSync(resolve(outDir, `frame-${String(n).padStart(4, '0')}.svg`), frameSvg(state, cam, opts));
  n += 1;
};

round.states.forEach((state, i) => {
  const to = target(state);
  const frames = i === 0 ? HOLD_ROOT : PER_MOVE;
  for (let f = 0; f < frames; f++) {
    cam = follow(cam, to, 0.32);
    // Подсветка новой кости гаснет к концу хода.
    emit(state, { highlight: i === 0 ? 0 : 1 - f / frames });
  }
});
for (let f = 0; f < SETTLE; f++) {
  cam = follow(cam, target(final), 0.32);
  emit(final, { highlight: 0 });
}
for (let f = 0; f < PANEL_IN; f++) emit(final, { highlight: 0, result: round.result, panel: (f + 1) / PANEL_IN });
for (let f = 0; f < PANEL_HOLD; f++) emit(final, { highlight: 0, result: round.result });

writeFileSync(
  resolve(outDir, 'meta.json'),
  JSON.stringify({ fps: FPS, frames: n, seed: round.seed, px: FRAME_PX }, null, 2),
);

const turns = final.placed.filter((p) => p.kind === 'turn').length;
const crosses = final.placed.filter((p) => p.kind === 'cross').length;
console.log(
  `seed=${round.seed} костей=${final.placed.length} поворотов=${turns} закрытий=${crosses} ` +
    `итог=${round.result.added[0]}:${round.result.added[1]} (победа ${round.result.winner === null ? 'ничья' : names[round.result.winner]})`,
);
console.log(`Кадров: ${n} при ${FPS} fps (${(n / FPS).toFixed(1)} с) → ${outDir}`);
