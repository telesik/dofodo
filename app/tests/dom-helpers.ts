// Помощники jsdom-тестов приложения (telesik-team#115): одно место для
// заглушек окружения, монтирования index.html, хранилища на Map и
// фикстуры матча — раньше пять файлов повторяли их дословно.
//
// Файл — не тест: прагма `@vitest-environment jsdom` стоит в тестах,
// которые его импортируют.

import { vi } from 'vitest';
import indexHtml from '../index.html?raw';
import { legalMoves, type Move, type Variant } from '../src/engine';
import { initApp, type AppHandle, type AppOptions, type KVStore } from '../src/ui/app';

/** Ключи localStorage приложения (app.ts их не экспортирует — идентификаторы
 *  неизменяемы, см. правило 06.09.2026 про старое имя). */
export const LS_UI_KEY = 'bonesai-ui-v1';
export const LS_KEY = 'bonesai-match-v1';

export interface MemStore extends KVStore {
  readonly mem: Map<string, string>;
}

/** Хранилище на Map: get/set/remove как у localStorage, содержимое — на виду. */
export function makeStorage(initial: Record<string, string> = {}): MemStore {
  const mem = new Map(Object.entries(initial));
  return {
    mem,
    get: (k) => mem.get(k) ?? null,
    set: (k, v) => void mem.set(k, v),
    remove: (k) => void mem.delete(k),
  };
}

/** Сохранённые настройки интерфейса из хранилища (пустой объект, если нет). */
export function readPrefs(storage: MemStore): Record<string, unknown> {
  return JSON.parse(storage.mem.get(LS_UI_KEY) ?? '{}') as Record<string, unknown>;
}

/** Заглушки того, чего в jsdom нет: matchMedia (board.ts спрашивает про
 *  «pointer: coarse»), scrollTo у элементов (рука прокручивается к ходу),
 *  захват указателя (панорама стола). Идемпотентно. */
export function installDomStubs(): void {
  (globalThis as { matchMedia?: unknown }).matchMedia = () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });
  Element.prototype.scrollTo = () => undefined;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
}

// index.html читается через Vite (?raw), а не node:fs: tsc в CI проверяет
// и тесты, а типов Node в зависимостях веба нет (урок деплоя 07.09.2026).
export function mountIndexHtml(): void {
  const body = /<body>([\s\S]*)<\/body>/.exec(indexHtml)?.[1] ?? '';
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/g, '');
}

type Listener = readonly [EventTarget, string, EventListenerOrEventListenerObject, unknown];

/** Слушатели document/window, навешанные initApp: каждый initApp в одном
 *  файле добавлял бы свой обработчик кликов на общий document, и старые
 *  экземпляры реагировали бы на клики по новому DOM. Снимаются в unmountApps. */
const mounted: Listener[][] = [];

export interface MountOptions extends Omit<AppOptions, 'storage'> {
  /** Начальные настройки интерфейса (пишутся в LS_UI_KEY до старта). */
  readonly prefs?: Record<string, unknown>;
  /** Начальное содержимое хранилища целиком (ключ → строка). */
  readonly stored?: Record<string, string>;
  /** Готовое хранилище (например, чтобы наблюдать за ним из теста). */
  readonly storage?: MemStore;
  /** Не передавать хранилище вовсе — приложение возьмёт localStorage jsdom. */
  readonly noStorage?: boolean;
}

export interface Mounted {
  readonly app: AppHandle;
  readonly storage: MemStore;
}

/**
 * Смонтировать приложение в чистый DOM: заглушки, index.html, хранилище,
 * initApp. Слушатели, добавленные на document и window за время initApp,
 * запоминаются — см. unmountApps.
 */
export function mountApp(opts: MountOptions = {}): Mounted {
  installDomStubs();
  mountIndexHtml();
  const { prefs, stored, storage: given, noStorage, ...appOpts } = opts;
  const storage = given ?? makeStorage(stored);
  if (prefs) storage.mem.set(LS_UI_KEY, JSON.stringify(prefs));

  const added: Listener[] = [];
  const patch = (target: EventTarget): (() => void) => {
    const orig = target.addEventListener;
    target.addEventListener = function (this: EventTarget, type: string, fn: EventListenerOrEventListenerObject | null, o?: unknown) {
      if (fn) added.push([target, type, fn, o]);
      return orig.call(this, type, fn, o as AddEventListenerOptions | undefined);
    } as typeof target.addEventListener;
    return () => {
      target.addEventListener = orig;
    };
  };
  const restore = [patch(document), patch(window)];
  try {
    const app = initApp(noStorage ? appOpts : { ...appOpts, storage });
    mounted.push(added);
    return { app, storage };
  } finally {
    for (const r of restore) r();
  }
}

