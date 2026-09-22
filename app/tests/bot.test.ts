// Бот: легальность ходов, детерминизм, сила против случайной политики.

import { describe, expect, it } from 'vitest';
import {
  applyMove,
  chooseBotMove,
  legalMoves,
  moveEquals,
  newRound,
  scoreRound,
  type BotLevel,
  type GameState,
} from '../src/engine';
import { BASE, makeState, playFrom, randomPolicy } from './helpers';

/** Партия бот против случайной политики. Детерминирована по seed. */
function botVsRandom(seed: number, botIdx: 0 | 1, level: BotLevel): GameState {
  return playFrom(
    newRound({ seed, first: (seed % 2) as 0 | 1, variant: BASE }),
    seed ^ 0x5bd1e995,
    undefined,
    (state, moves, rand) =>
      state.current === botIdx ? chooseBotMove(state, { level }) : randomPolicy(state, moves, rand),
  );
}

describe('бот', () => {
  it('ходы легальны всю партию (бот против бота, разные уровни)', () => {
    for (const seed of [3, 77, 421]) {
      let state = newRound({ seed, first: 0, variant: BASE });
      let guard = 0;
      while (state.phase !== 'over') {
        if (++guard > 500) throw new Error('Партия не завершилась');
        const level: BotLevel = state.current === 0 ? 'normal' : 'easy';
        const move = chooseBotMove(state, { level });
        expect(legalMoves(state).some((m) => moveEquals(m, move))).toBe(true);
        state = applyMove(state, move);
      }
      expect(state.result).not.toBeNull();
    }
  });

  it('детерминизм: одно состояние — один и тот же ход', () => {
    const state = newRound({ seed: 20260802, first: 0, variant: BASE });
    // Прогоняем несколько позиций по ходу партии.
    let s = state;
    for (let i = 0; i < 10 && s.phase !== 'over'; i++) {
      const a = chooseBotMove(s, { level: 'normal' });
      const b = chooseBotMove(s, { level: 'normal' });
      expect(a).toEqual(b);
      s = applyMove(s, a);
    }
  });

  it('перебор не трогает RNG и историю состояния', () => {
    const state = newRound({ seed: 555, first: 0, variant: BASE });
    const rngBefore = state.rng;
    const histBefore = state.history.length;
    chooseBotMove(state, { level: 'strong' });
    expect(state.rng).toBe(rngBefore);
    expect(state.history.length).toBe(histBefore);
  });

  it('strong доходит до перебора с упорядочиванием детей и не трогает состояние', () => {
    // Основная фаза с открытыми руками: перебор глубины 5 и сортировка
    // детей по мелкой оценке при > 4 ходах. Ход легален, выбор детерминирован.
    let s = newRound({ seed: 4242, first: 0, variant: BASE });
    for (let i = 0; i < 6 && s.phase !== 'over'; i++) s = applyMove(s, legalMoves(s)[0]!);
    expect(s.phase).toBe('main');
    const snapshot = JSON.stringify(s);
    const a = chooseBotMove(s, { level: 'strong' });
    expect(legalMoves(s).some((m) => moveEquals(m, a))).toBe(true);
    expect(chooseBotMove(s, { level: 'strong' })).toEqual(a);
    expect(JSON.stringify(s)).toBe(snapshot);
  });

  it('уровень по умолчанию — normal; единственный ход возвращается без перебора', () => {
    const s = newRound({ seed: 20260802, first: 0, variant: BASE });
    expect(chooseBotMove(s)).toEqual(chooseBotMove(s, { level: 'normal' }));
    // Свежий конец (§6.4) — только прямо: единственный ход возвращается как есть.
    const one = makeState({ hands: [['6-4'], ['3-2']], ends: [{ value: 4, fresh: true }] });
    expect(legalMoves(one).length).toBe(1);
    expect(chooseBotMove(one)).toEqual(legalMoves(one)[0]);
  });

  it('решающая партия матча (§10.5): терминал с тоталами у цели считается без ошибок', () => {
    // Ходит бот (0) последней костью: 4-1 на конец 4 прямо или поворотом —
    // оба хода выход, сопернику +24. Тоталы у цели заводят все три ветки
    // терминала: матч закрывает соперник (WIN боту), сам бот (−WIN) и
    // равные тоталы (ни то, ни другое).
    const s = makeState({
      hands: [['4-1'], ['2-2', '5-3', '6-6']],
      ends: [{ value: 4 }, { value: 6 }],
    });
    expect(legalMoves(s).length).toBe(2);
    for (const totals of [
      [0, 96],
      [100, 0],
      [100, 76],
    ] as const) {
      const m = chooseBotMove(s, { level: 'normal', totals });
      expect(m).toMatchObject({ type: 'place', tile: '4-1' });
      expect(legalMoves(s).some((x) => moveEquals(x, m))).toBe(true);
    }
  });

  it('normal заметно сильнее случайной политики', () => {
    // 24 партии с фиксированными сидами, бот попеременно за обе стороны.
    let botPts = 0;
    let rndPts = 0;
    let botWins = 0;
    let games = 0;
    for (let i = 0; i < 24; i++) {
      const seed = i * 7919 + 101;
      const botIdx = (i % 2) as 0 | 1;
      const final = botVsRandom(seed, botIdx, 'normal');
      const result = final.result!;
      expect(result).toEqual(scoreRound(final.hands, result.cause));
      botPts += result.added[botIdx]!;
      rndPts += result.added[(1 - botIdx) as 0 | 1]!;
      if (result.winner === botIdx) botWins++;
      games++;
    }
    // Очки — штраф (§10.3): бот должен набирать существенно меньше случайного.
    // Пороги с запасом: при деградации силы тест обязан упасть.
    expect(botWins / games).toBeGreaterThan(0.6);
    expect(botPts).toBeLessThan(rndPts * 0.6);
  });
});
