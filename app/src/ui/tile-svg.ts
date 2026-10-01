// Отрисовка костей — общий модуль студии (подмодуль commons/,
// telesik-web-commons). Своё у Dofodo — эмблема дерева на рубашке.
import {
  TILE_W,
  tileBack as plainTileBack,
  type TileFaceOptions,
} from '../../../commons/src/tile-svg';

export * from '../../../commons/src/tile-svg';

/** Рубашка кости (горизонтальная, центр в (0,0)) — тёмный лак с эмблемой дерева. */
export function tileBack(opts: TileFaceOptions = {}): string {
  return plainTileBack({ ...opts, emblem: treeEmblem(0, 0, TILE_W * 0.34) });
}

/** Мини-эмблема дерева на рубашке: чаша, ствол, три кроны. */
export function treeEmblem(cx: number, cy: number, s: number): string {
  return `
  <g class="emblem" transform="translate(${cx} ${cy}) scale(${s / 20})" opacity="0.6">
    <path d="M -7 8 q 7 4 14 0 l -1.6 3 q -5.4 2.4 -10.8 0 z" fill="#c9a86a"/>
    <path d="M 0 8 C -1 4 -4 3 -3 -2 M 0 8 C 1 3 4 2 3 -3 M 0 8 C 0 5 -1 1 1 -5"
      fill="none" stroke="#c9a86a" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="-5" cy="-3" r="3.4" fill="#c9a86a"/>
    <circle cx="4.5" cy="-4.5" r="3" fill="#c9a86a"/>
    <circle cx="0.5" cy="-8" r="3.8" fill="#c9a86a"/>
  </g>`;
}
