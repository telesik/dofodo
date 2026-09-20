// @vitest-environment jsdom
// Итоги партии между партиями матча (telesik-team#113, решение автора
// 20.09.2026): «Бросить матч» и «История ходов» стоят одним рядом, а под
// ними — действие платформы с флагом startCard («Поддержать авторов» в
// мобильных сборках) во всю ширину, как на стартовой карточке. Без
// действий платформы (веб-версия) ряда нет вовсе.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import indexHtml from '../index.html?raw';
import { legalMoves } from '../src/engine';
import { initApp } from '../src/ui/app';

function makeStorage() {
  const mem = new Map<string, string>();
  return {
    get: (k: string) => mem.get(k) ?? null,
    set: (k: string, v: string) => void mem.set(k, v),
    remove: (k: string) => void mem.delete(k),
  };
}

/** Доиграть текущую партию первым легальным ходом до конца (внешними
 *  ходами — место за столом не важно) и дождаться показа итогов. */
function playRoundToEnd(app: ReturnType<typeof initApp>): void {
  for (let i = 0; i < 400; i++) {
    const m = app.getMatch();
    if (!m || m.round.phase === 'over') break;
    app.dispatch(legalMoves(m.round)[0]!);
  }
  expect(app.getMatch()?.round.phase).toBe('over');
  vi.runAllTimers();
}

describe('итоги партии: ряд «Бросить матч / История ходов» и действие платформы', () => {
  beforeAll(() => {
    (globalThis as { matchMedia?: unknown }).matchMedia = () => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    Element.prototype.scrollTo = () => undefined;
  });
  beforeEach(() => {
    vi.useFakeTimers();
    const body = /<body>([\s\S]*)<\/body>/.exec(indexHtml)?.[1] ?? '';
    document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/g, '');
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('с действием платформы: обе кнопки в одном ряду, под ними кнопка во всю ширину', () => {
    const onSelect = vi.fn();
    const app = initApp({
      storage: makeStorage(),
      extraActions: [{ id: 'tipjar', label: () => 'Поддержать авторов', startCard: true, onSelect }],
    });
    app.startRemoteMatch({
      names: ['А', 'Б'],
      first: 0,
      variant: { doubleOnlyCloses: false },
      seed: 7,
      remoteSeat: 1,
    });
    playRoundToEnd(app);

    const overlay = document.getElementById('overlay') as HTMLElement;
    expect(overlay.hidden).toBe(false);
    const abort = overlay.querySelector<HTMLElement>('[data-action="abort-match"]');
    const history = overlay.querySelector<HTMLElement>('[data-action="history"]');
    expect(abort).not.toBeNull();
    expect(history).not.toBeNull();
    // Один и тот же ряд, «Бросить матч» первой.
    const row = abort!.closest('.btn-row')!;
    expect(row).toBe(history!.closest('.btn-row'));
    expect(row.classList.contains('review-row')).toBe(true);
    expect([...row.querySelectorAll('.btn')].map((b) => b.getAttribute('data-action'))).toEqual([
      'abort-match',
      'history',
    ]);

    // Ряд действия платформы — следом за рядом кнопок, во всю ширину
    // (тот же класс, что на стартовой карточке), последний на карточке.
    const actionRow = overlay.querySelector<HTMLElement>('.btn-row.action-row');
    expect(actionRow).not.toBeNull();
    expect(row.nextElementSibling).toBe(actionRow);
    expect(actionRow!.nextElementSibling).toBeNull();
    const tip = actionRow!.querySelector<HTMLButtonElement>('[data-action="x-act:tipjar"]');
    expect(tip?.textContent).toBe('Поддержать авторов');
    expect(tip?.classList.contains('ghost-btn')).toBe(true);

    // Нажатие зовёт надстройку, а итоги остаются на месте.
    tip!.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(overlay.hidden).toBe(false);
    expect(overlay.querySelector('[data-action="abort-match"]')).not.toBeNull();
  });

  it('без действий платформы (веб-версия) ряда action-row на итогах нет', () => {
    const app = initApp({ storage: makeStorage() });
    app.startRemoteMatch({
      names: ['А', 'Б'],
      first: 0,
      variant: { doubleOnlyCloses: false },
      seed: 7,
      remoteSeat: 1,
    });
    playRoundToEnd(app);
    const overlay = document.getElementById('overlay') as HTMLElement;
    expect(overlay.hidden).toBe(false);
    expect(overlay.querySelector('.btn-row.action-row')).toBeNull();
    const row = overlay.querySelector<HTMLElement>('.btn-row.review-row');
    expect(row?.querySelectorAll('.btn').length).toBe(2);
  });
});