/** Снять слушатели всех смонтированных приложений и погасить их таймеры.
 *  Ставить в afterEach каждого файла, где initApp зовётся больше одного раза. */
export function unmountApps(): void {
  for (const list of mounted.splice(0)) {
    for (const [target, type, fn, o] of list) {
      target.removeEventListener(type, fn, o as EventListenerOptions | undefined);
    }
  }
  if (vi.isFakeTimers()) vi.clearAllTimers();
}

/** Фикстура матча с внешним игроком за вторым местом: общий seed, первый
 *  ходит нижний игрок. Одна на все тесты — раньше семь копий. */
export const FIXTURE = {
  names: ['А', 'Б'] as [string, string],
  first: 0 as const,
  variant: { doubleOnlyCloses: false } as Variant,
  seed: 7,
  remoteSeat: 1 as const,
};

export function startFixtureMatch(
  app: AppHandle,
  over: Partial<{ variant: Variant; seed: number; remoteSeat: 0 | 1; first: 0 | 1 }> = {},
): void {
  app.startRemoteMatch({ ...FIXTURE, ...over });
}

/** Доиграть текущую партию первым легальным ходом до конца (внешними
 *  ходами — место за столом не важно). Таймер показа итогов (1100 мс)
 *  прокручивается, если в тесте включены fake timers. */
export function playRoundToEnd(app: AppHandle): void {
  for (let i = 0; i < 400; i++) {
    const m = app.getMatch();
    if (!m || m.round.phase === 'over') break;
    app.dispatch(legalMoves(m.round)[0]!);
  }
  if (app.getMatch()?.round.phase !== 'over') throw new Error('Партия не завершилась за 400 ходов');
  if (vi.isFakeTimers()) vi.runOnlyPendingTimers();
}

/** Ходить первым легальным ходом, пока позиция не удовлетворит условию
 *  (или партия не кончится). Возвращает, нашлась ли позиция. */
export function playUntil(app: AppHandle, pred: (moves: readonly Move[]) => boolean): boolean {
  for (let i = 0; i < 400; i++) {
    const m = app.getMatch();
    if (!m || m.round.phase === 'over') return false;
    const moves = legalMoves(m.round);
    if (pred(moves)) return true;
    app.dispatch(moves[0]!);
  }
  return false;
}

/**
 * Клик с координатами вне экрана. Обработчик кликов приложения считает
 * клик мимо контролов в границах кучи базара добором; в jsdom все
 * прямоугольники нулевые, и клик в (0, 0) — точке по умолчанию у
 * element.click() — попадает «в кучу». Отрицательные координаты — мимо.
 */
export function click(el: Element | null | undefined, init: MouseEventInit = {}): void {
  if (!el) throw new Error('click: элемента нет');
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: -9, clientY: -9, ...init }));
}

export function q<T extends Element = HTMLElement>(sel: string): T {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`Нет элемента ${sel}`);
  return el;
}

/** Событие change/input на поле с новым значением. */
export function setValue(sel: string, value: string, type: 'change' | 'input' = 'change'): void {
  const el = q<HTMLInputElement | HTMLSelectElement>(sel);
  el.value = value;
  el.dispatchEvent(new Event(type, { bubbles: true }));
}

/**
 * Поддельные часы целиком: таймеры, Date, performance.now (гейты 300/350 мс
 * в app.ts) и кадры анимации (полёт кости, твин кадра стола) — иначе
 * advanceTimersByTime не доводит полёт до конца.
 */
export function useFakeClock(): void {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'Date',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  });
}

/** Тени ходов на столе. После каждого рендера SVG строится заново —
 *  ссылки на прежние элементы протухают, запрашивать каждый раз. */
export function ghosts(): SVGElement[] {
  return [...document.querySelectorAll<SVGElement>('#board [data-move]')];
}

/** Тень с тем же ходом (по JSON в data-move) в свежем DOM. */
export function ghostByMove(json: string): SVGElement {
  const g = ghosts().find((el) => el.dataset.move === json);
  if (!g) throw new Error(`Нет тени для ${json}`);
  return g;
}

export function toastText(): string {
  const t = q('#toast');
  return t.hidden ? '' : (t.textContent ?? '');
}
