// @vitest-environment jsdom
// Панорама и зум стола указателем (telesik-team#115): драг одним пальцем
// выключает автомасштаб, щипок двумя и колесо меняют масштаб вокруг точки,
// двойной клик возвращает автомасштаб; клик по тени — не драг. jsdom
// геометрии не считает, поэтому прямоугольник стола подменяется.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { legalMoves } from '../src/engine';
import {
  click,
  mountApp,
  playUntil,
  q,
  readPrefs,
  startFixtureMatch,
  unmountApps,
  useFakeClock,
  type Mounted,
} from './dom-helpers';

const RECT = { left: 0, top: 0, right: 800, bottom: 450, width: 800, height: 450, x: 0, y: 0, toJSON: () => ({}) };

function viewBox(): number[] {
  return q<SVGSVGElement>('#board').getAttribute('viewBox')!.split(' ').map(Number);
}

function pointer(type: string, id: number, x: number, y: number, button = 0): void {
  q('#board').dispatchEvent(
    new PointerEvent(type, { pointerId: id, button, clientX: x, clientY: y, bubbles: true, cancelable: true }),
  );
}

function table(): Mounted {
  const m = mountApp({ prefs: { howtoShown: true } });
  startFixtureMatch(m.app);
  m.app.setRemoteSeat(null);
  q<SVGSVGElement>('#board').getBoundingClientRect = () => RECT as DOMRect;
  vi.advanceTimersByTime(1000);
  return m;
}

