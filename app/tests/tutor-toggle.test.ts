// @vitest-environment jsdom
// Галочка «показывать правила игры» внизу подсказки обучения: снять её —
// то же, что выключить режим обучения в настройках (решение автора
// 07.09.2026): панель прячется, tutor:false и tutorAsked:true в prefs.
import { afterEach, describe, expect, it } from 'vitest';
import { mountApp, readPrefs, startFixtureMatch, unmountApps } from './dom-helpers';

describe('галочка «показывать правила игры» в подсказке', () => {
  afterEach(unmountApps);

  it('панель с галочкой видна в партии; снятие прячет панель и пишет prefs', () => {
    const { app, storage } = mountApp({ prefs: { roundsDone: 1, locale: 'ru' } });
    startFixtureMatch(app);
    const bar = document.getElementById('tutor-bar') as HTMLElement;
    expect(bar.hidden).toBe(false);
    const cb = bar.querySelector<HTMLInputElement>('[data-tutor-toggle]');
    expect(cb?.checked).toBe(true);
    expect(bar.textContent).toContain('показывать правила игры');

    cb!.checked = false;
    cb!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(bar.hidden).toBe(true);
    const saved = readPrefs(storage);
    expect(saved.tutor).toBe(false);
    expect(saved.tutorAsked).toBe(true);
  });

  it('при выключенном режиме панели нет', () => {
    const { app } = mountApp({ prefs: { tutor: false } });
    startFixtureMatch(app);
    expect((document.getElementById('tutor-bar') as HTMLElement).hidden).toBe(true);
  });
});
