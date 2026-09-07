// «Как играть» — шесть коротких слайдов с картинками на графике движка
// (идея 0032 штаба): корень, кость, дубль, открытые руки, конец партии
// и очки, особая цена 0:0. Нюансы правил сюда не входят — последний слайд ведёт на полный
// текст. Оверлей самостоятельный: своя разметка, свой обработчик, ничего
// в состоянии игры не трогает. Тексты — словарь ядра, картинки — SVG
// движка (без сторонних ресурсов).
import { L } from './i18n';
import { CELL, TILE_L, TILE_W, tileBack, tileDefs, tileFace } from './tile-svg';

export interface HowtoSlide {
  title: string;
  text: string;
  sub: string;
  /** Готовый <svg> сцены. */
  scene: string;
}

const ROOT_ID = 'howto';
const H = CELL;

function tile(
  a: number,
  b: number,
  x: number,
  y: number,
  o: { vertical?: boolean; accent?: boolean; scale?: number } = {},
): string {
  const rot = o.vertical ? ' rotate(90)' : '';
  const sc = o.scale ? ` scale(${o.scale})` : '';
  return `<g transform="translate(${x} ${y})${rot}${sc}">${tileFace(a, b, { accent: o.accent, shadow: 'tile' })}</g>`;
}
function back(x: number, y: number, scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${tileBack({ shadow: 'tile' })}</g>`;
}
function endMark(x: number, y: number, n: number): string {
  return `<g><circle cx="${x}" cy="${y}" r="15" fill="#151d19" stroke="#c9a86a" stroke-width="2"/>
    <text x="${x}" y="${y + 6}" text-anchor="middle" font-size="17" font-family="Georgia,serif" fill="#c9a86a">${n}</text></g>`;
}
function closedMark(x: number, y: number): string {
  return `<g stroke="#c2543a" stroke-width="3" stroke-linecap="round"><line x1="${x - 9}" y1="${y - 9}" x2="${x + 9}" y2="${y + 9}"/><line x1="${x + 9}" y1="${y - 9}" x2="${x - 9}" y2="${y + 9}"/></g>`;
}
function arrow(x1: number, y1: number, x2: number, y2: number): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9a86a" stroke-width="2" marker-end="url(#howto-arr)" opacity=".85"/>`;
}
function label(x: number, y: number, t: string, o: { anchor?: string; dim?: boolean } = {}): string {
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? 'middle'}" font-size="13" fill="${o.dim ? '#97a099' : '#e6ded0'}">${esc(t)}</text>`;
}
const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

function scene(w: number, h: number, inner: string): string {
  const defs = `<defs>${tileDefs().replace(/<\/?defs>/g, '')}<marker id="howto-arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#c9a86a"/></marker></defs>`;
  return `<svg class="howto-svg" viewBox="0 0 ${w} ${h}" width="100%" role="img">${defs}${inner}</svg>`;
}

