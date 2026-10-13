// Матч — серия партий до 100 очков (§10.5); другая цель — variant.target.
// Порядок матча общий для игр студии (подмодуль commons/); политика Dofodo —
// цель матча и право первого хода — в engine.ts.

import {
  finishRound as kitFinishRound,
  nextRound as kitNextRound,
  startMatch as kitStartMatch,
  type FinishedRound as KitFinishedRound,
  type MatchState as KitMatchState,
  type StartMatchOptions as KitStartMatchOptions,
} from '../../../commons/src/match';
import { dofodoEngine, type MatchOutcome } from './engine';
import type { RngState } from './rng';
import type { GameState, Move, RoundResult, Variant } from './state';

export type { BotSeat } from '../../../commons/src/engine';
export type { MatchOutcome } from './engine';

/** Завершённая партия: итог, первый игрок, seed и ходы — для воспроизведения по протоколу. */
export type FinishedRound = KitFinishedRound<Move, RoundResult>;

export type MatchState = KitMatchState<GameState, Move, Variant, RoundResult, MatchOutcome>;

/** first — кому выпал жребий первого хода (§2.5). */
export type StartMatchOptions = KitStartMatchOptions<Variant>;

export function startMatch(opts: StartMatchOptions): MatchState {
  return kitStartMatch(dofodoEngine, opts);
}

/**
 * Принять результат завершённой партии: прибавить очки (§10.3),
 * проверить конец матча (§10.5).
 */
export function finishRound(match: MatchState): MatchState {
  // Слова ошибок — свои: в Dofodo раунд матча зовётся партией.
  if (!match.round.result) throw new Error('Партия ещё не завершена');
  return kitFinishRound(dofodoEngine, match);
}

/**
 * Начать следующую партию: первым ходит победитель предыдущей,
 * при ничьей игроки меняются ролями (§2.5).
 */
export function nextRound(match: MatchState, seed?: RngState): MatchState {
  if (match.rounds.length === 0) throw new Error('Нет завершённых партий');
  return kitNextRound(dofodoEngine, match, seed);
}
