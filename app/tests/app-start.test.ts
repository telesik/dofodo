// @vitest-environment jsdom
// Стартовая карточка (telesik-team#115): жребий и старт по кнопке, имена и
// цель матча, соперник-бот и пункт платформы, смена языка и соперника без
// потери введённого, «Продолжить матч» из сохранения, порченый сейв,
// настройки и их переключатели, внешние ссылки через openExternal.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { legalMoves } from '../src/engine';
import { L, setLocale } from '../src/ui/i18n';
import {
  click,
  LS_KEY,
  makeStorage,
  mountApp,
  q,
  readPrefs,
  setValue,
  startFixtureMatch,
  toastText,
  unmountApps,
} from './dom-helpers';

/** Жребий детерминированный: первая кость 0-0 (сумма 0), вторая — не ноль. */
function fixLot(): void {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.5);
}

describe('стартовая карточка: жребий и старт', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
    vi.restoreAllMocks();
    setLocale('ru');
  });

  it('без хранилища приложение берёт localStorage jsdom', () => {
    localStorage.clear();
    const { app } = mountApp({ noStorage: true, prefs: undefined });
    expect(app.getMatch()).toBeNull();
    // Настройки записались именно в localStorage.
    click(q('#btn-mark'));
    expect(localStorage.getItem('bonesai-ui-v1')).toContain('"markOwners":true');
    localStorage.clear();
  });

  it('старт недоступен до жребия; жребий называет первого; матч стартует с именами, целью и вариантом', () => {
    const { app, storage } = mountApp({ prefs: { howtoShown: true, opponent: 'human' } });
    const start = q<HTMLButtonElement>('#btn-start');
    expect(start.disabled).toBe(true);

    setValue('#inp-n0', 'Вася');
    setValue('#inp-n1', 'Петя');
    expect(readPrefs(storage).p1Name).toBe('Вася');
    expect(readPrefs(storage).p2Name).toBe('Петя');
    // Цель матча — радио; вариант — галочка.
    const radio150 = q<HTMLInputElement>('input[name="match-target"][value="150"]');
    radio150.checked = true;
    radio150.dispatchEvent(new Event('change', { bubbles: true }));
    expect(readPrefs(storage).target).toBe(150);
    q<HTMLInputElement>('#inp-variant').checked = true;

    fixLot();
    click(q('[data-action="lot"]'));
    expect(start.disabled).toBe(false);
    expect(q('#lot-result').innerHTML).toBe(L().lotWinner('<b>Вася</b>'));
    expect(document.querySelectorAll('#lot-row .lot-side').length).toBe(2);
    expect(q('#lot-row .lot-side.win span').textContent).toContain('Вася');

    click(start);
    const m = app.getMatch()!;
    expect(m.names).toEqual(['Вася', 'Петя']);
    expect(m.first).toBe(0);
    expect(m.variant).toEqual({ doubleOnlyCloses: true, target: 150 });
    expect(m.bot).toBeNull();
    expect(q('#overlay').hidden).toBe(true);
    expect(toastText()).toBe(L().toastFirstOpen('Вася'));
    // Тост гаснет сам.
    vi.advanceTimersByTime(2700);
    expect(q('#toast').hidden).toBe(true);
    // Матч сохранён под ключом сейва.
    expect(storage.mem.get(LS_KEY)).toContain('"v":2');
  });

  it('соперник-бот: поля второго имени нет, имя бота — из уровня, бот ходит сам через паузу', () => {
    const { app, storage } = mountApp({ prefs: { howtoShown: true, opponent: 'human' } });
    expect(document.querySelector('#inp-n1')).not.toBeNull();
    setValue('#inp-opp', 'normal');
    expect(readPrefs(storage).opponent).toBe('normal');
    expect(document.querySelector('#inp-n1')).toBeNull();
    expect(q('label[for="inp-n0"]').textContent).toBe(L().fieldYourName);

    fixLot();
    click(q('[data-action="lot"]'));
    click(q('#btn-start'));
    const m = app.getMatch()!;
    expect(m.bot).toEqual({ player: 1, level: 'normal' });
    expect(m.names[1]).toBe(L().botNameNormal);
    // Первым ходит человек (жребий — 0): в его ход бот молчит.
    expect(m.round.current).toBe(0);
    vi.advanceTimersByTime(800);
    expect(app.getMatch()!.round.history.length).toBe(0);
    // После хода человека бот думает 750 мс и ходит; в его ход клики по руке
    // и куче человека закрыты (классов playable нет, статус «думает»).
    app.dispatch(legalMoves(m.round)[0]!);
    expect(app.getMatch()!.round.current).toBe(1);
    expect(document.querySelectorAll('.hand-tile.playable').length).toBe(0);
    expect(q('#status-prompt').innerHTML).toBe(L().statusBotThinking(`<b>${L().botNameNormal}</b>`));
    expect(q('#tutor-bar').textContent).toContain(L().tutorBotTurn);
    vi.advanceTimersByTime(800);
    expect(app.getMatch()!.round.history.length).toBe(2);
  });

  it('пункт платформы в селекторе: без жребия и второго имени, старт уходит в onOpponentStart', () => {
    const onOpponentStart = vi.fn();
    const { app } = mountApp({
      prefs: { howtoShown: true },
      onOpponentStart,
      opponentOptions: [
        {
          id: 'ble',
          label: () => 'Рядом по Bluetooth',
          needsLots: false,
          needsSecondName: false,
          startLabel: () => 'Найти соперника',
          nameLabel: () => 'Игровое имя',
        },
      ],
    });
    setValue('#inp-opp', 'ble');
    expect(document.querySelector('[data-action="lot"]')).toBeNull();
    expect(document.querySelector('#inp-n1')).toBeNull();
    expect(q('label[for="inp-n0"]').textContent).toBe('Игровое имя');
    const start = q<HTMLButtonElement>('#btn-start');
    expect(start.disabled).toBe(false);
    expect(start.textContent).toBe('Найти соперника');
    setValue('#inp-n0', 'Оля');
    click(start);
    expect(onOpponentStart).toHaveBeenCalledWith('ble', {
      names: ['Оля', L().defaultP2],
      first: 0,
      variant: { doubleOnlyCloses: false },
    });
    expect(app.getMatch()).toBeNull();
  });

  it('пункты соперника без onOpponentStart не показываются', () => {
    mountApp({
      prefs: { howtoShown: true },
      opponentOptions: [{ id: 'ble', label: () => 'Рядом' }],
    });
    expect([...q<HTMLSelectElement>('#inp-opp').options].map((o) => o.value)).toEqual([
      'human',
      'easy',
      'normal',
      'strong',
    ]);
  });

  it('смена соперника и языка на карточке не теряет введённое имя и галочку варианта', () => {
    const { storage } = mountApp({ prefs: { howtoShown: true, opponent: 'easy' } });
    q<HTMLInputElement>('#inp-n0').value = 'Зина';
    q<HTMLInputElement>('#inp-variant').checked = true;
    setValue('#inp-opp', 'human');
    expect(q<HTMLInputElement>('#inp-n0').value).toBe('Зина');
    expect(q<HTMLInputElement>('#inp-variant').checked).toBe(true);
    expect(document.querySelector('#inp-n1')).not.toBeNull();

    q<HTMLInputElement>('#inp-n1').value = 'Гоша';
    setValue('#inp-lang-start', 'en');
    expect(readPrefs(storage).locale).toBe('en');
    expect(readPrefs(storage).p1Name).toBe('Зина');
    expect(readPrefs(storage).p2Name).toBe('Гоша');
    expect(q<HTMLInputElement>('#inp-n0').value).toBe('Зина');
    expect(q('#btn-start').textContent).toBe(L().btnStart);
    expect(q('#btn-settings').dataset.tip).toBe(L().settingsTitle);
    // Дефолтное имя старого языка не считается введённым.
    setValue('#inp-lang-start', 'ru');
    expect(readPrefs(storage).p1Name).toBe('Зина');
  });

  // Известный баг telesik-team#128: после смены языка renderAll() строит
  // карточку второй раз и затирает восстановленную галочку варианта.
  // it.fails — красный тест по правилу автора 17.09.2026; при исправлении
  // снять it.fails (тогда прогон упадёт, пока это не сделано).
  it.fails('смена языка на карточке сохраняет галочку варианта (telesik-team#128)', () => {
    mountApp({ prefs: { howtoShown: true } });
    q<HTMLInputElement>('#inp-variant').checked = true;
    setValue('#inp-lang-start', 'en');
    expect(q<HTMLInputElement>('#inp-variant').checked).toBe(true);
  });

  it('ссылки карточки: донат, App Store, Google Play; openExternal перехватывает переход', () => {
    const openExternal = vi.fn();
    mountApp({
      prefs: { howtoShown: true },
      supportUrl: 'https://example.test/support',
      appStoreUrl: 'https://example.test/ios',
      googlePlayUrl: 'https://example.test/android',
      openExternal,
    });
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.links-line a[target="_blank"]')];
    expect(links.map((a) => a.href)).toEqual([
      'https://example.test/support',
      'https://example.test/ios',
      'https://example.test/android',
    ]);
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: -9, clientY: -9 });
    links[1]!.dispatchEvent(ev);
    expect(openExternal).toHaveBeenCalledWith('https://example.test/ios');
    expect(ev.defaultPrevented).toBe(true);
  });

  it('без openExternal ссылка остаётся обычной', () => {
    mountApp({ prefs: { howtoShown: true }, supportUrl: 'https://example.test/support' });
    const a = q<HTMLAnchorElement>('.links-line a[target="_blank"]');
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: -9, clientY: -9 });
    a.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });
});

