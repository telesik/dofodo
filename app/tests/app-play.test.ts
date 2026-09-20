// @vitest-environment jsdom
// Партия за одним экраном через DOM (telesik-team#115): выбор кости в руке
// и ход по тени, добор кликом по куче и мимо кости в её границах, обязательная
// кость, режим подтверждения хода, автопас, кнопки шапки (◐, зеркало, ⌖, ↺,
// «дверь»), замер времени хода и его обнуление при уходе с глаз.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyMove, legalMoves, newRound, type GameState, type Move } from '../src/engine';
import { L, setLocale } from '../src/ui/i18n';
import { BASE } from './helpers';
import {
  click,
  FIXTURE,
  ghostByMove,
  ghosts,
  LS_KEY,
  mountApp,
  playUntil,
  q,
  readPrefs,
  startFixtureMatch,
  toastText,
  unmountApps,
  useFakeClock,
  type Mounted,
} from './dom-helpers';

/** Матч за одним экраном: оба места локальные. Часы сдвинуты, чтобы гейт
 *  «300 мс после последнего хода» не считал старт моментом хода. */
function hotSeat(over: Partial<Parameters<typeof startFixtureMatch>[1]> = {}): Mounted {
  const m = mountApp({ prefs: { howtoShown: true } });
  startFixtureMatch(m.app, over);
  m.app.setRemoteSeat(null);
  vi.advanceTimersByTime(1000);
  return m;
}

const current = (m: Mounted): GameState => m.app.getMatch()!.round;
const historyLen = (m: Mounted): number => current(m).history.length;
const playableTiles = (): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>('.hand-tile.playable[data-tile]'),
];

/** Позиция, где у ходящего минимум две играбельные кости. */
function toChoicePosition(m: Mounted): void {
  const ok = playUntil(m.app, (moves) => {
    const tiles = new Set(moves.filter((mv) => 'tile' in mv).map((mv) => (mv as { tile: string }).tile));
    return tiles.size >= 2;
  });
  expect(ok).toBe(true);
  vi.advanceTimersByTime(400);
}

describe('партия через DOM: рука и тени', () => {
  beforeEach(useFakeClock);
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
    setLocale('ru');
  });

  it('клик по кости выбирает её и рисует тени; клик по тени ставит кость; ход получает время', () => {
    const m = hotSeat();
    toChoicePosition(m);
    const before = historyLen(m);
    const tiles = playableTiles();
    expect(tiles.length).toBeGreaterThanOrEqual(2);
    // Выбираем вторую играбельную — первая могла быть выбрана автоматически.
    click(tiles[1]);
    expect(tiles[1]!.dataset.tile).toBeDefined();
    expect(q('.hand-tile.selected').dataset.tile).toBe(tiles[1]!.dataset.tile);
    expect(ghosts().length).toBeGreaterThan(0);
    for (const g of ghosts()) {
      expect((JSON.parse(g.dataset.move!) as { tile: string }).tile).toBe(tiles[1]!.dataset.tile);
    }
    vi.advanceTimersByTime(1234);
    click(ghosts()[0]!);
    expect(historyLen(m)).toBe(before + 1);
    const last = current(m).history[before]!;
    expect(last.type === 'place' || last.type === 'placeRoot').toBe(true);
    expect(last.t).toBeGreaterThanOrEqual(1000);
    // Полёт кости дорисовывается по кадрам и убирается.
    vi.advanceTimersByTime(600);
    expect(document.querySelector('.flying-tile')).toBeNull();
  });

  it('повторный клик по выбранной кости снимает выбор; клик по недоступной — вздрагивание; чужая рука молчит', () => {
    const m = hotSeat();
    toChoicePosition(m);
    const tile = playableTiles()[1]!.dataset.tile!;
    click(q(`.hand-tile[data-tile="${tile}"]`));
    expect(q('.hand-tile.selected').dataset.tile).toBe(tile);
    // Рука перерисована — кликаем по свежему элементу той же кости.
    click(q(`.hand-tile[data-tile="${tile}"]`));
    expect(document.querySelector('.hand-tile.selected')).toBeNull();
    expect(ghosts().length).toBe(0);

    const dimmed = document.querySelector<HTMLElement>('.hand-tile.dimmed[data-tile]');
    if (dimmed) {
      click(dimmed);
      expect(dimmed.classList.contains('wiggle')).toBe(true);
      expect(document.querySelector('.hand-tile.selected')).toBeNull();
    }
    // Рука не ходящего (в hot-seat первое место внизу): кости без классов
    // playable — а до открытия руки второго и без идентификаторов, — клик
    // ни к чему не ведёт.
    const cur = current(m).current;
    const other = document.querySelector<HTMLElement>(`${cur === 0 ? '#hand-top' : '#hand-bottom'} .hand-tile`);
    expect(other).not.toBeNull();
    expect(other!.classList.contains('playable')).toBe(false);
    const n = historyLen(m);
    click(other);
    expect(historyLen(m)).toBe(n);
    expect(document.querySelector('.hand-tile.selected')).toBeNull();
  });

  it('второй клик по тени сразу после хода гасится (защита от двойного клика)', () => {
    const m = hotSeat();
    toChoicePosition(m);
    click(playableTiles()[0]);
    click(ghosts()[0]!);
    const n = historyLen(m);
    // Через 100 мс — новая позиция, новые тени; клик по ним ещё в гейте.
    vi.advanceTimersByTime(100);
    if (ghosts().length > 0) {
      click(ghosts()[0]!);
      expect(historyLen(m)).toBe(n);
    }
  });

  it('уход приложения с глаз обнуляет замер времени хода', () => {
    const m = hotSeat();
    toChoicePosition(m);
    window.dispatchEvent(new Event('pagehide'));
    click(playableTiles()[0]);
    click(ghosts()[0]!);
    expect(current(m).history[historyLen(m) - 1]!.t).toBeUndefined();

    toChoicePosition(m);
    document.dispatchEvent(new Event('freeze'));
    click(playableTiles()[0]);
    click(ghosts()[0]!);
    expect(current(m).history[historyLen(m) - 1]!.t).toBeUndefined();

    toChoicePosition(m);
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    click(playableTiles()[0]);
    click(ghosts()[0]!);
    expect(current(m).history[historyLen(m) - 1]!.t).toBeUndefined();
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  });
});

