// @vitest-environment jsdom
// Рука всегда вертикальна (идея 0035 штаба): переключателя «кости в руке
// горизонтально» в настройках больше нет, старое сохранённое значение
// handsVertical:false игнорируется без падений и не переписывается обратно.
import { afterEach, describe, expect, it } from 'vitest';
import { L, LOCALES, setLocale } from '../src/ui/i18n';
import { click, mountApp, readPrefs, startFixtureMatch, unmountApps } from './dom-helpers';

describe('рука всегда вертикальна', () => {
  afterEach(unmountApps);

  it('старые настройки с handsVertical:false не мешают старту, переключателя нет', () => {
    // Настройки сборки до 07.09.2026: горизонтальная рука и выключенный звук.
    const { app, storage } = mountApp({ prefs: { handsVertical: false, sound: false, locale: 'ru' } });
    expect(app.getMatch()).toBeNull();
    click(document.getElementById('btn-settings'));
    const toggles = [...document.querySelectorAll<HTMLInputElement>('#settings input[data-set]')].map(
      (i) => i.dataset.set,
    );
    expect(toggles).toContain('sound');
    expect(toggles).not.toContain('hands');

    // Кости в руке стоят вертикально: узкая сторона по горизонтали.
    startFixtureMatch(app);
    const svgs = document.querySelectorAll<SVGSVGElement>('#hand-bottom .hand-tile svg.tile-svg');
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) {
      expect(Number(svg.getAttribute('width'))).toBeLessThan(Number(svg.getAttribute('height')));
    }

    // Сохранённые настройки больше не содержат ключа ориентации.
    click(document.querySelector('#settings input[data-set="sound"]'));
    expect('handsVertical' in readPrefs(storage)).toBe(false);
  });

  it('строки tipOrient нет ни в одном словаре', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      expect('tipOrient' in L()).toBe(false);
    }
    setLocale('ru');
  });
});
