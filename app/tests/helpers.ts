// Помощники для тестов: ручная сборка состояний и разыгрывание партий.

import {
  applyMove,
  cellKey,
  DIR,
  legalMoves,
  newRound,
  type End,
  type GameState,
  type MatchState,
  type Move,
  type RoundResult,
  type TileId,
  type Variant,
} from '../src/engine';
import { lcg } from '../src/ui/lcg';

export const BASE: Variant = { doubleOnlyCloses: false };
export const ONLY_CLOSES: Variant = { doubleOnlyCloses: true };

/** Собрать состояние основной фазы вручную. Раскладка минимальная, но валидная. */
export function makeState(opts: {
  hands: [TileId[], TileId[]];
  boneyard?: TileId[];
  ends?: Partial<End>[];
  current?: 0 | 1;
  first?: 0 | 1;
  variant?: Variant;
  placedCount?: number;
}): GameState {
  const ends: End[] = (opts.ends ?? []).map((e, i) => ({
    id: e.id ?? i,
    value: e.value ?? 0,
    attach: e.attach ?? { x: 3 + 4 * i, y: 0 },
    dir: e.dir ?? DIR.E,
    fresh: e.fresh ?? false,
    fromSeq: e.fromSeq ?? 0,
  }));
  // Фиктивные выложенные кости не нужны тестам правил; important — руки/базар/концы.
  return {
    phase: 'main',
    hands: opts.hands,
    boneyard: opts.boneyard ?? [],
    placed: [],
    ends,
    occupied: [cellKey({ x: 0, y: 0 })],
    current: opts.current ?? 0,
    first: opts.first ?? 0,
    seed: 12345,
    history: [],
    secondRevealed: true,
    mustPlay: null,
    rng: 12345,
    variant: opts.variant ?? BASE,
    nextEndId: ends.length,
    passStreak: 0,
    result: null,
    log: [],
  };
}

/** Политика выбора хода: состояние, легальные ходы и «случай» политики в [0, 1). */
export type Policy = (state: GameState, moves: readonly Move[], rand: () => number) => Move;

/** Случайная политика — равновероятный легальный ход. */
export const randomPolicy: Policy = (_state, moves, rand) => moves[Math.floor(rand() * moves.length)]!;

/**
 * Доиграть состояние до конца заданной политикой (по умолчанию —
 * случайной). Детерминировано по policySeed: у политики свой маленький
 * PRNG, чтобы не трогать rng движка.
 */
export function playFrom(
  start: GameState,
  policySeed: number,
  onStep?: (state: GameState, move: Move) => void,
  policy: Policy = randomPolicy,
): GameState {
  let state = start;
  const rand = lcg(policySeed ^ 0x9e3779b9);
  let guard = 0;
  while (state.phase !== 'over') {
    if (++guard > 1000) {
      throw new Error('Партия не завершилась за 1000 ходов');
    }
    const moves = legalMoves(state);
    if (moves.length === 0) {
      throw new Error(`Нет легальных ходов в фазе ${state.phase}`);
    }
    const move = policy(state, moves, rand);
    onStep?.(state, move);
    state = applyMove(state, move); // applyMove проверяет легальность
  }
  return state;
}

/** Разыграть партию с нуля той же политикой. Детерминировано по seed. */
export function playout(
  seed: number,
  first: 0 | 1,
  variant: Variant,
  onStep?: (state: GameState, move: Move) => void,
): GameState {
  return playFrom(newRound({ seed, first, variant }), seed, onStep);
}

/** Матч с подменённым итогом текущей партии: партия «завершена» с таким
 *  результатом, без розыгрыша — для тестов finishRound/nextRound (§10.5). */
export function withResult(match: MatchState, result: RoundResult): MatchState {
  return { ...match, round: { ...match.round, phase: 'over', result } };
}