describe('партия через DOM: базар', () => {
  beforeEach(useFakeClock);
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  it('клик по куче, когда тянуть нельзя: встряска и подсказка «есть ход»', () => {
    const m = hotSeat();
    // Начало партии: у первого игрока есть дубль — тянуть нельзя.
    expect(legalMoves(current(m)).some((mv) => mv.type === 'draw')).toBe(false);
    click(q('#boneyard [data-pile]'));
    expect(q('#boneyard').classList.contains('shake')).toBe(true);
    expect(toastText()).toBe(L().toastNoDrawHaveMove);
    expect(historyLen(m)).toBe(0);
  });

  it('в чужой ход (внешнее место) куча отвечает «сейчас тянуть нельзя»', () => {
    const m = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(m.app, { first: 1 });
    vi.advanceTimersByTime(1000);
    expect(current(m).current).toBe(FIXTURE.remoteSeat);
    click(q('#boneyard [data-pile]'));
    expect(toastText()).toBe(L().toastNoDrawNow);
    // И кость в руке внешнего игрока не откликается.
    click(document.querySelector('.hand-tile[data-tile]'));
    expect(document.querySelector('.hand-tile.selected')).toBeNull();
  });

  it('клик по кости кучи тянет кость; клон летит в руку; спрайт гаснет', () => {
    const m = hotSeat();
    expect(playUntil(m.app, (moves) => moves.some((mv) => mv.type === 'draw'))).toBe(true);
    vi.advanceTimersByTime(400);
    const before = historyLen(m);
    const alive = document.querySelectorAll('#boneyard .pile-tile').length;
    expect(alive).toBe(current(m).boneyard.length);
    expect(q('#boneyard').classList.contains('can-draw')).toBe(true);
    click(q('#boneyard [data-pile]'));
    expect(historyLen(m)).toBe(before + 1);
    const log = current(m).log[current(m).log.length - 1]!;
    expect(log.kind).toBe('draw');
    expect(document.querySelector('.flying-tile')).not.toBeNull();
    expect(document.querySelectorAll('#boneyard .pile-tile').length).toBe(alive - 1);
    vi.advanceTimersByTime(500);
    expect(document.querySelector('.flying-tile')).toBeNull();
  });

  it('клик мимо кости в границах кучи тоже тянет; вытянутой костью обязаны сходить', () => {
    const m = hotSeat();
    // Ищем добор, после которого кость обязана быть сыграна (mustPlay).
    let found = false;
    for (let i = 0; i < 40 && !found; i++) {
      expect(playUntil(m.app, (moves) => moves.some((mv) => mv.type === 'draw'))).toBe(true);
      const next = applyMove(current(m), { type: 'draw' });
      if (next.mustPlay) {
        found = true;
        break;
      }
      m.app.dispatch({ type: 'draw' });
    }
    expect(found).toBe(true);
    vi.advanceTimersByTime(400);
    // В jsdom прямоугольники нулевые, и зона кучи считается по координатам
    // спрайтов (12…192 × 8…148 px): клик в (100, 78) по столу — «в зоне».
    const before = historyLen(m);
    q('#table').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 100, clientY: 78 }));
    expect(historyLen(m)).toBe(before + 1);
    const must = current(m).mustPlay;
    expect(must).not.toBeNull();
    expect(q('.hand-tile.must').dataset.tile).toBe(must);
    expect(q('#tutor-bar').textContent).toContain(L().tutorMustPlay);
    vi.advanceTimersByTime(400);
    // Другая кость в руке — отказ с подсказкой.
    const other = document.querySelector<HTMLElement>(
      `.hand-tile[data-player="${current(m).current}"]:not([data-tile="${must}"])`,
    );
    if (other) {
      click(other);
      expect(toastText()).toBe(L().toastMustPlay(must!.replace('-', ':')));
    }
    // Клик по обязательной кости оставляет её выбранной; тени — только её.
    click(q(`.hand-tile[data-tile="${must}"]`));
    expect(q('.hand-tile.selected').dataset.tile).toBe(must);
    for (const g of ghosts()) {
      expect((JSON.parse(g.dataset.move!) as { tile: string }).tile).toBe(must);
    }
  });
});

