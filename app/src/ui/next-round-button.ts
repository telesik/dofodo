// Кнопка «Следующая партия» на экране итога: три состояния договора сторон
// в матче с внешним игроком (идея 0030 штаба). Чистая функция — отдельно
// от initApp, чтобы состояния были покрыты юнит-тестом без DOM приложения.
import type { NextRoundWait } from './app';

export interface NextRoundLabels {
  /** «Следующая партия» — никто ещё не нажал. */
  btnNextRound: string;
  /** «Ждём подтверждения от соперника» — нажали мы. */
  btnWaiting: string;
  /** «Соперник готов и ждёт вас» — соперник нажал первым. */
  btnPeerReady: string;
}

/**
 * Разметка кнопки. `remote` — в матче есть внешний игрок; без него состояние
 * договора не имеет смысла и игнорируется (локальная игра, бот).
 * Ждём мы — кнопка погашена (disabled, класс waiting, точки через CSS);
 * соперник готов — кнопка активна и подсвечена (класс peer-ready).
 */
export function nextRoundButton(
  wait: NextRoundWait | null,
  remote: boolean,
  t: NextRoundLabels,
): string {
  const w = remote ? wait : null;
  if (w?.waiting) {
    return `<button class="btn waiting" data-action="next-round" disabled>${t.btnWaiting}</button>`;
  }
  if (w?.peerReady) {
    return `<button class="btn peer-ready" data-action="next-round">${t.btnPeerReady}</button>`;
  }
  return `<button class="btn" data-action="next-round">${t.btnNextRound}</button>`;
}
