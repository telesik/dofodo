// @vitest-environment jsdom
// «Как играть» один раз после установки (идея 0038 штаба, решение автора
// 07.09.2026): без сохранённых настроек поверх карточки — вопрос «Показать,
// как играть?»; «Показать» открывает слайды, «Позже» — нет; любой ответ
// пишет флаг, и следующий запуск вопроса не задаёт; у игравших раньше
// (настройки есть, флага нет) обучение не навязывается.
import { afterEach, describe, expect, it } from 'vitest';
import { click, mountApp, readPrefs, unmountApps } from './dom-helpers';

const howto = (): HTMLElement | null => document.getElementById('howto');
const ask = (): HTMLElement | null => document.getElementById('howto-ask');

describe('«Как играть» при первом запуске', () => {
  afterEach(unmountApps);

  it('без сохранённых настроек — вопрос, не слайды; «Показать» открывает слайды и пишет флаг', () => {
    const { storage } = mountApp();
    expect(ask()).not.toBeNull();
    expect(howto()).toBeNull();
    // Карточка под вопросом уже отрисована: кнопки жребия и старта на месте.
    expect(document.querySelector('[data-action="lot"]')).not.toBeNull();
    expect(document.querySelector('#btn-start')).not.toBeNull();

    click(ask()?.querySelector('[data-howto="show"]') ?? null);
    expect(ask()).toBeNull();
    expect(howto()).not.toBeNull();
    expect(readPrefs(storage).howtoShown).toBe(true);
  });

  it('«Позже» закрывает вопрос без слайдов и тоже пишет флаг', () => {
    const { storage } = mountApp();
    click(ask()?.querySelector('[data-howto="later"]') ?? null);
    expect(ask()).toBeNull();
    expect(howto()).toBeNull();
    expect(readPrefs(storage).howtoShown).toBe(true);
  });

  it('после закрытия следующий запуск обучение не показывает', () => {
    mountApp({ prefs: { howtoShown: true } });
    expect(ask()).toBeNull();
    expect(howto()).toBeNull();
  });

  it('игравшим раньше (настройки есть, флага нет) обучение не навязывается', () => {
    mountApp({ prefs: { roundsDone: 3, sound: false } });
    expect(ask()).toBeNull();
    expect(howto()).toBeNull();
  });

  it('ссылка «Как играть» на карточке работает как раньше; у игравших флаг уже считается стоящим', () => {
    const { storage } = mountApp({ prefs: { roundsDone: 3 } });
    click(document.querySelector('[data-action="howto"]'));
    expect(howto()).not.toBeNull();
    click(howto()?.querySelector('[data-howto="skip"]') ?? null);
    const saved = readPrefs(storage);
    expect(howto()?.hidden ?? true).toBe(true);
    expect(saved.howtoShown ?? true).toBe(true);
    expect(saved.roundsDone).toBe(3);
  });
});
