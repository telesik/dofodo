// Протокол ходов и воспроизведение партий.
//
// Партия полностью определяется тройкой (seed, first, variant) и списком
// ходов: раздача и каждый добор из базара воспроизводятся детерминированно,
// потому что RNG-цепочка стартует с того же seed. Это основа для разбора
// багов, режима истории в UI и сетевой партии. Механика общая для игр студии
// (подмодуль commons/).

import {
  matchProtocol as kitMatchProtocol,
  replayRound as kitReplayRound,
  validateProtocol as kitValidateProtocol,
  type MatchProtocol as KitMatchProtocol,
  type ProtocolCheck,
  type RoundProtocol as KitRoundProtocol,
} from '../../../commons/src/replay';
import { dofodoEngine } from './engine';
import type { GameState, Move, RoundResult, Variant } from './state';
import type { MatchState } from './match';

export type { ProtocolCheck } from '../../../commons/src/replay';

/** Протокол партии; result — итог, если она завершена (только для отображения). */
export type RoundProtocol = KitRoundProtocol<Move, RoundResult>;

export type MatchProtocol = KitMatchProtocol<Move, Variant, RoundResult> & {
  readonly format: 'bonesai-protocol';
};

/** Собрать протокол матча: завершённые партии плюс текущая (если она идёт). */
export function matchProtocol(match: MatchState): MatchProtocol {
  return kitMatchProtocol(dofodoEngine, match) as MatchProtocol;
}

/**
 * Воспроизвести партию по протоколу: первые upTo ходов (по умолчанию все).
 * Бросает исключение, если какой-то ход нелегален — так протокол проверяется
 * самим движком.
 */
export function replayRound(p: RoundProtocol, variant: Variant, upTo?: number): GameState {
  // Партии матча одинаковы — номер партии воспроизведению безразличен.
  return kitReplayRound(dofodoEngine, p, variant, 0, upTo);
}

/** Проверить весь протокол воспроизведением через движок. */
export function validateProtocol(p: MatchProtocol): ProtocolCheck {
  return kitValidateProtocol(dofodoEngine, p);
}
