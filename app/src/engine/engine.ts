// Dofodo глазами общего кода студии: правила, политика матча и бот собраны
// в один объект по контракту GameEngine (подмодуль commons/). Матч, протокол
// и каркас приложения работают с игрой только через него.

import type { GameEngine } from '../../../commons/src/engine';
import { chooseBotMove } from './bot';
import { applyMove, legalMoves, moveEquals, newRound } from './rules';
import { matchTarget, type GameState, type LogEntry, type Move, type RoundResult, type Variant } from './state';

/** Исход матча (§10.5): проигрывает набравший цель; оба набрали поровну — ничья. */
export type MatchOutcome =
  | { readonly kind: 'loss'; readonly loser: 0 | 1 }
  | { readonly kind: 'draw' };

export const dofodoEngine: GameEngine<GameState, Move, Variant, RoundResult, LogEntry, MatchOutcome> = {
  id: 'dofodo',
  // Историческое имя формата: протоколы и сетевые сборки до переименования игры.
  protocolFormat: 'bonesai-protocol',
  rulesVersion: '1.1',
  defaultVariant: { doubleOnlyCloses: false },
  // Канонические 100 в вариант не пишутся: без поля они подразумеваются.
  canonVariant: (v) => ({
    doubleOnlyCloses: v.doubleOnlyCloses,
    ...(matchTarget(v) !== 100 ? { target: matchTarget(v) } : {}),
  }),
  sameVariant: (a, b) => a.doubleOnlyCloses === b.doubleOnlyCloses && matchTarget(a) === matchTarget(b),

  // Партии матча одинаковы — номер партии раздаче безразличен.
  newRound: ({ seed, first, variant }) => newRound({ seed, first, variant }),
  legalMoves,
  applyMove,
  moveEquals,

  matchOutcome(totals, _rounds, variant) {
    const target = matchTarget(variant);
    if (totals[0] < target && totals[1] < target) return null;
    return totals[0] === totals[1]
      ? { kind: 'draw' }
      : { kind: 'loss', loser: totals[0] > totals[1] ? 0 : 1 };
  },
  // Первым ходит победитель предыдущей партии, при ничьей игроки меняются ролями (§2.5).
  nextFirst: (last) => (last.winner !== null ? last.winner : ((1 - last.first) as 0 | 1)),

  // Случайности у бота нет: выбор детерминирован по состоянию.
  chooseBotMove: (s, o) => chooseBotMove(s, { level: o.level, totals: o.totals }),
};