/** Шесть слайдов на текущем языке. */
export function howtoSlides(): HowtoSlide[] {
  const t = L();
  const x0 = 60;
  const rowY = 60;
  const s1 = scene(
    380,
    170,
    `${tile(4, 4, 190, 78, { accent: true })}
     ${closedMark(112, 78)} ${label(112, 116, t.howtoDeadEnd, { dim: true })}
     ${arrow(246, 78, 296, 78)} ${endMark(318, 78, 4)}
     ${label(318, 116, t.howtoOpenEnd, { dim: true })}`,
  );
  const s2 = scene(
    380,
    352,
    `${label(12, 22, t.howtoStraight, { anchor: 'start' })}
     ${tile(4, 3, x0 + TILE_L / 2, rowY)} ${tile(3, 5, x0 + TILE_L * 1.5 + 4, rowY)}
     ${arrow(x0 + TILE_L * 2 + 10, rowY, x0 + TILE_L * 2 + 40, rowY)} ${endMark(x0 + TILE_L * 2 + 62, rowY, 5)}
     ${label(12, 172, t.howtoTurn, { anchor: 'start' })}
     ${tile(4, 3, x0 + TILE_L / 2, 210)}
     ${tile(3, 5, x0 + TILE_L + 4 + H / 2, 210 + H / 2, { vertical: true })}
     ${arrow(x0 + TILE_L + 4 + H + 8, 210, x0 + TILE_L + 4 + H + 36, 210)} ${endMark(x0 + TILE_L + 4 + H + 58, 210, 3)}
     ${arrow(x0 + TILE_L + 4 + H / 2, 210 + H + 8, x0 + TILE_L + 4 + H / 2, 210 + H + 36)} ${endMark(x0 + TILE_L + 4 + H / 2, 210 + H + 58, 5)}`,
  );
  const s3 = scene(
    380,
    330,
    `${label(12, 22, t.howtoDblStraight, { anchor: 'start' })}
     ${tile(3, 5, x0 + TILE_L / 2, rowY)} ${tile(5, 5, x0 + TILE_L * 1.5 + 4, rowY)}
     ${arrow(x0 + TILE_L * 2 + 10, rowY, x0 + TILE_L * 2 + 40, rowY)} ${endMark(x0 + TILE_L * 2 + 62, rowY, 5)}
     ${label(12, 160, t.howtoDblAcross, { anchor: 'start' })}
     ${tile(3, 5, x0 + TILE_L / 2, 240)}
     ${tile(5, 5, x0 + TILE_L + 4 + TILE_W / 2, 240, { vertical: true })}
     ${closedMark(x0 + TILE_L + 4 + TILE_W + 28, 240)}
     ${label(x0 + TILE_L + 4 + TILE_W + 28, 280, t.howtoClosed, { dim: true })}`,
  );
  // Открытые руки: две руки лицом вверх, базар — рубашками. Соперник сверху,
  // свои кости снизу — как за столом в самой игре (замечание автора 07.09.2026).
  const sc = 0.72;
  const step = TILE_L * sc + 6;
  const hand = (vals: [number, number][], y: number): string =>
    vals.map(([a, b], i) => tile(a, b, 70 + i * step, y, { scale: sc })).join('');
  const s4 = scene(
    380,
    250,
    `${label(12, 22, t.howtoOpponent, { anchor: 'start' })}
     ${hand([[6, 2], [3, 3], [1, 5]], 56)}
     ${label(12, 122, t.howtoYou, { anchor: 'start' })}
     ${hand([[4, 0], [2, 2], [6, 5]], 156)}
     ${back(318, 92, sc)} ${back(324, 108, sc)} ${back(330, 124, sc)}
     ${label(324, 176, t.howtoBoneyard, { dim: true })}`,
  );
  // Конец партии: выход (пустая рука), рыба (закрытые концы) и очки на руках.
  const s5 = scene(
    380,
    318,
    `${label(12, 22, t.howtoOut, { anchor: 'start' })}
     <rect x="70" y="36" width="${TILE_L * sc}" height="${TILE_W * sc}" rx="6" fill="none" stroke="#97a099" stroke-dasharray="5 4"/>
     ${label(70 + (TILE_L * sc) / 2, 58, '0', { dim: true })}
     ${label(12, 108, t.howtoFish, { anchor: 'start' })}
     ${tile(2, 6, 60 + TILE_L * sc * 0.5, 138, { scale: sc })}
     ${closedMark(60 + TILE_L * sc + 24, 138)}
     ${tile(6, 6, 60 + TILE_L * sc + 24 + 18 + (TILE_W * sc) / 2, 138, { vertical: true, scale: sc })}
     ${closedMark(60 + TILE_L * sc + 24 + 18 + TILE_W * sc + 24, 138)}
     ${label(12, 208, t.howtoPoints, { anchor: 'start' })}
     ${tile(2, 3, 70 + (TILE_L * sc) / 2, 240, { scale: sc })} ${tile(4, 1, 70 + step + (TILE_L * sc) / 2, 240, { scale: sc })}
     ${label(70 + step * 2 + 10, 246, '= 10  →  +10', { anchor: 'start' })}
     ${tile(3, 5, 70 + (TILE_L * sc) / 2, 284, { scale: sc })}
     ${label(70 + step * 2 + 10, 290, '= 8  →  +0', { anchor: 'start', dim: true })}`,
  );
  // Особая цена 0:0 (§10.2): один на руке — 25, с любой другой костью — 0.
  const s6 = scene(
    380,
    190,
    `${label(12, 22, t.howtoAlone, { anchor: 'start' })}
     ${tile(0, 0, 70 + (TILE_L * sc) / 2, 58, { scale: sc })}
     ${label(70 + step + 10, 64, '= 25', { anchor: 'start' })}
     ${label(12, 118, t.howtoWithOther, { anchor: 'start' })}
     ${tile(0, 0, 70 + (TILE_L * sc) / 2, 154, { scale: sc })} ${tile(3, 4, 70 + step + (TILE_L * sc) / 2, 154, { scale: sc })}
     ${label(70 + step * 2 + 10, 160, '= 0 + 7', { anchor: 'start', dim: true })}`,
  );
  return [
    { title: t.howtoS1Title, text: t.howtoS1Text, sub: t.howtoS1Sub, scene: s1 },
    { title: t.howtoS2Title, text: t.howtoS2Text, sub: t.howtoS2Sub, scene: s2 },
    { title: t.howtoS3Title, text: t.howtoS3Text, sub: t.howtoS3Sub, scene: s3 },
    { title: t.howtoS4Title, text: t.howtoS4Text, sub: t.howtoS4Sub, scene: s4 },
    { title: t.howtoS5Title, text: t.howtoS5Text, sub: t.howtoS5Sub, scene: s5 },
    { title: t.howtoS6Title, text: t.howtoS6Text, sub: t.howtoS6Sub, scene: s6 },
  ];
}