describe('стартовая карточка: сохранённый матч', () => {
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
  });

  /** Сейв живого матча после нескольких ходов — из настоящего приложения. */
  function savedMatch(): string {
    const storage = makeStorage();
    const { app } = mountApp({ storage, prefs: { howtoShown: true } });
    startFixtureMatch(app);
    app.dispatch(legalMoves(app.getMatch()!.round)[0]!);
    app.dispatch(legalMoves(app.getMatch()!.round)[0]!);
    const raw = storage.mem.get(LS_KEY)!;
    unmountApps();
    return raw;
  }

  it('«Продолжить матч» показывает счёт и возвращает партию на стол', () => {
    const raw = savedMatch();
    const { app } = mountApp({ prefs: { howtoShown: true }, stored: { [LS_KEY]: raw } });
    const cont = q('[data-action="continue"]');
    expect(cont.textContent).toBe(L().btnContinue('А 0:0 Б'));
    expect(app.getMatch()).toBeNull();
    click(cont);
    const m = app.getMatch()!;
    expect(m.round.history.length).toBe(2);
    expect(q('#overlay').hidden).toBe(true);
    expect(q('#round-chip').textContent).toBe(L().roundChip(1));
    // Куча базара разложена с учётом уже разобранных костей.
    expect(document.querySelectorAll('#boneyard .pile-tile').length).toBe(m.round.boneyard.length);
  });

  it('порченый сейв удаляется молча, кнопки «Продолжить» нет', () => {
    for (const bad of [
      'не json',
      JSON.stringify({ v: 1, match: {} }),
      JSON.stringify({ v: 2, match: { names: ['А', 'Б'], totals: [0, 0] } }),
    ]) {
      const { storage } = mountApp({ prefs: { howtoShown: true }, stored: { [LS_KEY]: bad } });
      expect(document.querySelector('[data-action="continue"]')).toBeNull();
      expect(storage.mem.has(LS_KEY)).toBe(false);
      unmountApps();
    }
  });

  it('сейв с порченой целью матча или неверным ботом отбрасывается', () => {
    const raw = savedMatch();
    const data = JSON.parse(raw) as { match: { variant: { target?: unknown }; bot?: unknown } };
    const withTarget = { ...data, match: { ...data.match, variant: { doubleOnlyCloses: false, target: 0 } } };
    const withBot = { ...data, match: { ...data.match, bot: { player: 2, level: 'normal' } } };
    for (const bad of [withTarget, withBot]) {
      const { storage } = mountApp({ prefs: { howtoShown: true }, stored: { [LS_KEY]: JSON.stringify(bad) } });
      expect(document.querySelector('[data-action="continue"]')).toBeNull();
      expect(storage.mem.has(LS_KEY)).toBe(false);
      unmountApps();
    }
  });

  it('сейв завершённого матча не предлагается к продолжению', () => {
    const raw = savedMatch();
    const data = JSON.parse(raw) as { match: Record<string, unknown> };
    data.match.outcome = { kind: 'draw' };
    mountApp({ prefs: { howtoShown: true }, stored: { [LS_KEY]: JSON.stringify(data) } });
    expect(document.querySelector('[data-action="continue"]')).toBeNull();
  });

  it('хранилище, бросающее исключения, не роняет первый рендер', () => {
    const storage = makeStorage();
    storage.get = () => {
      throw new Error('quota');
    };
    storage.set = () => {
      throw new Error('quota');
    };
    storage.remove = () => {
      throw new Error('quota');
    };
    const { app } = mountApp({ storage });
    expect(app.getMatch()).toBeNull();
    expect(q('#overlay').hidden).toBe(false);
    startFixtureMatch(app);
    expect(app.getMatch()).not.toBeNull();
  });
});

