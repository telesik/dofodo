// @vitest-environment jsdom
// Бейдж общего счёта у имени игрока показывает и цель матча — «43/100»
// (telesik-team#112, постановка автора 20.09.2026): цель — порог проигрыша
// (§10.5), в самой партии до этого её было не видно.
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import indexHtml from '../index.html?raw';
import { initApp } from '../src/ui/app';
import { L, LOCALES, setLocale } from '../src/ui/i18n';

function makeStorage() {
  const mem = new Map<string, string>();
  return {
    get: (k: string) => mem.get(k) ?? null,
    set: (k: string, v: string) => void mem.set(k, v),
    remove: (k: string) => void mem.delete(k),
  };
}

function chips(): string[] {
  return [...document.querySelectorAll<HTMLElement>('.hand .total-chip')].map((c) =>
    c.textContent!.trim(),
  );
}

describe('цель матча рядом со счётом в партии', () => {
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

  it('каноническая цель 100 показывается всегда: «0/100» у обоих игроков', () => {
    const app = initApp({ storage: makeStorage() });
    app.startRemoteMatch({
      names: ['А', 'Б'],
      first: 0,
      variant: { doubleOnlyCloses: false },
      seed: 7,
      remoteSeat: 1,
    });
    expect(chips()).toEqual(['0/100', '0/100']);
    const goal = document.querySelector<HTMLElement>('.hand .total-chip .total-goal');
    expect(goal?.textContent).toBe('/100');
  });

  it('выбранная цель 150 попадает в бейдж, счёт — перед ней', () => {
    const app = initApp({ storage: makeStorage() });
    app.startRemoteMatch({
      names: ['А', 'Б'],
      first: 0,
      variant: { doubleOnlyCloses: false, target: 150 },
      seed: 7,
      remoteSeat: 1,
    });
    expect(chips()).toEqual(['0/150', '0/150']);
  });

  it('подсказка бейджа упоминает цель во всех словарях', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      // Подсказка говорит о цели и о том, что её набравший проигрывает,
      // со ссылкой на параграф правил — во всех языках одна формула.
      const tip = L().tipTotal;
      expect(tip, code).toContain('§10.5');
      expect(tip, code).toMatch(/—|——/);
    }
    setLocale('ru');
  });
});
