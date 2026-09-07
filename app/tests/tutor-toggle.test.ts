// @vitest-environment jsdom
// Галочка «показывать правила игры» внизу подсказки обучения: снять её —
// то же, что выключить режим обучения в настройках (решение автора
// 07.09.2026): панель прячется, tutor:false и tutorAsked:true в prefs.
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import indexHtml from '../index.html?raw';
import { initApp } from '../src/ui/app';

const LS_UI_KEY = 'bonesai-ui-v1';

function makeStorage(initial: Record<string, string> = {}) {
  const mem = new Map(Object.entries(initial));
  return {
    mem,
    get: (k: string) => mem.get(k) ?? null,
    set: (k: string, v: string) => void mem.set(k, v),
    remove: (k: string) => void mem.delete(k),
  };
}

describe('галочка «показывать правила игры» в подсказке', () => {
  beforeAll(() => {
    (globalThis as { matchMedia?: unknown }).matchMedia = () => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    Element.prototype.scrollTo = () => undefined;
  });
  beforeEach(() => {
    const body = /<body>([\s\S]*)<\/body>/.exec(indexHtml)?.[1] ?? '';
    document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/g, '');
  });

  it('панель с галочкой видна в партии; снятие прячет панель и пишет prefs', () => {
    const storage = makeStorage({ [LS_UI_KEY]: JSON.stringify({ roundsDone: 1, locale: 'ru' }) });
    const app = initApp({ storage });
    app.startRemoteMatch({
      names: ['А', 'Б'],
      first: 0,
      variant: { doubleOnlyCloses: false },
      seed: 7,
      remoteSeat: 1,
    });
    const bar = document.getElementById('tutor-bar') as HTMLElement;
    expect(bar.hidden).toBe(false);
    const cb = bar.querySelector<HTMLInputElement>('[data-tutor-toggle]');
    expect(cb?.checked).toBe(true);
    expect(bar.textContent).toContain('показывать правила игры');

    cb!.checked = false;
    cb!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(bar.hidden).toBe(true);
    const saved = JSON.parse(storage.mem.get(LS_UI_KEY) ?? '{}') as Record<string, unknown>;
    expect(saved.tutor).toBe(false);
    expect(saved.tutorAsked).toBe(true);
  });

  it('при выключенном режиме панели нет', () => {
    const storage = makeStorage({ [LS_UI_KEY]: JSON.stringify({ tutor: false }) });
    const app = initApp({ storage });
    app.startRemoteMatch({
      names: ['А', 'Б'],
      first: 0,
      variant: { doubleOnlyCloses: false },
      seed: 7,
      remoteSeat: 1,
    });
    expect((document.getElementById('tutor-bar') as HTMLElement).hidden).toBe(true);
  });
});
