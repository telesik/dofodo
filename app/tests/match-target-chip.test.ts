// @vitest-environment jsdom
// Бейдж общего счёта у имени игрока показывает и цель матча — «43/100»
// (telesik-team#112, постановка автора 20.09.2026): цель — порог проигрыша
// (§10.5), в самой партии до этого её было не видно.
import { afterEach, describe, expect, it } from 'vitest';
import { L, LOCALES, setLocale } from '../src/ui/i18n';
import { mountApp, startFixtureMatch, unmountApps } from './dom-helpers';

function chips(): string[] {
  return [...document.querySelectorAll<HTMLElement>('.hand .total-chip')].map((c) =>
    c.textContent!.trim(),
  );
}

describe('цель матча рядом со счётом в партии', () => {
  afterEach(unmountApps);

  it('каноническая цель 100 показывается всегда: «0/100» у обоих игроков', () => {
    const { app } = mountApp();
    startFixtureMatch(app);
    expect(chips()).toEqual(['0/100', '0/100']);
    const goal = document.querySelector<HTMLElement>('.hand .total-chip .total-goal');
    expect(goal?.textContent).toBe('/100');
  });

  it('выбранная цель 150 попадает в бейдж, счёт — перед ней', () => {
    const { app } = mountApp();
    startFixtureMatch(app, { variant: { doubleOnlyCloses: false, target: 150 } });
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
