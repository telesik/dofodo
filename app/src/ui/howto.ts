// «Как играть» — шесть коротких слайдов с картинками на графике движка
// (идея 0032 штаба): корень, кость, дубль, открытые руки, конец партии
// и очки, особая цена 0:0. Нюансы правил сюда не входят — последний слайд ведёт на полный
// текст. Оверлей самостоятельный: своя разметка, свой обработчик, ничего
// в состоянии игры не трогает. Тексты — словарь ядра, картинки — SVG
// движка (без сторонних ресурсов). Сам оверлей и кирпичики сцен — общий
// модуль студии (подмодуль commons/, telesik-web-commons); здесь — слайды.
import {
  openHowTo as openHowToFrame,
  openHowToAsk as openHowToAskFrame,
  scene,
  sceneArrow as arrow,
  sceneBack,
  sceneClosedMark as closedMark,
  sceneEndMark as endMark,
  sceneLabel as label,
  sceneTile as tile,
  type HowtoSlide,
} from '../../../commons/src/howto';
import { L } from './i18n';
import { CELL, TILE_L, TILE_W, treeEmblem } from './tile-svg';
import { logoSvg } from './logo';

export type { HowtoSlide };

const H = CELL;

/** Рубашка с эмблемой дерева — кость базара на слайдах. */
function back(x: number, y: number, scale = 1): string {
  return sceneBack(x, y, { scale, emblem: treeEmblem(0, 0, TILE_W * 0.34) });
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
  const t = L();
  openHowToFrame({
    slides: howtoSlides(),
    texts: {
      close: t.howtoClose,
      kicker: t.howtoKicker,
      fullRules: t.howtoFullRules,
      back: t.howtoBack,
      skip: t.howtoSkip,
      next: t.howtoNext,
      done: t.howtoDone,
    },
    rulesUrl: opts.rulesUrl,
    onClose: opts.onClose,
  });
}

export interface HowtoAskOptions {
  /** Игрок хочет посмотреть слайды. */
  onShow: () => void;
  /** «Позже» или тап по фону — вопрос больше не задаём. */
  onLater: () => void;
}

/**
 * Вопрос при первом запуске после установки (идея 0038 штаба, уточнение
 * автора 07.09.2026): не открывать слайды сразу, а показать поверх стартовой
 * карточки короткий вопрос «Показать, как играть?». Любой ответ закрывает
 * окно; слайды — только по «Показать».
 */
export function openHowToAsk(opts: HowtoAskOptions): void {
  const t = L();
  openHowToAskFrame({
    logo: logoSvg(64, 'ask-logo'),
    texts: { ask: t.howtoAsk, later: t.howtoAskLater, yes: t.howtoAskYes },
    onShow: opts.onShow,
    onLater: opts.onLater,
  });
}
