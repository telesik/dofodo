// @vitest-environment jsdom
// Режим истории ходов (telesik-team#115): вход по ⧗ и с итогов партии,
// панель перемотки (кнопки, ползунок, селект партии), выход — с возвратом
// итогов, если партия завершена; внешний ход выбивает из истории.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { legalMoves } from '../src/engine';
import { L } from '../src/ui/i18n';
import {
  click,
  mountApp,
  playRoundToEnd,
  q,
  setValue,
  startFixtureMatch,
  unmountApps,
  type Mounted,
} from './dom-helpers';

const pos = (): string => q('#replay-pos').textContent ?? '';
const bar = (): HTMLElement => q('#history-bar');

function withMoves(n: number): Mounted {
  const m = mountApp({ prefs: { howtoShown: true } });
  startFixtureMatch(m.app);
  for (let i = 0; i < n; i++) m.app.dispatch(legalMoves(m.app.getMatch()!.round)[0]!);
  return m;
}

describe('история ходов', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  it('⧗ без матча ничего не открывает', () => {
    mountApp({ prefs: { howtoShown: true } });
    click(q('#btn-hist'));
    expect(bar().hidden).toBe(true);
  });

  it('⧗ открывает живую партию на последнем ходе; перемотка кнопками и ползунком; ✕ закрывает', () => {
    const m = withMoves(3);
    click(q('#btn-hist'));
    expect(bar().hidden).toBe(false);
    expect(q('#btn-hist').classList.contains('active')).toBe(true);
    expect(q('#round-chip').textContent).toBe(L().viewChip(1, 1));
    expect(q('#status-event').textContent).toBe(L().historyLive);
    expect(pos()).toBe(L().historyPos(3, 3));
    const slider = q<HTMLInputElement>('#replay-slider');
    expect(slider.max).toBe('3');
    expect(slider.value).toBe('3');
    // Руки в режиме просмотра открыты и без кликабельных идентификаторов.
    expect(document.querySelectorAll('.hand-tile[data-tile]').length).toBe(0);
    expect(document.querySelectorAll('.hand-tile').length).toBeGreaterThan(0);
    expect(q('#tutor-bar').hidden).toBe(true);
    expect(q('#overlay').hidden).toBe(true);

    click(bar().querySelector('[data-action="replay-prev"]'));
    expect(pos()).toBe(L().historyPos(2, 3));
    click(bar().querySelector('[data-action="replay-first"]'));
    expect(pos()).toBe(L().historyPos(0, 3));
    expect(q('#status-prompt').innerHTML).toBe(L().historyDeal('<b>А</b>'));
    click(bar().querySelector('[data-action="replay-prev"]'));
    expect(pos()).toBe(L().historyPos(0, 3));
    click(bar().querySelector('[data-action="replay-next"]'));
    expect(pos()).toBe(L().historyPos(1, 3));
    click(bar().querySelector('[data-action="replay-last"]'));
    expect(pos()).toBe(L().historyPos(3, 3));
    click(bar().querySelector('[data-action="replay-next"]'));
    expect(pos()).toBe(L().historyPos(3, 3));
    setValue('#replay-slider', '2', 'input');
    expect(pos()).toBe(L().historyPos(2, 3));
    expect(slider.value).toBe('2');
    // Ползунок шагает вперёд — кость на столе анимируется, история стоит.
    setValue('#replay-slider', '3', 'input');
    expect(m.app.getMatch()!.round.history.length).toBe(3);

    click(bar().querySelector('[data-action="replay-exit"]'));
    expect(bar().hidden).toBe(true);
    expect(q('#btn-hist').classList.contains('active')).toBe(false);
    expect(document.querySelectorAll('.hand-tile[data-tile]').length).toBeGreaterThan(0);
  });

  it('⧗ в режиме истории закрывает её; внешний ход выбивает из истории и применяется', () => {
    const m = withMoves(2);
    click(q('#btn-hist'));
    expect(bar().hidden).toBe(false);
    click(q('#btn-hist'));
    expect(bar().hidden).toBe(true);

    click(q('#btn-hist'));
    click(bar().querySelector('[data-action="replay-first"]'));
    m.app.dispatch(legalMoves(m.app.getMatch()!.round)[0]!);
    expect(bar().hidden).toBe(true);
    expect(m.app.getMatch()!.round.history.length).toBe(3);
    // Кнопки перемотки вне режима истории ничего не делают.
    const stray = document.createElement('button');
    stray.dataset.action = 'replay-last';
    document.body.appendChild(stray);
    click(stray);
    expect(bar().hidden).toBe(true);
  });

  it('с итогов партии: селект партий, выход возвращает итоги', () => {
    const m = withMoves(0);
    playRoundToEnd(m.app);
    expect(q('#overlay').hidden).toBe(false);
    click(q('#overlay [data-action="history"]'));
    expect(q('#overlay').hidden).toBe(true);
    expect(bar().hidden).toBe(false);
    const total = m.app.getMatch()!.rounds[0]!.moves.length;
    expect(pos()).toBe(L().historyPos(total, total));
    const opts = [...q<HTMLSelectElement>('#replay-round').options].map((o) => o.textContent);
    expect(opts.length).toBe(1);
    expect(opts[0]).toMatch(/1/);
    click(bar().querySelector('[data-action="replay-exit"]'));
    expect(bar().hidden).toBe(true);
    expect(q('#overlay').hidden).toBe(false);
    expect(q('#overlay [data-action="next-round"]')).not.toBeNull();

    // Вторая партия: в истории две записи, живая — второй; переключение селектом.
    click(q('#overlay [data-action="next-round"]'));
    expect(m.app.getMatch()!.rounds.length).toBe(1);
    expect(q('#overlay').hidden).toBe(true);
    m.app.dispatch(legalMoves(m.app.getMatch()!.round)[0]!);
    click(q('#btn-hist'));
    expect(q('#round-chip').textContent).toBe(L().viewChip(2, 2));
    const options = [...q<HTMLSelectElement>('#replay-round').options].map((o) => o.textContent);
    expect(options[1]).toBe(L().roundOptLive(2));
    expect(options[0]).toContain('1');
    expect(pos()).toBe(L().historyPos(1, 1));
    setValue('#replay-round', '0');
    expect(q('#round-chip').textContent).toBe(L().viewChip(1, 2));
    expect(pos()).toBe(L().historyPos(0, total));
    click(bar().querySelector('[data-action="replay-last"]'));
    expect(pos()).toBe(L().historyPos(total, total));
    click(bar().querySelector('[data-action="replay-exit"]'));
    // Живая партия не завершена — итогов нет.
    expect(q('#overlay').hidden).toBe(true);
  });
});