describe('стол: панорама и зум', () => {
  beforeEach(useFakeClock);
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  it('драг сдвигает кадр и выключает автомасштаб; двойной клик возвращает', () => {
    const m = table();
    const vb0 = viewBox();
    pointer('pointerdown', 1, 100, 100);
    pointer('pointermove', 1, 160, 130);
    pointer('pointerup', 1, 160, 130);
    const vb1 = viewBox();
    expect(vb1[0]).toBeLessThan(vb0[0]!);
    expect(vb1[1]).toBeLessThan(vb0[1]!);
    expect(vb1[2]).toBe(vb0[2]);
    expect(q('#btn-fit').classList.contains('active')).toBe(false);
    expect(readPrefs(m.storage).autoFit).toBe(false);

    q('#board').dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: 300, clientY: 200 }));
    expect(q('#btn-fit').classList.contains('active')).toBe(true);
    expect(readPrefs(m.storage).autoFit).toBe(true);
  });

  it('сдвиг меньше порога — не драг: автомасштаб на месте, клик по тени проходит', () => {
    const m = table();
    expect(playUntil(m.app, (moves) => moves.some((mv) => 'tile' in mv))).toBe(true);
    vi.advanceTimersByTime(400);
    click(q('.hand-tile.playable[data-tile]'));
    const ghost = q<SVGElement>('#board [data-move]');
    pointer('pointerdown', 1, 100, 100);
    pointer('pointermove', 1, 101, 101);
    pointer('pointerup', 1, 101, 101);
    expect(q('#btn-fit').classList.contains('active')).toBe(true);
    // Нажатие на тень захват не берёт — драг не начинается.
    ghost.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, button: 0, clientX: 10, clientY: 10, bubbles: true }));
    pointer('pointermove', 2, 300, 300);
    pointer('pointerup', 2, 300, 300);
    expect(q('#btn-fit').classList.contains('active')).toBe(true);
    const n = m.app.getMatch()!.round.history.length;
    click(q('#board [data-move]'));
    expect(m.app.getMatch()!.round.history.length).toBe(n + 1);
  });

  it('правая кнопка и отмена указателя ничего не ломают', () => {
    table();
    const vb0 = viewBox();
    pointer('pointerdown', 1, 100, 100, 2);
    pointer('pointermove', 1, 200, 200);
    pointer('pointercancel', 1, 200, 200);
    expect(viewBox()).toEqual(vb0);
    expect(q('#btn-fit').classList.contains('active')).toBe(true);
    // Движение без нажатия — тоже ничего.
    pointer('pointermove', 7, 200, 200);
    expect(viewBox()).toEqual(vb0);
  });

  it('колесо масштабирует вокруг курсора и выключает автомасштаб', () => {
    table();
    const vb0 = viewBox();
    q('#board').dispatchEvent(new WheelEvent('wheel', { deltaY: 100, clientX: 400, clientY: 225, bubbles: true, cancelable: true }));
    const vb1 = viewBox();
    expect(vb1[2]).toBeGreaterThan(vb0[2]!);
    expect(q('#btn-fit').classList.contains('active')).toBe(false);
    q('#board').dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: 400, clientY: 225, bubbles: true, cancelable: true }));
    expect(viewBox()[2]).toBeLessThan(vb1[2]!);
  });

  it('щипок двумя пальцами меняет масштаб; третий палец игнорируется; отпускание одного — без прыжка', () => {
    table();
    const vb0 = viewBox();
    pointer('pointerdown', 1, 300, 200);
    pointer('pointerdown', 2, 500, 200);
    pointer('pointerdown', 3, 400, 300);
    pointer('pointermove', 2, 600, 200);
    const vb1 = viewBox();
    expect(vb1[2]).toBeLessThan(vb0[2]!);
    expect(q('#btn-fit').classList.contains('active')).toBe(false);
    // Пальцы сошлись вплотную — шаг пропускается.
    pointer('pointermove', 1, 600, 200);
    pointer('pointermove', 2, 600, 200);
    pointer('pointerup', 3, 400, 300);
    pointer('pointerup', 2, 600, 200);
    const vb2 = viewBox();
    pointer('pointermove', 1, 100, 100);
    expect(viewBox()).toEqual(vb2);
    pointer('pointerup', 1, 100, 100);
    // Следующий драг начинается заново.
    pointer('pointerdown', 4, 100, 100);
    pointer('pointermove', 4, 200, 200);
    pointer('pointerup', 4, 200, 200);
    expect(viewBox()[0]).not.toBe(vb2[0]);
  });

  it('автомасштаб не прячет дерево под кучей базара: кадр расширяется, пока фигура пересекает кучу', () => {
    const m = table();
    // Куча занимает правый нижний угол стола; фигура в центре кадра её
    // задевает — кадр растёт на 9 % за шаг, пока пересечение не исчезнет.
    q('#boneyard').getBoundingClientRect = () =>
      ({ left: 200, top: 100, right: 800, bottom: 450, width: 600, height: 350, x: 200, y: 100, toJSON: () => ({}) }) as DOMRect;
    const vb0 = viewBox();
    m.app.render();
    click(q('#btn-fit'));
    click(q('#btn-fit'));
    expect(viewBox()[2]).toBeGreaterThan(vb0[2]!);
  });

  it('при выключенном автомасштабе кость доводится в кадр после хода; зеркало отражает кадр на месте', () => {
    const m = table();
    click(q('#btn-fit'));
    expect(q('#btn-fit').classList.contains('active')).toBe(false);
    // Уводим кадр далеко, чтобы кость оказалась за краем.
    pointer('pointerdown', 1, 100, 100);
    pointer('pointermove', 1, 700, 400);
    pointer('pointerup', 1, 700, 400);
    const vbFar = viewBox();
    m.app.dispatch(legalMoves(m.app.getMatch()!.round)[0]!);
    // Довод — плавный: кадр тянется по кадрам анимации.
    vi.advanceTimersByTime(400);
    expect(viewBox()).not.toEqual(vbFar);

    const vb = viewBox();
    click(q('#btn-mirror'));
    const mirrored = viewBox();
    expect(mirrored[0]).toBeCloseTo(-(vb[0]! + vb[2]!), 3);
    expect(mirrored[2]).toBe(vb[2]);
  });
});
