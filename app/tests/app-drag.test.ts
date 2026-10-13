// @vitest-environment jsdom
// Ход перетягиванием кости из руки (telesik-team#164): три исхода — поставил,
// отлип и поставил в другой вариант, вернул в руку; с подтверждением ходов
// и без; палец отличает кость от прокрутки руки; ход тапом не сломан.
// jsdom геометрии не считает — прямоугольник стола подменяется, а точки
// прилипания теней пересчитываются в экранные по viewBox.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { legalMoves, placementGeometry, ROOT_CELLS, type GameState, type Move } from '../src/engine';
import { CELL } from '../src/ui/tile-svg';
import {
  click,
  ghosts,
  mountApp,
  playUntil,
  q,
  startFixtureMatch,
  unmountApps,
  useFakeClock,
  type Mounted,
} from './dom-helpers';

const RECT = { left: 0, top: 0, right: 800, bottom: 450, width: 800, height: 450, x: 0, y: 0, toJSON: () => ({}) };

type PlaceMove = Extract<Move, { type: 'place' }>;

function table(prefs: Record<string, unknown> = {}, rect = true): Mounted {
  const m = mountApp({ prefs: { howtoShown: true, ...prefs } });
  startFixtureMatch(m.app);
  m.app.setRemoteSeat(null);
  if (rect) q<SVGSVGElement>('#board').getBoundingClientRect = () => RECT as DOMRect;
  vi.advanceTimersByTime(1000);
  return m;
}

const round = (m: Mounted): GameState => m.app.getMatch()!.round;
const historyLen = (m: Mounted): number => round(m).history.length;
const lastMove = (m: Mounted): Move => round(m).history[historyLen(m) - 1]!;
const handTile = (tile: string): HTMLElement => q(`.hand-tile[data-tile="${tile}"]`);
const dragClone = (): HTMLElement | null => document.querySelector<HTMLElement>('.drag-tile');
const snappedGhost = (): string | undefined =>
  document.querySelector<SVGElement>('#board .ghost.pending')?.dataset.move;

