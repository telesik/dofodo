// Подписи корня (§5): без дубля — тянуть из базара, вытянутый дубль обязан
// лечь. В UI-тестах раунд всегда начинался с дубля на руке, так что эти
// подсказки статуса и обучения не проверялись (подсчёт ветвей vitest 4,
// telesik-team#854).
import { describe, expect, it } from 'vitest';
import { legalMoves, type GameState } from '../src/engine';
import { createDofodoGame } from '../src/ui/game';
import { L } from '../src/ui/i18n';
import { makeState } from './helpers';

const root = (over: Partial<GameState>): GameState => ({
  ...makeState({ hands: [['4-5', '2-3'], ['1-1']], boneyard: ['6-6'] }),
  phase: 'root',
  ends: [],
  placed: [],
  occupied: [],
  ...over,
});

describe('корень: приглашение к ходу и подсказка обучения', () => {
  const { view } = createDofodoGame();
  const ctx = (s: GameState) => ({ legal: legalMoves(s), selected: null, nameHtml: '<b>Аня</b>' });

  it('дубля на руке нет — тянуть из базара', () => {
    const s = root({});
    expect(view.prompt(s, ctx(s))).toBe(L().promptRootNoDouble('<b>Аня</b>'));
    expect(view.tutor!(s, ctx(s))).toBe(L().tutorRootNoDouble);
  });

  it('вытянутый дубль обязан лечь корнем', () => {
    const s = root({ hands: [['4-5', '6-6'], ['1-1']], boneyard: [], mustPlay: '6-6' });
    expect(view.prompt(s, ctx(s))).toBe(L().promptRootDrawn('<b>Аня</b>', '6:6'));
    expect(view.tutor!(s, ctx(s))).toBe(L().tutorRootMustPlay);
  });
});