describe('партия через DOM: режим подтверждения', () => {
  beforeEach(useFakeClock);
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  /** Режим подтверждения в основной фазе: черновик — обычный ход с режимом
   *  (прямо/поворот), не корень. */
  function confirmMode(): Mounted {
    const m = mountApp({ prefs: { howtoShown: true, confirm: true } });
    startFixtureMatch(m.app);
    m.app.setRemoteSeat(null);
    vi.advanceTimersByTime(1000);
    expect(
      playUntil(m.app, (moves) => {
        const tiles = new Set(moves.filter((mv) => mv.type === 'place').map((mv) => (mv as { tile: string }).tile));
        return tiles.size >= 2;
      }),
    ).toBe(true);
    vi.advanceTimersByTime(400);
    return m;
  }

  it('клик по тени выбирает черновик; «Отмена» снимает; кнопка «Поставить» ставит', () => {
    const m = confirmMode();
    click(playableTiles()[0]);
    const n = historyLen(m);
    click(ghosts()[0]!);
    expect(historyLen(m)).toBe(n);
    const bar = q('#confirm-bar');
    expect(bar.hidden).toBe(false);
    expect(bar.textContent).toContain(L().confirmYes);
    const draft = JSON.parse(ghosts()[0]!.dataset.move!) as { tile: string; mode: string };
    const modeWord = draft.mode === 'straight' ? L().modeStraight : draft.mode === 'turn' ? L().modeTurn : L().modeCross;
    expect(bar.textContent).toContain(L().confirmAsk(draft.tile.replace('-', ':'), modeWord));
    expect(q('#tutor-bar').textContent).toContain(L().tutorPending);
    expect(document.querySelector('#board .pending')).not.toBeNull();
    click(q('#confirm-no'));
    expect(bar.hidden).toBe(true);
    expect(historyLen(m)).toBe(n);

    click(ghosts()[0]!);
    expect(bar.hidden).toBe(false);
    click(q('#confirm-yes'));
    expect(historyLen(m)).toBe(n + 1);
    expect(bar.hidden).toBe(true);
  });

  it('повторный клик по той же тени подтверждает, но не раньше 350 мс; другая тень меняет черновик', () => {
    const m = confirmMode();
    click(playableTiles()[0]);
    const n = historyLen(m);
    const moves = ghosts().map((g) => g.dataset.move!);
    click(ghostByMove(moves[0]!));
    click(ghostByMove(moves[0]!));
    expect(historyLen(m)).toBe(n);
    const last = moves.length > 1 ? moves[1]! : moves[0]!;
    click(ghostByMove(last));
    expect(q('#confirm-bar').hidden).toBe(false);
    expect(historyLen(m)).toBe(n);
    vi.advanceTimersByTime(400);
    click(ghostByMove(last));
    expect(historyLen(m)).toBe(n + 1);
  });

  it('выключение подтверждения в настройках снимает черновик', () => {
    const m = confirmMode();
    click(playableTiles()[0]);
    click(ghosts()[0]!);
    expect(q('#confirm-bar').hidden).toBe(false);
    click(q('#btn-settings'));
    const cb = q<HTMLInputElement>('#settings input[data-set="confirm"]');
    cb.checked = false;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    expect(q('#confirm-bar').hidden).toBe(true);
    expect(readPrefs(m.storage).confirm).toBe(false);
  });
});

