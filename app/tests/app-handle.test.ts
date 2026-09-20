// @vitest-environment jsdom
// Публичный handle и экран итогов (telesik-team#115): договор о следующей
// партии (setNextRoundWait), nextRoundWith, setRemoteSeat, конец матча и
// onMatchOver, «Новый матч», время партии и матча, предложение выключить
// подсказки, перехват «следующей партии» надстройкой.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { legalMoves, matchTarget } from '../src/engine';
import { L } from '../src/ui/i18n';
import {
  click,
  LS_KEY,
  mountApp,
  playRoundToEnd,
  q,
  readPrefs,
  startFixtureMatch,
  toastText,
  unmountApps,
} from './dom-helpers';

const overlay = (): HTMLElement => q('#overlay');
const nextBtn = (): HTMLButtonElement => q<HTMLButtonElement>('#overlay [data-action="next-round"]');

describe('handle и итоги партии', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    unmountApps();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('итоги показываются через 1100 мс после завершающего хода', () => {
    const { app } = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(app);
    for (let i = 0; i < 400; i++) {
      const m = app.getMatch()!;
      if (m.round.phase === 'over') break;
      app.dispatch(legalMoves(m.round)[0]!);
    }
    expect(overlay().hidden).toBe(true);
    expect(q('#status-prompt').innerHTML).toBe(L().statusRoundOver);
    vi.advanceTimersByTime(1100);
    expect(overlay().hidden).toBe(false);
    expect(q('#tutor-bar').textContent).toContain(L().tutorOver(100));
    // Ход после завершения партии игнорируется.
    const len = app.getMatch()!.round.history.length;
    app.dispatch({ type: 'pass' });
    expect(app.getMatch()!.round.history.length).toBe(len);
  });

  it('setNextRoundWait: «ждём», «соперник готов», обычный вид; без внешнего места игнорируется', () => {
    const { app } = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(app);
    playRoundToEnd(app);
    expect(nextBtn().disabled).toBe(false);
    expect(nextBtn().textContent).toBe(L().btnNextRound);
    app.setNextRoundWait({ waiting: true, peerReady: false });
    expect(nextBtn().disabled).toBe(true);
    expect(nextBtn().classList.contains('waiting')).toBe(true);
    expect(nextBtn().textContent).toBe(L().btnWaiting);
    app.setNextRoundWait({ waiting: false, peerReady: true });
    expect(nextBtn().classList.contains('peer-ready')).toBe(true);
    expect(nextBtn().textContent).toBe(L().btnPeerReady);
    app.setNextRoundWait(null);
    expect(nextBtn().textContent).toBe(L().btnNextRound);
    app.setNextRoundWait({ waiting: true, peerReady: false });
    app.setRemoteSeat(null);
    expect(nextBtn().disabled).toBe(false);
  });

  it('nextRoundWith: партия с заданным seed, договор сброшен; после конца матча — no-op', () => {
    const { app } = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(app, { variant: { doubleOnlyCloses: false, target: 50 } });
    playRoundToEnd(app);
    app.setNextRoundWait({ waiting: true, peerReady: false });
    app.nextRoundWith(99);
    const m = app.getMatch()!;
    expect(m.rounds.length).toBe(1);
    expect(m.round.seed).toBe(99);
    expect(m.round.phase).toBe('root');
    expect(overlay().hidden).toBe(true);
    expect(toastText()).toBe(L().toastRoundStart(2, m.names[m.first]));
    expect(q('#round-chip').textContent).toBe(L().roundChip(2));

    // Доигрываем матч до исхода — дальше nextRoundWith ничего не делает.
    for (let i = 0; i < 40 && !app.getMatch()!.outcome; i++) {
      playRoundToEnd(app);
      if (!app.getMatch()!.outcome) app.nextRoundWith(100 + i);
    }
    expect(app.getMatch()!.outcome).not.toBeNull();
    const rounds = app.getMatch()!.rounds.length;
    app.nextRoundWith(555);
    expect(app.getMatch()!.rounds.length).toBe(rounds);
  });

  it('конец матча: onMatchOver один раз, заголовок победы, «Новый матч» сбрасывает всё', () => {
    const onMatchOver = vi.fn();
    const onMatchReset = vi.fn();
    const { app, storage } = mountApp({ prefs: { howtoShown: true }, onMatchOver, onMatchReset });
    startFixtureMatch(app, { variant: { doubleOnlyCloses: false, target: 50 } });
    for (let i = 0; i < 40 && !app.getMatch()!.outcome; i++) {
      playRoundToEnd(app);
      if (!app.getMatch()!.outcome) click(nextBtn());
    }
    const m = app.getMatch()!;
    expect(m.outcome).not.toBeNull();
    expect(onMatchOver).toHaveBeenCalledTimes(1);
    expect(onMatchOver).toHaveBeenCalledWith(m);
    const title = q('#overlay h2:last-of-type').textContent;
    if (m.outcome!.kind === 'draw') expect(title).toBe(L().matchDraw);
    else expect(title).toBe(L().matchWin(m.names[1 - m.outcome!.loser]!));
    expect(overlay().querySelector('[data-action="next-round"]')).toBeNull();
    expect(q('.match-round').textContent).toBe(L().matchRoundLabel(m.rounds.length, matchTarget(m.variant)));
    // Дверь при завершённом матче не спрашивает подтверждения.
    const confirm = vi.spyOn(window, 'confirm');
    click(q('#overlay [data-action="new-match"]'));
    expect(confirm).not.toHaveBeenCalled();
    expect(app.getMatch()).toBeNull();
    expect(onMatchReset).toHaveBeenCalledTimes(1);
    expect(storage.mem.has(LS_KEY)).toBe(false);
    expect(document.querySelector('#btn-start')).not.toBeNull();
  });

  it('«Бросить матч» с итогов идёт через «дверь» с подтверждением', () => {
    const { app } = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(app);
    playRoundToEnd(app);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    click(q('#overlay [data-action="abort-match"]'));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(app.getMatch()).toBeNull();
  });

  it('следующая партия: надстройка может взять переход на себя', () => {
    const onNextRoundRequest = vi.fn().mockReturnValue(true);
    const { app } = mountApp({ prefs: { howtoShown: true }, onNextRoundRequest });
    startFixtureMatch(app);
    playRoundToEnd(app);
    click(nextBtn());
    expect(onNextRoundRequest).toHaveBeenCalledTimes(1);
    expect(app.getMatch()!.rounds.length).toBe(1);
    expect(app.getMatch()!.round.phase).toBe('over');
    onNextRoundRequest.mockReturnValue(false);
    click(nextBtn());
    expect(app.getMatch()!.round.phase).toBe('root');
    expect(overlay().hidden).toBe(true);
  });

  it('время партии и матча на итогах: только при честных замерах; больше часа — три сегмента', () => {
    const { app } = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(app);
    playRoundToEnd(app);
    // Без замеров — только строка «Партия N (матч до T)», времени нет.
    expect(document.querySelectorAll('#overlay .match-round').length).toBe(1);
    click(nextBtn());
    // Вторая партия: каждый ход по 20 минут — партия дольше часа.
    for (let i = 0; i < 400; i++) {
      const m = app.getMatch()!;
      if (m.round.phase === 'over') break;
      app.dispatch({ ...legalMoves(m.round)[0]!, t: 20 * 60_000 });
    }
    vi.runOnlyPendingTimers();
    const rows = [...document.querySelectorAll<HTMLElement>('#overlay .match-round')].map((e) => e.textContent);
    const time = rows.find((r) => r?.includes(':'))!;
    expect(time).toMatch(/\d+:\d\d:\d\d/);
  });

  it('предложение выключить подсказки: один раз после трёх партий; «убрать» и «оставить»', () => {
    const { app, storage } = mountApp({ prefs: { howtoShown: true, roundsDone: 2 } });
    startFixtureMatch(app);
    playRoundToEnd(app);
    expect(readPrefs(storage).roundsDone).toBe(3);
    expect(overlay().textContent).toContain(L().tutorEnough);
    click(q('#overlay [data-action="tutor-keep"]'));
    expect(readPrefs(storage).tutorAsked).toBe(true);
    expect(readPrefs(storage).tutor).toBe(true);
    expect(overlay().textContent).not.toContain(L().tutorEnough);

    unmountApps();
    const second = mountApp({ prefs: { howtoShown: true, roundsDone: 5 } });
    startFixtureMatch(second.app);
    playRoundToEnd(second.app);
    click(q('#overlay [data-action="tutor-off"]'));
    expect(readPrefs(second.storage).tutor).toBe(false);
    expect(readPrefs(second.storage).tutorAsked).toBe(true);
    expect(q('#tutor-bar').hidden).toBe(true);
  });

  it('setRemoteSeat меняет, чья рука внизу', () => {
    const { app } = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(app);
    expect(q('#hand-bottom .hand-name').textContent).toContain('А');
    app.setRemoteSeat(0);
    expect(q('#hand-bottom .hand-name').textContent).toContain('Б');
    app.setRemoteSeat(null);
    expect(q('#hand-bottom .hand-name').textContent).toContain('А');
  });

  it('итоги: ряды игроков, «выход» и «рыба» подписаны по-своему', () => {
    const { app } = mountApp({ prefs: { howtoShown: true } });
    startFixtureMatch(app);
    playRoundToEnd(app);
    const m = app.getMatch()!;
    const res = m.round.result!;
    const h2 = q('#overlay h2').textContent;
    if (res.cause === 'out') expect(h2).toBe(L().resultOut(m.names[res.winner!]!));
    else expect(h2).toBe(L().resultFish);
    expect(document.querySelectorAll('#overlay .result-name').length).toBe(2);
    expect(q('#overlay .match-score').textContent).toContain(`${m.totals[0]} : ${m.totals[1]}`);
  });
});
