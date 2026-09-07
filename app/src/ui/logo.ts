/**
 * Логотип игры — фигура с иконки приложения: выкладка из правил (сверху
 * дубль-шесть, вниз ствол 6:1, поперёк 1:4 и 4:4, вниз корнем дубль-один)
 * и шахматная пешка в правом верхнем углу — руки открыты, как за доской.
 * Геометрия повторяет генератор иконки мобильной сборки (координаты 100×100),
 * рисуется чистым SVG без внешних ресурсов: маленький значок перед именем
 * игры в шапке стола, на стартовой карточке и в лобби (решение автора
 * 07.09.2026).
 */

const BONE = '#efe9db';
const INK = '#1a2320';

interface LogoTile {
  x: number;
  y: number;
  w: number;
  h: number;
  a: number;
  b: number;
}

const TILES: LogoTile[] = [
  { x: 22, y: 2, w: 30, h: 15, a: 6, b: 6 }, // Небо
  { x: 29.5, y: 19, w: 15, h: 30, a: 6, b: 1 }, // ствол
  { x: 29.5, y: 51, w: 30, h: 15, a: 1, b: 4 }, // поворот
  { x: 61.5, y: 51, w: 30, h: 15, a: 4, b: 4 }, // ветка вправо
  { x: 29.5, y: 68, w: 15, h: 30, a: 1, b: 1 }, // Земля, корень
];

function pips(n: number, cx: number, cy: number, half: number): [number, number][] {
  const d = half * 0.22;
  if (n === 1) return [[cx, cy]];
  if (n === 4)
    return [
      [cx - d, cy - d],
      [cx + d, cy - d],
      [cx - d, cy + d],
      [cx + d, cy + d],
    ];
  const dy = d * 1.35;
  return [
    [cx - d, cy - dy],
    [cx + d, cy - dy],
    [cx - d, cy],
    [cx + d, cy],
    [cx - d, cy + dy],
    [cx + d, cy + dy],
  ];
}

function tileMarkup(t: LogoTile): string {
  const horizontal = t.w > t.h;
  const half = Math.min(t.w, t.h);
  const midX = t.x + t.w / 2;
  const midY = t.y + t.h / 2;
  const divider = horizontal
    ? `M${midX} ${t.y + 2.5} L${midX} ${t.y + t.h - 2.5}`
    : `M${t.x + 2} ${midY} L${t.x + t.w - 2} ${midY}`;
  const centers: [number, number, number][] = horizontal
    ? [
        [t.a, t.x + t.w / 4, midY],
        [t.b, t.x + t.w - t.w / 4, midY],
      ]
    : [
        [t.a, midX, t.y + t.h / 4],
        [t.b, midX, t.y + t.h - t.h / 4],
      ];
  const dots = centers
    .map(([n, cx, cy]) => {
      const r = n === 1 ? half * 0.135 : n === 4 ? half * 0.108 : half * 0.094;
      return pips(n, cx, cy, half)
        .map(([px, py]) => `<circle cx="${px}" cy="${py}" r="${r}"/>`)
        .join('');
    })
    .join('');
  return `<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="2.6" fill="${BONE}"/>
<path d="${divider}" stroke="${INK}" stroke-width="1.7" stroke-linecap="round"/>
<g fill="${INK}">${dots}</g>`;
}

/** Пешка: нарисована в своих 100×100, уменьшена 0.444 и сдвинута в угол. */
function pawnMarkup(): string {
  const body =
    'M42 35 L58 35 L57 39 L43 39 Z ' +
    'M45 40 L55 40 C55 52 60 59 62 67 L38 67 C40 59 45 52 45 40 Z ' +
    'M31 67 L69 67 L72 75 L28 75 Z ' +
    'M27 75 L73 75 L77 84 L23 84 Z';
  return `<g transform="translate(51.8 6.3) scale(0.444)">
<ellipse cx="50" cy="47.5" rx="24" ry="5" fill="${INK}" opacity="0.35"/>
<circle cx="50" cy="24" r="10" fill="${BONE}"/>
<path d="${body}" fill="${BONE}"/>
</g>`;
}

/**
 * Разметка логотипа как inline-SVG заданной высоты в px (ширина — по
 * пропорции фигуры 69.5×96). Класс `logo` плюс необязательный свой.
 */
export function logoSvg(heightPx: number, extraClass = ''): string {
  const w = (heightPx * 69.5) / 96;
  return `<svg class="logo ${extraClass}" width="${w.toFixed(1)}" height="${heightPx}" viewBox="22 2 69.5 96" aria-hidden="true" focusable="false">
${TILES.map(tileMarkup).join('\n')}
${pawnMarkup()}
</svg>`;
}
