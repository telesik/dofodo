// Dofodo по контракту общего кода (GameEngine): вариант правил в каноне,
// политика матча, раздача и бот — те же, что у прямых функций движка.
import { describe, expect, it } from 'vitest';
import { chooseBotMove, dofodoEngine, legalMoves, newRound, type Variant } from '../src/engine';

const BASE: Variant = { doubleOnlyCloses: false };

describe('dofodoEngine', () => {
  it('имя игры, исторический формат протокола, редакция правил', () => {
    expect(dofodoEngine.id).toBe('dofodo');
    expect(dofodoEngine.protocolFormat).toBe('bonesai-protocol');
    expect(dofodoEngine.rulesVersion).toBe('1.1');
    expect(dofodoEngine.defaultVariant).toEqual(BASE);
  });

  it('канон варианта: цель 100 не пишется, другая — пишется', () => {
    expect(dofodoEngine.canonVariant({ doubleOnlyCloses: true, target: 100 })).toEqual({ doubleOnlyCloses: true });
    expect(dofodoEngine.canonVariant({ doubleOnlyCloses: false, target: 150 })).toEqual({
      doubleOnlyCloses: false,
      target: 150,
    });
    expect(dofodoEngine.canonVariant(BASE)).toEqual(BASE);
  });

  it('варианты равны по смыслу: отсутствие цели — те же 100', () => {
    expect(dofodoEngine.sameVariant(BASE, { doubleOnlyCloses: false, target: 100 })).toBe(true);
    expect(dofodoEngine.sameVariant(BASE, { doubleOnlyCloses: false, target: 150 })).toBe(false);
    expect(dofodoEngine.sameVariant(BASE, { doubleOnlyCloses: true })).toBe(false);
  });

  it('раздача не зависит от номера партии', () => {
    const direct = newRound({ seed: 7, first: 1, variant: BASE });
    expect(dofodoEngine.newRound({ seed: 7, first: 1, index: 0, variant: BASE })).toEqual(direct);
    expect(dofodoEngine.newRound({ seed: 7, first: 1, index: 5, variant: BASE })).toEqual(direct);
  });

  it('исход матча: до цели — нет; набравший цель проигрывает; поровну — ничья', () => {
    expect(dofodoEngine.matchOutcome([99, 40], 3, BASE)).toBeNull();
    expect(dofodoEngine.matchOutcome([100, 40], 3, BASE)).toEqual({ kind: 'loss', loser: 0 });
    expect(dofodoEngine.matchOutcome([40, 120], 3, BASE)).toEqual({ kind: 'loss', loser: 1 });
    expect(dofodoEngine.matchOutcome([110, 110], 3, BASE)).toEqual({ kind: 'draw' });
    expect(dofodoEngine.matchOutcome([60, 40], 3, { doubleOnlyCloses: false, target: 50 })).toEqual({
      kind: 'loss',
      loser: 0,
    });
  });

  it('первый ход следующей партии: победитель, при ничьей — смена', () => {
    expect(dofodoEngine.nextFirst({ first: 0, winner: 1 })).toBe(1);
    expect(dofodoEngine.nextFirst({ first: 0, winner: 0 })).toBe(0);
    expect(dofodoEngine.nextFirst({ first: 0, winner: null })).toBe(1);
    expect(dofodoEngine.nextFirst({ first: 1, winner: null })).toBe(0);
  });

  it('бот через контракт выбирает тот же ход, что и напрямую', () => {
    let s = newRound({ seed: 11, first: 0, variant: BASE });
    for (let i = 0; i < 6 && s.phase !== 'over'; i++) s = dofodoEngine.applyMove(s, legalMoves(s)[0]!);
    const viaEngine = dofodoEngine.chooseBotMove!(s, { seat: s.current, level: 'normal', totals: [10, 20], seed: 1 });
    expect(viaEngine).toEqual(chooseBotMove(s, { level: 'normal', totals: [10, 20] }));
    expect(dofodoEngine.legalMoves(s).some((m) => dofodoEngine.moveEquals(m, viaEngine))).toBe(true);
  });
});
