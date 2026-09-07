// @vitest-environment jsdom
// «Как играть» один раз после установки (идея 0038 штаба, решение автора
// 07.09.2026): без сохранённых настроек поверх карточки — вопрос «Показать,
// как играть?»; «Показать» открывает слайды, «Позже» — нет; любой ответ
// пишет флаг, и следующий запуск вопроса не задаёт; у игравших раньше
// (настройки есть, флага нет) обучение не навязывается.
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

const howto = (): HTMLElement | null => document.getElementById('howto');
const ask = (): HTMLElement | null => document.getElementById('howto-ask');

describe('«Как играть» при первом запуске', () => {
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

  it('без сохранённых настроек — вопрос, не слайды; «Показать» открывает слайды и пишет флаг', () => {
    const storage = makeStorage();
    initApp({ storage });
    expect(ask()).not.toBeNull();
    expect(howto()).toBeNull();
    expect(document.querySelector('#btn-start, [data-action="lots"]')).not.toBeNull();

    ask()?.querySelector<HTMLElement>('[data-howto="show"]')?.click();
    expect(ask()).toBeNull();
    expect(howto()).not.toBeNull();
    const saved = JSON.parse(storage.mem.get(LS_UI_KEY) ?? '{}') as Record<string, unknown>;
    expect(saved.howtoShown).toBe(true);
  });

  it('«Позже» закрывает вопрос без слайдов и тоже пишет флаг', () => {
    const storage = makeStorage();
    initApp({ storage });
    ask()?.querySelector<HTMLElement>('[data-howto="later"]')?.click();
    expect(ask()).toBeNull();
    expect(howto()).toBeNull();
    const saved = JSON.parse(storage.mem.get(LS_UI_KEY) ?? '{}') as Record<string, unknown>;
    expect(saved.howtoShown).toBe(true);
  });

  it('после закрытия следующий запуск обучение не показывает', () => {
    const storage = makeStorage({ [LS_UI_KEY]: JSON.stringify({ howtoShown: true }) });
    initApp({ storage });
    expect(ask()).toBeNull();
    expect(howto()).toBeNull();
  });

  it('игравшим раньше (настройки есть, флага нет) обучение не навязывается', () => {
    const storage = makeStorage({ [LS_UI_KEY]: JSON.stringify({ roundsDone: 3, sound: false }) });
    initApp({ storage });
    expect(ask()).toBeNull();
    expect(howto()).toBeNull();
  });

  it('ссылка «Как играть» на карточке работает как раньше; у игравших флаг уже считается стоящим', () => {
    const storage = makeStorage({ [LS_UI_KEY]: JSON.stringify({ roundsDone: 3 }) });
    initApp({ storage });
    document.querySelector<HTMLElement>('[data-action="howto"]')?.click();
    expect(howto()).not.toBeNull();
    howto()?.querySelector<HTMLElement>('[data-howto="skip"]')?.click();
    const saved = JSON.parse(storage.mem.get(LS_UI_KEY) ?? '{}') as Record<string, unknown>;
    expect(howto()?.hidden ?? true).toBe(true);
    expect(saved.howtoShown ?? true).toBe(true);
    expect(saved.roundsDone).toBe(3);
  });
});