function pointer(
  type: string,
  target: Element,
  x: number,
  y: number,
  init: PointerEventInit = {},
): void {
  target.dispatchEvent(
    new PointerEvent(type, {
      pointerId: 1,
      button: 0,
      pointerType: 'mouse',
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
}

/** Взять кость мышью и дождаться, пока автомасштаб довезёт кадр с тенями. */
function grab(tile: string, init: PointerEventInit = {}): void {
  pointer('pointerdown', handTile(tile), 400, 440, init);
  pointer('pointermove', document.body, 400, 420, init);
  vi.advanceTimersByTime(400);
}

/** Экранная точка прилипания тени — тем же правилом, что в board.ts. */
function anchor(m: Mounted, move: Move): { x: number; y: number } {
  const vb = q<SVGSVGElement>('#board').getAttribute('viewBox')!.split(' ').map(Number);
  let cell: { x: number; y: number };
  if (move.type === 'place') {
    const geo = placementGeometry(round(m), move.tile, move.endId, move.mode, move.side);
    cell =
      move.mode === 'cross'
        ? { x: (geo.cells[0].x + geo.cells[1].x) / 2, y: (geo.cells[0].y + geo.cells[1].y) / 2 }
        : geo.cells[1];
  } else {
    cell = { x: (ROOT_CELLS[0].x + ROOT_CELLS[1].x) / 2, y: (ROOT_CELLS[0].y + ROOT_CELLS[1].y) / 2 };
  }
  return {
    x: ((cell.x * CELL - vb[0]!) / vb[2]!) * RECT.width,
    y: ((cell.y * CELL - vb[1]!) / vb[3]!) * RECT.height,
  };
}

function dragTo(m: Mounted, move: Move, init: PointerEventInit = {}): void {
  const a = anchor(m, move);
  pointer('pointermove', document.body, a.x, a.y, init);
}

/** Тени выбранной кости как ходы (у поворота — обе стороны). */
const ghostMoves = (): Move[] => ghosts().map((g) => JSON.parse(g.dataset.move!) as Move);

/** Дойти до позиции, где у ходящего есть ход нужного вида; вернуть его. */
function toMove(m: Mounted, pred: (mv: Move, all: readonly Move[]) => boolean): Move {
  let found: Move | undefined;
  const ok = playUntil(m.app, (moves) => {
    found = moves.find((mv) => pred(mv, moves));
    return found !== undefined;
  });
  expect(ok).toBe(true);
  vi.advanceTimersByTime(400);
  return found!;
}

const isPlace = (mv: Move): mv is PlaceMove => mv.type === 'place';

describe('ход перетягиванием кости из руки', () => {
  beforeEach(useFakeClock);
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  it('поставил: кость идёт под указателем, прилипает к тени и ставится отпусканием', () => {
    const m = table();
    const mv = toMove(m, (x) => isPlace(x) && x.mode === 'straight') as PlaceMove;
    const n = historyLen(m);
    grab(mv.tile);
    expect(dragClone()).not.toBeNull();
    expect(handTile(mv.tile).classList.contains('incoming')).toBe(true);
    expect(handTile(mv.tile).classList.contains('selected')).toBe(true);
    expect(ghosts().length).toBeGreaterThan(0);
    expect(snappedGhost()).toBeUndefined();
    expect(dragClone()!.classList.contains('snapped')).toBe(false);

    dragTo(m, mv);
    const snapped = JSON.parse(snappedGhost()!) as PlaceMove;
    expect(snapped).toMatchObject({ tile: mv.tile, endId: mv.endId, mode: 'straight' });
    expect(dragClone()!.classList.contains('snapped')).toBe(true);
    expect(historyLen(m)).toBe(n);

    const a = anchor(m, mv);
    pointer('pointerup', document.body, a.x, a.y);
    expect(historyLen(m)).toBe(n + 1);
    expect(lastMove(m)).toMatchObject({ type: 'place', tile: mv.tile, endId: mv.endId, mode: 'straight' });
    expect(dragClone()).toBeNull();
    // Кость долетает от тени обычным клоном хода и встаёт на стол.
    expect(document.querySelector('.flying-tile.fly-place')).not.toBeNull();
    vi.advanceTimersByTime(500);
    expect(document.querySelector('.flying-tile')).toBeNull();
    expect(document.querySelector('.hand-tile.incoming')).toBeNull();
  });

  it('клик, которым браузер завершает перетягивание, ничего не нажимает', () => {
    const m = table();
    const mv = toMove(m, (x) => isPlace(x)) as PlaceMove;
    const n = historyLen(m);
    grab(mv.tile);
    const target = ghostMoves()[0]!;
    dragTo(m, target);
    const a = anchor(m, target);
    pointer('pointerup', document.body, a.x, a.y);
    expect(historyLen(m)).toBe(n + 1);
    const marked = q('#btn-mark').classList.contains('active');
    click(q('#btn-mark'));
    expect(q('#btn-mark').classList.contains('active')).toBe(marked);
    click(q('#btn-mark'));
    expect(q('#btn-mark').classList.contains('active')).toBe(!marked);
  });

  it('отлип и поставил в другой вариант: движение меняет вариант, увод отлепляет', () => {
    const m = table();
    const turn = toMove(
      m,
      (x, all) =>
        isPlace(x) &&
        x.mode === 'turn' &&
        all.some((y) => isPlace(y) && y.tile === x.tile && y.endId === x.endId && y.mode === 'straight'),
    ) as PlaceMove;
    const n = historyLen(m);
    const at = (mode: string, side?: 0 | 1): PlaceMove =>
      ghostMoves().find(
        (g) => isPlace(g) && g.endId === turn.endId && g.mode === mode && g.side === side,
      ) as PlaceMove;
    grab(turn.tile);

    dragTo(m, at('straight'));
    expect(JSON.parse(snappedGhost()!)).toMatchObject({ mode: 'straight' });
    // Не отрывая пальца — к повороту: кость перещёлкивается на него.
    dragTo(m, at('turn', 0));
    expect(JSON.parse(snappedGhost()!)).toMatchObject({ mode: 'turn', side: 0 });
    // Повторное движение у той же тени ничего не меняет.
    dragTo(m, at('turn', 0));
    expect(JSON.parse(snappedGhost()!)).toMatchObject({ mode: 'turn', side: 0 });
    // Увели от позиции — отлипла и снова идёт под пальцем.
    pointer('pointermove', document.body, -900, -900);
    expect(snappedGhost()).toBeUndefined();
    expect(dragClone()!.classList.contains('snapped')).toBe(false);
    expect(historyLen(m)).toBe(n);
    // Подвели к другой стороне поворота и отпустили.
    const other = at('turn', 1);
    dragTo(m, other);
    const a = anchor(m, other);
    pointer('pointerup', document.body, a.x, a.y);
    expect(historyLen(m)).toBe(n + 1);
    expect(lastMove(m)).toMatchObject({ type: 'place', tile: turn.tile, endId: turn.endId, mode: 'turn', side: 1 });
  });

  it('вернул в руку: отпущенная мимо теней кость улетает на своё место, ход не сделан', () => {
    const m = table();
    const mv = toMove(m, (x) => isPlace(x)) as PlaceMove;
    const n = historyLen(m);
    grab(mv.tile);
    pointer('pointermove', document.body, -900, -900);
    pointer('pointerup', document.body, -900, -900);
    expect(historyLen(m)).toBe(n);
    expect(dragClone()!.classList.contains('returning')).toBe(true);
    expect(handTile(mv.tile).classList.contains('incoming')).toBe(true);
    vi.advanceTimersByTime(250);
    expect(dragClone()).toBeNull();
    expect(handTile(mv.tile).classList.contains('incoming')).toBe(false);
    // Кость осталась выбранной, её тени на столе: ход тапом не сломан.
    expect(handTile(mv.tile).classList.contains('selected')).toBe(true);
    pointer('pointerdown', ghosts()[0]!, 5, 5);
    pointer('pointerup', ghosts()[0]!, 5, 5);
    click(ghosts()[0]!);
    expect(historyLen(m)).toBe(n + 1);
  });

  it('с подтверждением ходов: отпущенная на тень кость ждёт «Поставить»; «Отмена» снимает', () => {
    const m = table({ confirm: true });
    const mv = toMove(m, (x) => isPlace(x) && x.mode === 'straight') as PlaceMove;
    const n = historyLen(m);
    const drop = (): void => {
      grab(mv.tile);
      dragTo(m, mv);
      const a = anchor(m, mv);
      pointer('pointerup', document.body, a.x, a.y);
    };
    drop();
    expect(historyLen(m)).toBe(n);
    expect(dragClone()).toBeNull();
    expect(handTile(mv.tile).classList.contains('incoming')).toBe(false);
    expect(q('#confirm-bar').hidden).toBe(false);
    expect(JSON.parse(snappedGhost()!)).toMatchObject({ tile: mv.tile, endId: mv.endId, mode: 'straight' });
    pointer('pointerdown', q('#confirm-no'), 5, 5);
    click(q('#confirm-no'));
    expect(q('#confirm-bar').hidden).toBe(true);
    expect(historyLen(m)).toBe(n);

    drop();
    pointer('pointerdown', q('#confirm-yes'), 5, 5);
    click(q('#confirm-yes'));
    expect(historyLen(m)).toBe(n + 1);
    expect(lastMove(m)).toMatchObject({ tile: mv.tile, endId: mv.endId, mode: 'straight' });
  });

  it('корень и дубль поперёк: прилипание по центру кости', () => {
    // Корень — первым ходом партии (если у ходящего есть дубль).
    const m = table();
    const root = toMove(m, (x) => x.type === 'placeRoot' || isPlace(x));
    if (root.type === 'placeRoot') {
      grab(root.tile);
      dragTo(m, root);
      expect(JSON.parse(snappedGhost()!)).toMatchObject({ type: 'placeRoot', tile: root.tile });
      const at = anchor(m, root);
      pointer('pointerup', document.body, at.x, at.y);
      expect(lastMove(m)).toMatchObject({ type: 'placeRoot', tile: root.tile });
      vi.advanceTimersByTime(1000);
    }
    const cross = toMove(m, (x) => isPlace(x) && x.mode === 'cross') as PlaceMove;
    const n = historyLen(m);
    grab(cross.tile);
    dragTo(m, cross);
    expect(JSON.parse(snappedGhost()!)).toMatchObject({ mode: 'cross', endId: cross.endId });
    const a = anchor(m, cross);
    pointer('pointerup', document.body, a.x, a.y);
    expect(historyLen(m)).toBe(n + 1);
    expect(lastMove(m)).toMatchObject({ type: 'place', tile: cross.tile, mode: 'cross' });
  });

  it('кость ложится на тень нужной стороной: тень «наоборот» — клон довёрнут на пол-оборота', () => {
    const m = table();
    const rotation = (transform: string): number => Number(/rotate\(([-\d.]+)/.exec(transform)![1]);
    const turned = (): number => {
      const ghost = rotation(document.querySelector('#board .ghost.pending')!.getAttribute('transform')!);
      return (((rotation(dragClone()!.style.transform) - ghost) % 360) + 360) % 360;
    };
    // Приставная половина — старшее число кости: клон лежит как тень.
    const hi = toMove(
      m,
      (x) => isPlace(x) && x.mode === 'straight' && placementGeometry(round(m), x.tile, x.endId, x.mode).values[0] > placementGeometry(round(m), x.tile, x.endId, x.mode).values[1],
    ) as PlaceMove;
    grab(hi.tile);
    dragTo(m, hi);
    expect(turned()).toBe(0);
    const a = anchor(m, hi);
    pointer('pointerup', document.body, a.x, a.y);
    vi.advanceTimersByTime(1000);
    // Приставная половина — младшее: клон несёт старшее первым и довёрнут.
    const lo = toMove(
      m,
      (x) => isPlace(x) && x.mode === 'straight' && placementGeometry(round(m), x.tile, x.endId, x.mode).values[0] < placementGeometry(round(m), x.tile, x.endId, x.mode).values[1],
    ) as PlaceMove;
    grab(lo.tile);
    dragTo(m, lo);
    expect(turned()).toBe(180);
  });

  it('палец: вдоль ряда — прокрутка руки, поперёк — кость (держится в стороне стола от пальца)', () => {
    const m = table();
    // Ход первого игрока — его рука снизу.
    const mv = toMove(m, (x) => isPlace(x) && round(m).current === 0) as PlaceMove;
    const touch = { pointerType: 'touch' };
    pointer('pointerdown', handTile(mv.tile), 400, 440, touch);
    pointer('pointermove', document.body, 430, 442, touch);
    expect(dragClone()).toBeNull();
    // Жест отдан прокрутке: дальнейшее движение кость уже не берёт.
    pointer('pointermove', document.body, 430, 300, touch);
    expect(dragClone()).toBeNull();
    pointer('pointerup', document.body, 430, 300, touch);

    pointer('pointerdown', handTile(mv.tile), 400, 440, touch);
    pointer('pointermove', document.body, 402, 436, touch);
    expect(dragClone()).toBeNull();
    pointer('pointermove', document.body, 402, 400, touch);
    expect(dragClone()).not.toBeNull();
    // Кость ходящего снизу держится выше пальца…
    const lifted = (y: number): boolean => dragClone()!.style.transform.includes(`${(y - 22).toFixed(1)}px)`);
    expect(lifted(400 - 34)).toBe(true);
    // …и прилипает по своему центру, а не по точке касания.
    vi.advanceTimersByTime(400);
    const a = anchor(m, ghostMoves()[0]!);
    pointer('pointermove', document.body, a.x, a.y + 34, touch);
    expect(snappedGhost()).toBe(ghosts()[0]!.dataset.move);
    // Система отменила жест — кость возвращается в руку, хода нет.
    const n = historyLen(m);
    pointer('pointercancel', document.body, a.x, a.y, touch);
    expect(historyLen(m)).toBe(n);
    expect(snappedGhost()).toBeUndefined();
    vi.advanceTimersByTime(250);
    expect(dragClone()).toBeNull();
  });

  it('кость верхнего игрока палец держит ниже себя', () => {
    const m = table();
    // Ход второго игрока — его рука сверху.
    const mv = toMove(m, (x) => isPlace(x) && round(m).current === 1) as PlaceMove;
    const touch = { pointerType: 'pen' };
    pointer('pointerdown', handTile(mv.tile), 400, 20, touch);
    pointer('pointermove', document.body, 400, 60, touch);
    expect(dragClone()!.style.transform).toContain(`${(60 + 34 - 22).toFixed(1)}px)`);
    pointer('pointerup', document.body, 400, 60, touch);
  });

  it('кость без хода не берётся — покачивается; чужая и в чужой ход — не реагирует', () => {
    const m = table();
    toMove(m, (x, all) => {
      const tiles = new Set(all.filter(isPlace).map((y) => y.tile));
      return isPlace(x) && tiles.size < round(m).hands[round(m).current].length;
    });
    const dimmed = q('.hand-tile.dimmed[data-tile]');
    pointer('pointerdown', dimmed, 400, 440);
    pointer('pointermove', document.body, 400, 400);
    expect(dragClone()).toBeNull();
    expect(dimmed.classList.contains('wiggle')).toBe(true);
    pointer('pointerup', document.body, 400, 400);

    // Кость соперника (не его ход).
    const foe = q(`.hand-tile[data-player="${1 - round(m).current}"]`);
    pointer('pointerdown', foe, 400, 20);
    pointer('pointermove', document.body, 400, 200);
    expect(dragClone()).toBeNull();
    pointer('pointerup', document.body, 400, 200);

    // Правая кнопка и нажатие мимо руки — не перетягивание.
    const mine = q('.hand-tile.playable[data-tile]');
    pointer('pointerdown', mine, 400, 440, { button: 2 });
    pointer('pointermove', document.body, 400, 300);
    pointer('pointerdown', q('#board'), 400, 200);
    pointer('pointermove', document.body, 400, 300);
    pointer('pointerup', document.body, 400, 300);
    expect(dragClone()).toBeNull();

    // Ход соперника за внешним местом: своя рука не отвечает.
    m.app.setRemoteSeat(round(m).current);
    pointer('pointerdown', q('.hand-tile[data-tile]'), 400, 440);
    pointer('pointermove', document.body, 400, 300);
    expect(dragClone()).toBeNull();
    expect(historyLen(m)).toBeGreaterThan(0);
  });

  it('нажатие без движения остаётся тапом; чужой указатель жесту не мешает', () => {
    const m = table();
    const mv = toMove(m, (x, all) => isPlace(x) && new Set(all.filter(isPlace).map((y) => y.tile)).size >= 2) as PlaceMove;
    const other = legalMoves(round(m)).filter(isPlace).find((x) => x.tile !== mv.tile)!;
    pointer('pointerdown', handTile(other.tile), 400, 440);
    pointer('pointermove', document.body, 401, 441);
    pointer('pointerup', document.body, 401, 441);
    click(handTile(other.tile));
    expect(handTile(other.tile).classList.contains('selected')).toBe(true);
    expect(dragClone()).toBeNull();

    grab(mv.tile);
    // Второй палец: его нажатие, движение и отпускание первого жеста не касаются.
    pointer('pointerdown', handTile(other.tile), 300, 440, { pointerId: 2 });
    pointer('pointermove', document.body, 300, 100, { pointerId: 2 });
    pointer('pointerup', document.body, 300, 100, { pointerId: 2 });
    pointer('pointercancel', document.body, 300, 100, { pointerId: 2 });
    expect(dragClone()).not.toBeNull();
    expect(handTile(mv.tile).classList.contains('incoming')).toBe(true);
    pointer('pointerup', document.body, -900, -900);
    vi.advanceTimersByTime(250);
    expect(dragClone()).toBeNull();
  });

  it('позиция сменилась под рукой — перетягивание бросается', () => {
    const m = table();
    const mv = toMove(m, (x) => isPlace(x)) as PlaceMove;
    // Нажали на кость, а ход тем временем пришёл извне: брать уже нечего.
    pointer('pointerdown', handTile(mv.tile), 400, 440);
    m.app.dispatch(mv);
    pointer('pointermove', document.body, 400, 300);
    expect(dragClone()).toBeNull();
    pointer('pointerup', document.body, 400, 300);
    vi.advanceTimersByTime(1000);

    // Кость уже под пальцем, и тут ход сделан извне — клон убран, рука цела.
    const next = toMove(m, (x) => isPlace(x)) as PlaceMove;
    grab(next.tile);
    expect(dragClone()).not.toBeNull();
    m.app.dispatch(next);
    expect(dragClone()).toBeNull();
    expect(document.querySelector('.hand-tile.incoming')).toBeNull();
    const n = historyLen(m);
    pointer('pointermove', document.body, 400, 100);
    pointer('pointerup', document.body, 400, 100);
    expect(historyLen(m)).toBe(n);
  });

  it('стол ещё не свёрстан или захват недоступен — кость просто возвращается', () => {
    const m = table({}, false);
    const mv = toMove(m, (x) => isPlace(x)) as PlaceMove;
    const n = historyLen(m);
    Element.prototype.setPointerCapture = () => {
      throw new Error('нет активного указателя');
    };
    grab(mv.tile);
    expect(dragClone()).not.toBeNull();
    pointer('pointermove', document.body, 0, 0);
    expect(snappedGhost()).toBeUndefined();
    pointer('pointerup', document.body, 0, 0);
    expect(historyLen(m)).toBe(n);
    vi.advanceTimersByTime(250);
    expect(dragClone()).toBeNull();
  });
});
