// @vitest-environment jsdom
// Итоги партии между партиями матча (telesik-team#113, решение автора
// 20.09.2026): «Бросить матч» и «История ходов» стоят одним рядом, а под
// ними — действие платформы с флагом startCard («Поддержать авторов» в
// мобильных сборках) во всю ширину, как на стартовой карточке. Без
// действий платформы (веб-версия) ряда нет вовсе.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { click, mountApp, playRoundToEnd, startFixtureMatch, unmountApps } from './dom-helpers';

describe('итоги партии: ряд «Бросить матч / История ходов» и действие платформы', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  it('с действием платформы: обе кнопки в одном ряду, под ними кнопка во всю ширину', () => {
    const onSelect = vi.fn();
    const { app } = mountApp({
      extraActions: [{ id: 'tipjar', label: () => 'Поддержать авторов', startCard: true, onSelect }],
    });
    startFixtureMatch(app);
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
    click(tip);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(overlay.hidden).toBe(false);
    expect(overlay.querySelector('[data-action="abort-match"]')).not.toBeNull();
  });

  it('без действий платформы (веб-версия) ряда action-row на итогах нет', () => {
    const { app } = mountApp();
    startFixtureMatch(app);
    playRoundToEnd(app);
    const overlay = document.getElementById('overlay') as HTMLElement;
    expect(overlay.hidden).toBe(false);
    expect(overlay.querySelector('.btn-row.action-row')).toBeNull();
    const row = overlay.querySelector<HTMLElement>('.btn-row.review-row');
    expect(row?.querySelectorAll('.btn').length).toBe(2);
  });
});
