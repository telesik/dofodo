// Звуки игры — общий модуль студии с записями (подмодуль commons/,
// telesik-web-commons). Своё у Dofodo — какой стук у какого хода.
import { playPlace as playPlaceSound, type PlaceSound } from '../../../commons/src/sound';

export { isSoundEnabled, playDraw, playShuffle, setSoundEnabled } from '../../../commons/src/sound';

const PLACE_SOUND: Record<'root' | 'straight' | 'turn' | 'cross', PlaceSound> = {
  root: 'accent', // корень ставится торжественно: двойной стук
  straight: 'normal',
  turn: 'normal',
  cross: 'heavy', // поперёк — жёстче и ниже
};

/** Выставление кости: прямо/поворот — обычный стук, поперёк — жёстче и ниже. */
export function playPlace(kind: 'root' | 'straight' | 'turn' | 'cross'): void {
  playPlaceSound(PLACE_SOUND[kind]);
}