describe('партия через DOM: автопас', () => {
  beforeEach(useFakeClock);
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  /** Сид и число ходов «первым легальным», после которых у ходящего только пас. */
  function findPassPosition(): { seed: number; steps: number } {
    for (let seed = 1; seed < 400; seed++) {
      let s = newRound({ seed, first: 0, variant: BASE });
      for (let steps = 0; s.phase !== 'over' && steps < 400; steps++) {
        const moves = legalMoves(s);
        if (moves.length === 1 && moves[0]!.type === 'pass') return { seed, steps };
        s = applyMove(s, moves[0]!);
      }
    }
    throw new Error('позиция с единственным пасом не нашлась');
  }

  it('единственный ход — пас: тост один раз и пас сам через 1300 мс', () => {
    const { seed, steps } = findPassPosition();
    const m = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(m.app, { seed });
    m.app.setRemoteSeat(null);
    for (let i = 0; i < steps; i++) m.app.dispatch(legalMoves(current(m))[0]!);
    const n = historyLen(m);
    expect(legalMoves(current(m))).toEqual([{ type: 'pass' }]);
    const name = m.app.getMatch()!.names[current(m).current];
    expect(toastText()).toBe(L().toastPassAuto(name));
    expect(q('#status-prompt').innerHTML).toBe(L().promptPass(`<b>${name}</b>`));
    expect(q('#tutor-bar').textContent).toContain(L().tutorPass);
    // Промежуточный рендер перезаводит таймер, но тост второй раз не показывает.
    q('#toast').hidden = true;
    m.app.render();
    expect(q('#toast').hidden).toBe(true);
    vi.advanceTimersByTime(1400);
    expect(historyLen(m)).toBe(n + 1);
    expect(current(m).history[n]!.type).toBe('pass');
  });

  it('пас внешнего места локально не разыгрывается', () => {
    const { seed, steps } = findPassPosition();
    const m = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(m.app, { seed });
    m.app.setRemoteSeat(null);
    for (let i = 0; i < steps; i++) m.app.dispatch(legalMoves(current(m))[0]!);
    const n = historyLen(m);
    m.app.setRemoteSeat(current(m).current);
    vi.advanceTimersByTime(2000);
    expect(historyLen(m)).toBe(n);
  });
});

