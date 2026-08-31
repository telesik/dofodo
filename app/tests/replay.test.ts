import { describe, expect, it } from 'vitest';
import {
  applyMove,
  finishRound,
  legalMoves,
  matchProtocol,
  nextRound,
  replayRound,
  startMatch,
  validateProtocol,
  type MatchProtocol,
  type MatchState,
} from '../src/engine';
import { BASE, ONLY_CLOSES, playFrom, playout } from './helpers';

/** Доиграть текущую партию матча случайной политикой (playFrom из helpers). */
function playoutMatchRound(match: MatchState, policySeed: number): MatchState {
  return { ...match, round: playFrom(match.round, policySeed) };
}

describe('протокол ходов и воспроизведение', () => {
  it('партия детерминированно воспроизводится по (seed, first, moves)', () => {
    for (const [seed, variant] of [
      [17, BASE],
      [1234, BASE],
      [99991, ONLY_CLOSES],
    ] as const) {
      const final = playout(seed, (seed % 2) as 0 | 1, variant);
      const replayed = replayRound(
        { seed: final.seed, first: final.first, moves: final.history },
        variant,
      );
      // Полное совпадение: руки, стол, лог, итог.
      expect(replayed.hands).toEqual(final.hands);
      expect(replayed.boneyard).toEqual(final.boneyard);
      expect(replayed.placed).toEqual(final.placed);
      expect(replayed.log).toEqual(final.log);
      expect(replayed.result).toEqual(final.result);
    }
  });

  it('частичное воспроизведение даёт промежуточные состояния', () => {
    const final = playout(42, 0, BASE);
    const mid = replayRound(
      { seed: final.seed, first: final.first, moves: final.history },
      BASE,
      Math.floor(final.history.length / 2),
    );
    expect(mid.phase).not.toBe('over');
    expect(mid.history.length).toBe(Math.floor(final.history.length / 2));
  });

  it('испорченный протокол отбраковывается проверкой', () => {
    const final = playout(7, 1, BASE);
    const badMoves = [...final.history];
    // Портим первый ход выставления: несуществующий конец.
    const idx = badMoves.findIndex((m) => m.type === 'place');
    badMoves[idx] = { type: 'place', tile: '6-6', endId: 999, mode: 'straight' };
    const proto: MatchProtocol = {
      format: 'bonesai-protocol',
      v: 1,
      names: ['А', 'Б'],
      variant: BASE,
      rounds: [{ seed: final.seed, first: final.first, moves: badMoves }],
    };
    const check = validateProtocol(proto);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.round).toBe(0);
      expect(check.error).toContain(`ход ${idx + 1}`);
    }
  });
});

describe('matchProtocol — сборка протокола матча (экспорт в JSON)', () => {
  it('завершённые партии + текущая; движок подтверждает протокол целиком', () => {
    // Цель 200: одна партия матч не закончит, nextRound гарантированно доступен.
    const variant = { ...BASE, target: 200 };
    let match = startMatch({ names: ['Аня', 'Боря'], first: 0, variant, seed: 17 });
    match = finishRound(playoutMatchRound(match, 1));
    expect(match.outcome).toBeNull();
    match = nextRound(match, 55);
    // Пара ходов текущей партии — она попадает в протокол незавершённой.
    for (let i = 0; i < 2; i++) {
      match = { ...match, round: applyMove(match.round, legalMoves(match.round)[0]!) };
    }

    const p = matchProtocol(match);
    expect(p.format).toBe('bonesai-protocol');
    expect(p.v).toBe(1);
    expect(p.names).toEqual(['Аня', 'Боря']);
    expect(p.variant).toEqual(variant);
    expect(p.totals).toEqual(match.totals);
    expect(p.rounds).toHaveLength(2);
    // Завершённая — с итогом; текущая — без него, ходы из history.
    expect(p.rounds[0]!.result).toBeDefined();
    expect(p.rounds[0]!.result!.sums).toEqual(match.rounds[0]!.sums);
    expect(p.rounds[1]!.result).toBeUndefined();
    expect(p.rounds[1]!.moves).toEqual(match.round.history);

    const check = validateProtocol(p);
    expect(check).toEqual({ ok: true });

    // Реплей завершённой партии сходится с записанным итогом.
    const replayed = replayRound(p.rounds[0]!, p.variant);
    expect(replayed.result?.sums).toEqual(match.rounds[0]!.sums);
    expect(replayed.result?.winner).toBe(match.rounds[0]!.winner);
  });

  it('партия, уже принятая finishRound, не дублируется текущей', () => {
    let match = startMatch({ names: ['А', 'Б'], first: 1, variant: ONLY_CLOSES, seed: 99991 });
    match = finishRound(playoutMatchRound(match, 2));
    // Следующая партия не начата: match.round завершён и лежит в rounds.
    const p = matchProtocol(match);
    expect(p.rounds).toHaveLength(1);
    expect(p.rounds[0]!.result).toBeDefined();
    expect(validateProtocol(p)).toEqual({ ok: true });
  });
});