describe('настройки', () => {
  afterEach(() => {
    unmountApps();
    setLocale('ru');
  });

  it('открываются с карточки и по ⚙, закрываются кнопкой; язык и галочки пишутся в prefs', () => {
    const { storage } = mountApp({ prefs: { howtoShown: true } });
    const settings = q('#settings');
    expect(settings.hidden).toBe(true);
    click(q('[data-action="settings-open"]'));
    expect(settings.hidden).toBe(false);
    click(q('[data-action="settings-close"]'));
    expect(settings.hidden).toBe(true);
    click(q('#btn-settings'));
    expect(settings.hidden).toBe(false);
    click(q('#btn-settings'));
    expect(settings.hidden).toBe(true);
    click(q('#btn-settings'));

    setValue('#set-lang', 'de');
    expect(readPrefs(storage).locale).toBe('de');
    expect(q('#settings h1').textContent).toBe(L().settingsTitle);
    expect(q('#btn-new').dataset.tip).toBe(L().tipNew);

    const set = (id: string, on: boolean): void => {
      const cb = q<HTMLInputElement>(`#settings input[data-set="${id}"]`);
      cb.checked = on;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set('sound', false);
    expect(readPrefs(storage).sound).toBe(false);
    set('sound', true);
    expect(readPrefs(storage).sound).toBe(true);
    set('tutor', false);
    expect(readPrefs(storage).tutor).toBe(false);
    set('confirm', true);
    expect(readPrefs(storage).confirm).toBe(true);
    set('mirror', true);
    expect(readPrefs(storage).mirror).toBe(true);
    expect(q('#btn-mirror').classList.contains('active')).toBe(true);
    // Событие change не от переключателя — игнорируется.
    q('#settings h1').dispatchEvent(new Event('change', { bubbles: true }));
  });

  it('переключатели платформы: начальное значение применяется сразу, смена пишется и передаётся', () => {
    const onChange = vi.fn();
    const { storage } = mountApp({
      prefs: { howtoShown: true, toggles: { awake: false } },
      extraToggles: [{ id: 'awake', label: () => 'Не гасить экран', initial: true, onChange }],
    });
    // Сохранённое false важнее initial:true.
    expect(onChange).toHaveBeenCalledWith(false);
    click(q('#btn-settings'));
    const cb = q<HTMLInputElement>('#settings input[data-set="x:awake"]');
    expect(cb.checked).toBe(false);
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect((readPrefs(storage).toggles as Record<string, boolean>).awake).toBe(true);
  });

  it('переключатель без сохранённого значения стартует с initial', () => {
    const onChange = vi.fn();
    mountApp({
      prefs: { howtoShown: true },
      extraToggles: [{ id: 'awake', label: () => 'Не гасить экран', initial: true, onChange }],
    });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('действие платформы в настройках закрывает их и зовёт надстройку; ссылка политики — по опции', () => {
    const onSelect = vi.fn();
    mountApp({
      prefs: { howtoShown: true },
      privacyUrl: 'https://example.test/privacy',
      extraActions: [{ id: 'tipjar', label: () => 'Поддержать', onSelect }],
    });
    click(q('#btn-settings'));
    expect(q<HTMLAnchorElement>('#settings .privacy-line a').href).toBe('https://example.test/privacy');
    click(q('#settings [data-action="x-act:tipjar"]'));
    expect(onSelect).toHaveBeenCalled();
    expect(q('#settings').hidden).toBe(true);
    // На стартовой карточке без флага startCard кнопки действия нет.
    expect(document.querySelector('#overlay [data-action="x-act:tipjar"]')).toBeNull();
  });

  // Известный баг telesik-team#129: строку действия в настройках
  // обрабатывают и слушатель настроек, и общий слушатель документа —
  // onSelect зовётся дважды. it.fails снять при исправлении.
  it.fails('действие платформы в настройках зовёт onSelect ровно один раз (telesik-team#129)', () => {
    const onSelect = vi.fn();
    mountApp({
      prefs: { howtoShown: true },
      extraActions: [{ id: 'tipjar', label: () => 'Поддержать', onSelect }],
    });
    click(q('#btn-settings'));
    click(q('#settings [data-action="x-act:tipjar"]'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('действие с флагом startCard есть и на карточке; клик не закрывает карточку', () => {
    const onSelect = vi.fn();
    mountApp({
      prefs: { howtoShown: true },
      extraActions: [{ id: 'tipjar', label: () => 'Поддержать', startCard: true, onSelect }],
    });
    click(q('#overlay [data-action="x-act:tipjar"]'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(q('#overlay').hidden).toBe(false);
  });
});