describe('партия через DOM: кнопки шапки', () => {
  beforeEach(useFakeClock);
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
    vi.restoreAllMocks();
    setLocale('ru');
  });

  it('◐ разметка ходов: класс active, prefs и тост при включении', () => {
    const m = hotSeat();
    click(q('#btn-mark'));
    expect(q('#btn-mark').classList.contains('active')).toBe(true);
    expect(readPrefs(m.storage).markOwners).toBe(true);
    expect(toastText()).not.toBe('');
    q('#toast').hidden = true;
    click(q('#btn-mark'));
    expect(q('#btn-mark').classList.contains('active')).toBe(false);
    expect(readPrefs(m.storage).markOwners).toBe(false);
    expect(q('#toast').hidden).toBe(true);
  });

  // Баг telesik-team#114 (исправлен в #121): тост был захардкожен по-русски.
  it('тост ◐ берётся из словаря выбранного языка (telesik-team#114)', () => {
    const m = mountApp({ prefs: { howtoShown: true, locale: 'en' } });
    startFixtureMatch(m.app);
    click(q('#btn-mark'));
    expect(toastText()).toBe(L().toastMarkOwners);
  });

  it('зеркало: кнопка и галочка в настройках — один путь; кадр отражается', () => {
    const m = hotSeat();
    click(q('#btn-mirror'));
    expect(q('#btn-mirror').classList.contains('active')).toBe(true);
    expect(readPrefs(m.storage).mirror).toBe(true);
    // Отражение кадра проверяется в board-pointer.test.ts (при выключенном
    // автомасштабе); здесь — согласованность кнопки и галочки.
    click(q('#btn-settings'));
    const cb = q<HTMLInputElement>('#settings input[data-set="mirror"]');
    expect(cb.checked).toBe(true);
    cb.checked = false;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    expect(q('#btn-mirror').classList.contains('active')).toBe(false);
    expect(readPrefs(m.storage).mirror).toBe(false);
  });

  it('сохранённое зеркало применяется до первого рендера', () => {
    const m = mountApp({ prefs: { howtoShown: true, mirror: true } });
    startFixtureMatch(m.app);
    expect(q('#btn-mirror').classList.contains('active')).toBe(true);
  });

  it('⌖ автомасштаб: выключение пишется в prefs, включение возвращает кадр', () => {
    const m = hotSeat();
    expect(q('#btn-fit').classList.contains('active')).toBe(true);
    click(q('#btn-fit'));
    expect(q('#btn-fit').classList.contains('active')).toBe(false);
    expect(readPrefs(m.storage).autoFit).toBe(false);
    click(q('#btn-fit'));
    expect(q('#btn-fit').classList.contains('active')).toBe(true);
    expect(readPrefs(m.storage).autoFit).toBe(true);
    // Сохранённое «выключено» переживает перезапуск.
    unmountApps();
    const m2 = mountApp({ prefs: { howtoShown: true, autoFit: false } });
    startFixtureMatch(m2.app);
    // Старт партии включает автомасштаб принудительно.
    expect(q('#btn-fit').classList.contains('active')).toBe(true);
  });

  it('↺ перекладка видна при поворотах в hot-seat и скрыта в сетевом матче', () => {
    const m = hotSeat();
    expect(q('#btn-relayout').hidden).toBe(true);
    for (let i = 0; i < 400 && !current(m).placed.some((p) => p.kind === 'turn'); i++) {
      if (current(m).phase === 'over') break;
      const moves = legalMoves(current(m));
      const turn = moves.find((mv) => mv.type === 'place' && mv.mode === 'turn') ?? moves[0]!;
      m.app.dispatch(turn);
    }
    expect(current(m).placed.some((p) => p.kind === 'turn')).toBe(true);
    expect(q('#btn-relayout').hidden).toBe(false);
    const before = JSON.stringify(current(m).placed);
    click(q('#btn-relayout'));
    // Другая валидная раскладка того же дерева — или та же, если её нет;
    // правила и история не тронуты.
    expect(current(m).placed.length).toBe(JSON.parse(before).length);
    expect(m.storage.mem.get(LS_KEY)).toBeDefined();
    // При автомасштабе выключенном — довод кости в кадр.
    click(q('#btn-fit'));
    click(q('#btn-relayout'));
    m.app.setRemoteSeat(1);
    expect(q('#btn-relayout').hidden).toBe(true);
  });

  it('«дверь»: отказ в диалоге оставляет матч, согласие сбрасывает его и зовёт onMatchReset', () => {
    const onMatchReset = vi.fn();
    const m = mountApp({ prefs: { howtoShown: true }, onMatchReset });
    startFixtureMatch(m.app);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    click(q('#btn-new'));
    expect(confirm).toHaveBeenCalledWith(L().confirmNewMatch);
    expect(m.app.getMatch()).not.toBeNull();
    confirm.mockReturnValue(true);
    click(q('#btn-new'));
    expect(m.app.getMatch()).toBeNull();
    expect(onMatchReset).toHaveBeenCalledTimes(1);
    expect(m.storage.mem.has(LS_KEY)).toBe(false);
    expect(q('#overlay').hidden).toBe(false);
    expect(document.querySelector('#btn-start')).not.toBeNull();
  });

  it('смена языка в настройках посреди партии перерисовывает стол на новом языке', () => {
    const m = hotSeat();
    click(q('#btn-settings'));
    const sel = q<HTMLSelectElement>('#set-lang');
    sel.value = 'en';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    expect(q('#round-chip').textContent).toBe(L().roundChip(1));
    expect(q('#boneyard .pile-count').textContent).toBe(L().pileCount(current(m).boneyard.length));
    expect(readPrefs(m.storage).locale).toBe('en');
  });

  it('звук: включение в настройках проигрывает пробный стук без ошибок', () => {
    const m = hotSeat();
    click(q('#btn-settings'));
    const cb = q<HTMLInputElement>('#settings input[data-set="sound"]');
    cb.checked = false;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    expect(readPrefs(m.storage).sound).toBe(true);
  });

  it('ход, пришедший снаружи с недопустимым ходом, игнорируется с записью в консоль', () => {
    const m = hotSeat();
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const bad: Move = { type: 'place', tile: '6-6', endId: 999, mode: 'straight' };
    m.app.dispatch(bad);
    expect(err).toHaveBeenCalled();
    expect(historyLen(m)).toBe(0);
  });
});