export interface HowtoOptions {
  /** Адрес полного текста правил — ссылка на последнем слайде. */
  rulesUrl: string;
  /** Вызывается по закрытию (любому: «Понятно», «Пропустить», тап по фону). */
  onClose?: () => void;
}

/** Открыть слайды. Повторный вызов при открытом оверлее — начать с первого. */
export function openHowTo(opts: HowtoOptions): void {
  const slides = howtoSlides();
  let idx = 0;
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    document.body.appendChild(root);
  }
  const close = (): void => {
    root?.remove();
    opts.onClose?.();
  };
  const render = (): void => {
    const t = L();
    const s = slides[idx]!;
    const last = idx === slides.length - 1;
    const dots = slides
      .map((_, i) => `<span class="${i === idx ? 'on' : ''}"></span>`)
      .join('');
    root!.innerHTML = `
      <div class="card howto-card">
        <div class="howto-kicker">${esc(t.howtoKicker(idx + 1, slides.length))}</div>
        <h1>${esc(s.title)}</h1>
        <div class="howto-scene">${s.scene}</div>
        <p>${esc(s.text)}</p>
        <p class="sub">${esc(s.sub)}</p>
        ${last ? `<p class="sub"><a href="${esc(opts.rulesUrl)}" target="_blank" rel="noopener">${esc(t.howtoFullRules)}</a></p>` : ''}
        <div class="howto-foot">
          <button class="howto-ghost" data-howto="${last ? 'prev' : 'skip'}">${esc(last ? t.howtoBack : t.howtoSkip)}</button>
          <div class="howto-dots">${dots}</div>
          <button class="btn howto-next" data-howto="${last ? 'done' : 'next'}">${esc(last ? t.howtoDone : t.howtoNext)}</button>
        </div>
      </div>`;
  };
  root.onclick = (ev) => {
    const target = ev.target as HTMLElement;
    if (target === root) {
      close();
      return;
    }
    const b = target.closest<HTMLElement>('[data-howto]');
    if (!b) return;
    const act = b.dataset.howto;
    if (act === 'next') {
      idx = Math.min(idx + 1, slides.length - 1);
      render();
    } else if (act === 'prev') {
      idx = Math.max(idx - 1, 0);
      render();
    } else {
      close();
    }
  };
  render();
}
