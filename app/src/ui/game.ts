// Dofodo для каркаса приложения: игровые виды и тексты, стол и собственные
// кнопки шапки (зеркало, разметка ходов, перекладка веток). Экраны, руки,
// базар, историю и настройки ведёт общий каркас (подмодуль commons/,
// telesik-web-commons) — игру он знает через движок, стол и этот модуль.

import type {
  BoardFactory,
  GameView,
  RoundOverView,
  ShellApi,
  TurnCtx,
} from '../../../commons/src/shell/types';
import {
  dofodoEngine,
  handSum,
  isDouble,
  matchTarget,
  parseTile,
  shuffleLayout,
  type GameState,
  type LogEntry,
  type MatchOutcome,
  type MatchState,
  type Move,
  type RoundResult,
  type TileId,
  type Variant,
} from '../engine';
import { createBoard, samePlacement } from './board';
import { esc } from './html';
import { openHowTo, openHowToAsk } from './howto';
import { getLocale, L, type Locale } from './i18n';
import { logoSvg } from './logo';
import { placeSoundOf } from './sound';
import { tileBack, tileFace, tileSvgElement } from './tile-svg';

/** Цель матча (§10.5): к выбору предлагаются эти значения, канон — 100.
 *  Экспорт — для лобби мобильной надстройки (там была копия). */
export const MATCH_TARGETS: readonly number[] = [50, 100, 150, 200];

/** Полный текст правил по языку интерфейса. */
const RULES_DOC_LANG: Record<Locale, string> = {
  ru: 'ru',
  en: 'en',
  es: 'es',
  de: 'de',
  pt: 'pt-BR',
  uk: 'uk',
  zh: 'zh',
  fr: 'fr',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
};

export function rulesDocUrl(): string {
  return `https://github.com/telesik/dofodo/blob/main/docs/RULES.${RULES_DOC_LANG[getLocale()]}.md`;
}

type View = GameView<GameState, Move, Variant, RoundResult, LogEntry, MatchOutcome>;
type Api = ShellApi<GameState, Move, Variant, RoundResult, MatchOutcome>;

export interface DofodoGame {
  readonly engine: typeof dofodoEngine;
  readonly view: View;
  readonly board: BoardFactory<GameState, Move>;
}

const tileLabel = (t: TileId): string => t.replace('-', ':');

/** Слово режима выставления — для журнала и панели подтверждения
 *  (у призраков на столе свои подписи, modeLabel в board.ts). */
function modeWord(mode: 'straight' | 'turn' | 'cross'): string {
  return mode === 'straight' ? L().modeStraight : mode === 'turn' ? L().modeTurn : L().modeCross;
}

/** Валидная цель матча в сыром JSON: поля нет или целое больше нуля. */
function targetOk(t: unknown): boolean {
  return t === undefined || (typeof t === 'number' && Number.isInteger(t) && t > 0);
}

/** Проверка сейва из сырого JSON: null — сейв негоден и будет стёрт. */
function validateSaved(raw: unknown): MatchState | null {
  const TILE_RE = /^[0-6]-[0-6]$/;
  const tiles = (x: unknown): boolean =>
    Array.isArray(x) && x.every((t) => typeof t === 'string' && TILE_RE.test(t));
  const m = raw as MatchState | undefined;
  const r = m?.round;
  const ok =
    Array.isArray(m?.names) &&
    m.names.length === 2 &&
    m.names.every((n) => typeof n === 'string') &&
    Array.isArray(m.totals) &&
    m.totals.length === 2 &&
    m.totals.every((n) => typeof n === 'number') &&
    !!r &&
    (r.phase === 'root' || r.phase === 'main' || r.phase === 'over') &&
    Array.isArray(r.hands) &&
    r.hands.length === 2 &&
    tiles(r.hands[0]) &&
    tiles(r.hands[1]) &&
    tiles(r.boneyard) &&
    Array.isArray(r.placed) &&
    Array.isArray(r.ends) &&
    typeof r.seed === 'number' &&
    Array.isArray(r.history) &&
    Array.isArray(m.rounds) &&
    // Цель матча из сырого JSON решает, когда матч кончится, —
    // порченое значение (0, строка) сломало бы finishRound.
    !!m.variant &&
    targetOk(m.variant.target) &&
    !!r.variant &&
    targetOk(r.variant.target) &&
    (m.bot == null ||
      ((m.bot.player === 0 || m.bot.player === 1) &&
        ['easy', 'normal', 'strong'].includes(m.bot.level)));
  return ok ? m : null;
}

// Формулировки без глаголов прошедшего времени: имена игроков любого рода.
function describeLog(e: LogEntry, names: readonly [string, string]): string {
  switch (e.kind) {
    case 'root':
      return L().logRoot(names[e.player], tileLabel(e.tile));
    case 'place':
      return L().logPlace(names[e.player], tileLabel(e.tile), modeWord(e.mode));
    case 'draw':
      return e.played ? L().logDrawPlayed(names[e.player]) : L().logDrawKept(names[e.player]);
    case 'pass':
      return L().logPass(names[e.player]);
    case 'end':
      return e.cause === 'fish' ? L().logFish : L().logOut;
  }
}

/** Приглашение к ходу в свой ход за этим экраном. */
function prompt(round: GameState, ctx: TurnCtx<Move>): string {
  const name = ctx.nameHtml;
  if (round.phase === 'root') {
    if (round.mustPlay) return L().promptRootDrawn(name, tileLabel(round.mustPlay));
    const hasDouble = round.hands[round.current].some(isDouble);
    return hasDouble ? L().promptRootHasDouble(name) : L().promptRootNoDouble(name);
  }
  if (round.mustPlay) return L().promptMustPlay(name, tileLabel(round.mustPlay));
  // Легальные ходы уже посчитаны каркасом (telesik-team#123, O2).
  if (ctx.legal.some((m) => m.type === 'place')) return L().promptYourMove(name);
  return round.boneyard.length > 0 ? L().promptDraw(name) : L().promptPass(name);
}

/** Подсказка режима обучения в свой ход: что сейчас можно сделать и как. */
function tutor(round: GameState, ctx: TurnCtx<Move>): string {
  if (round.phase === 'root') {
    if (round.mustPlay) return L().tutorRootMustPlay;
    return round.hands[round.current].some(isDouble) ? L().tutorRootHasDouble : L().tutorRootNoDouble;
  }
  const placements = ctx.legal.filter(
    (m): m is Extract<Move, { type: 'place' }> => m.type === 'place',
  );
  if (placements.length === 0) {
    return round.boneyard.length > 0 ? L().tutorDraw : L().tutorPass;
  }
  // Подсказка идёт по стадиям, детали — только про выбранную кость:
  // раньше все параграфы склеивались в один абзац, и панель занимала
  // до 42% высоты телефона, накрывая стол (баг 0008).
  const focus = ctx.selected ?? round.mustPlay;
  const parts = [round.mustPlay ? L().tutorMustPlay : focus ? L().tutorPlace : L().tutorPick];
  if (focus) {
    const mine = placements.filter((m) => m.tile === focus);
    if (mine.some((m) => m.mode === 'turn')) parts.push(L().tutorTurnSides);
    if (mine.some((m) => m.mode === 'cross')) parts.push(L().tutorCross);
    // Ограничение §6.4 объясняем там, где оно и мешает: у свежего конца
    // теней меньше, чем игрок ждёт.
    const fresh = new Set(round.ends.filter((e) => e.fresh).map((e) => e.id));
    if (mine.some((m) => fresh.has(m.endId))) parts.push(L().tutorFresh);
  }
  return parts.join(' ');
}

/** Содержимое карточки итогов партии: причина, руки, очки, исход матча. */
function roundOver(match: MatchState, nameOf: (seat: 0 | 1) => string): RoundOverView {
  const round = match.round;
  const result = round.result!;
  const lastRound = match.rounds[match.rounds.length - 1]!;
  const title =
    result.cause === 'out' ? L().resultOut(esc(nameOf(result.winner as 0 | 1))) : L().resultFish;
  const causeSub = result.cause === 'out' ? L().resultOutSub : L().resultFishSub;

  const rows = ([0, 1] as const)
    .map((p) => {
      const hand = round.hands[p];
      const tiles = hand
        .map((t) => {
          const pt = parseTile(t);
          return tileSvgElement(tileFace(pt.hi, pt.lo, { shadow: 'flat' }), 52);
        })
        .join('');
      const zeroZero = hand.length === 1 && hand[0] === '0-0';
      const added = result.added[p];
      return `
          <div class="result-name">${esc(nameOf(p))}</div>
          <div class="result-pts"><b>${result.sums[p]}</b> ${L().ptsShort} ·
            ${added > 0 ? `<span class="plus">+${added}</span>` : '<span class="zero">+0</span>'}
          </div>
          <div class="result-tiles">${
            tiles || `<span class="result-note">${L().resultEmptyHand}</span>`
          }</div>
          ${
            zeroZero
              ? `<p class="result-note" style="grid-column:1/-1">${L().resultZeroZero}</p>`
              : ''
          }`;
    })
    .join('');

  const outcome = match.outcome;
  let nextNote = '';
  if (!outcome) {
    const nextFirst = dofodoEngine.nextFirst(lastRound);
    const why = lastRound.winner !== null ? L().whyWinner : L().whySwap;
    nextNote = L().nextFirstNote(esc(nameOf(nextFirst)), why);
  }
  return {
    title,
    sub: `${causeSub}${result.winner === null ? L().resultTieNote : ''}`,
    rows,
    matchLabel: L().matchRoundLabel(match.rounds.length, matchTarget(match.variant)),
    outcomeTitle: !outcome
      ? null
      : outcome.kind === 'draw'
        ? L().matchDraw
        : L().matchWin(esc(nameOf((1 - outcome.loser) as 0 | 1))),
    nextNote,
  };
}

/** Собрать игру для каркаса: движок, стол и виды с собственным состоянием вида. */
export function createDofodoGame(): DofodoGame {
  // Настройки вида Dofodo (переживают перезагрузку вместе с общими).
  let markOwners = false;
  /**
   * Зеркальный стол: корень справа, дерево растёт влево. Нужно тем, кто привык
   * сидеть напротив — у соперника через стол всё выглядело именно так, и после
   * разворота стола к себе привычная картинка ломается.
   */
  let mirrorBoard = false;
  let targetPref = 100;
  let relayoutSalt = 0;

  let rawBoard: ReturnType<typeof createBoard> | null = null;
  let elBtnMirror: HTMLElement | null = null;
  let elBtnMark: HTMLElement | null = null;
  let elBtnRelayout: HTMLElement | null = null;

  /**
   * Зеркало стола — одна точка входа для кнопки в шапке и галочки в настройках,
   * чтобы они не разошлись: галочка строится при открытии настроек и читает
   * mirrorBoard, а кнопка показывает состояние классом active.
   * Сохранение и перерисовку делает вызывающий.
   */
  function applyMirror(on: boolean): void {
    mirrorBoard = on;
    rawBoard?.setMirror(on);
    elBtnMirror?.classList.toggle('active', on);
  }

  function mount(api: Api): void {
    const $ = (sel: string): HTMLElement => {
      const el = document.querySelector<HTMLElement>(sel);
      if (!el) throw new Error(`Нет элемента ${sel}`);
      return el;
    };
    elBtnMirror = $('#btn-mirror');
    elBtnMark = $('#btn-mark');
    elBtnRelayout = $('#btn-relayout');
    // Сохранённое зеркало применяем до первого рендера, иначе стол успел бы
    // мигнуть обычной стороной.
    applyMirror(mirrorBoard);

    const btnMark = elBtnMark;
    btnMark.classList.toggle('active', markOwners);
    btnMark.addEventListener('click', () => {
      markOwners = !markOwners;
      btnMark.classList.toggle('active', markOwners);
      api.persistUi();
      api.render();
      if (markOwners) api.toast(L().toastMarkOwners);
    });

    // Ручная перекладка веток: другая валидная раскладка того же дерева (§6.3).
    elBtnRelayout.addEventListener('click', () => {
      // remoteSeat — страховка: в сетевом матче кнопка и так скрыта (идея 0005).
      const match = api.getMatch();
      if (!match || api.isReplay() || api.remoteSeat() !== null || match.round.phase === 'over') return;
      const next = shuffleLayout(match.round, ++relayoutSalt);
      if (!next) return;
      api.setRound(next);
      if (!api.board.isAutoFit()) api.board.ensureVisible(next.placed.length - 1);
    });

    // Кнопка «зеркальный стол»: решение о стороне приходит и посреди партии.
    elBtnMirror.addEventListener('click', () => {
      applyMirror(!mirrorBoard);
      api.persistUi();
      api.render();
    });
  }

  const view: View = {
    logo: logoSvg,
    titleHtml: () => `${logoSvg(34, 'title-logo')}<span><span class="gold">D</span>ofodo</span>`,
    rulesUrl: rulesDocUrl,
    tileBack,
    openHowTo: (o) => openHowTo({ rulesUrl: rulesDocUrl(), onClose: o.onClose }),
    openHowToAsk,
    hotSeat: true,
    pileSize: 14,

    moveKind: (m) => (m.type === 'placeRoot' || m.type === 'place' ? 'place' : m.type),
    moveTile: (m) => ('tile' in m ? m.tile : null),
    placedSeqOf: (m, after) =>
      m.type === 'place' || m.type === 'placeRoot' ? after.placed.length - 1 : null,
    placedValues: (s, seq) => s.placed[seq]!.values,
    placeSound: (_m, after) => placeSoundOf(after.placed[after.placed.length - 1]!.kind),
    samePlacement,
    // Поворот показываем двумя тенями — по одной на каждую сторону изгиба
    // (§6.3: на правила сторона не влияет, это выбор раскладки).
    ghostMoves: (_s, legal, selected) =>
      legal
        .filter((m) => (m.type === 'place' || m.type === 'placeRoot') && m.tile === selected)
        .flatMap((m) =>
          m.type === 'place' && m.mode === 'turn'
            ? [
                { ...m, side: 0 as const },
                { ...m, side: 1 as const },
              ]
            : [m],
        ),
    forcedTile: (s) => s.mustPlay,
    forcedToast: (s) =>
      s.phase === 'root'
        ? L().toastMustRoot(tileLabel(s.mustPlay!))
        : L().toastMustPlay(tileLabel(s.mustPlay!)),
    drawnTile(s) {
      const entry = s.log[s.log.length - 1];
      return entry && entry.kind === 'draw' ? entry.tile : null;
    },
    // Выбор дубля под корень возвращает стол к стартовой позиции: тень
    // корня всегда в кадре, даже если стол смещали в прошлой партии.
    refitOnPick: (s) => s.phase === 'root',

    logSeat: (e) => ('player' in e ? e.player : null),
    describeLog: (e, names) => describeLog(e, names),
    prompt,
    tutor,
    tutorOver: (s) => L().tutorOver(matchTarget(s.variant)),
    confirmQuestion: (m) =>
      m.type === 'placeRoot'
        ? L().confirmRootAsk(tileLabel(m.tile))
        : m.type === 'place'
          ? L().confirmAsk(tileLabel(m.tile), modeWord(m.mode))
          : '',

    // Рука второго игрока закрыта до конца первого хода первого (§3.2–3.3).
    handHidden: (s, seat) => seat === 1 - s.first && !s.secondRevealed,
    handMeta: (s, seat, hidden) =>
      hidden
        ? L().handMetaHidden(s.hands[seat].length)
        : L().handMeta(s.hands[seat].length, handSum(s.hands[seat])),
    // Рядом со счётом — цель матча «43/100» (telesik-team#112, постановка
    // автора 20.09.2026): цель — порог проигрыша (§10.5), и до этой правки
    // в самой партии её было не видно, только на итогах. Цель приглушена,
    // чтобы свои очки читались первыми.
    totalChip: (match, seat) =>
      `<span class="total-chip" data-tip="${L().tipTotal}">${match.totals[seat]}<span class="total-goal">/${matchTarget(match.variant)}</span></span>`,
    roundOver,
    roundSummary: (res, i) =>
      L().roundOptDone(
        i + 1,
        res.cause === 'fish' ? L().causeFishShort : L().causeOutShort,
        res.sums[0],
        res.sums[1],
      ),

    startFields: () => `<div class="field"><label>${L().fieldTarget}</label>
          <span class="target-opts">
            ${MATCH_TARGETS.map(
              (v) =>
                `<label class="check"><input type="radio" name="match-target" value="${v}" ${
                  v === targetPref ? 'checked' : ''
                }>${v}</label>`,
            ).join('')}
          </span></div>
        <label class="check"><input id="inp-variant" type="checkbox">
          ${L().variantText}
        </label>`,
    startFieldChange(el) {
      if (el.name !== 'match-target') return false;
      // Радио строятся из MATCH_TARGETS — чужих значений тут не бывает.
      targetPref = Number(el.value);
      return true;
    },
    // Галочка варианта не хранится в настройках, но переживает перерисовку
    // карточки при смене языка и соперника (telesik-team#128).
    keepFields: ['#inp-variant'],
    variantFrom: (card) => ({
      doubleOnlyCloses: card.querySelector<HTMLInputElement>('#inp-variant')!.checked,
      // Канонические 100 в состояние и протокол не пишем: без поля они
      // подразумеваются, а протоколы остаются совместимыми со старыми
      // сборками (важно для сетевого матча).
      ...(targetPref !== 100 ? { target: targetPref } : {}),
    }),
    validateSaved,

    // Настройки Dofodo лежат в корне сохранённых настроек, как до выделения
    // каркаса: формат хранения не менялся.
    prefsFlat: true,
    loadPrefs(raw) {
      markOwners = !!raw.markOwners;
      mirrorBoard = !!raw.mirror;
      if (typeof raw.target === 'number' && MATCH_TARGETS.includes(raw.target)) targetPref = raw.target;
    },
    dumpPrefs: () => ({ markOwners, mirror: mirrorBoard, target: targetPref }),
    boardFlags: () => ({ markOwners }),
    settings: () => [{ id: 'mirror', on: mirrorBoard, text: L().tipMirror }],
    setSetting(id, on) {
      if (id === 'mirror') applyMirror(on);
    },
    mount,
    onRender(live) {
      // Кнопка перекладки веток осмысленна, только когда есть повороты.
      // В сетевом матче ручной перекладки нет вовсе (идея 0005, решение
      // автора): раскладка локальна и партнёру не передаётся, поэтому
      // перестройка по прихоти одного разводит столы двух устройств.
      // В истории и на стартовой карточке кнопки нет.
      elBtnRelayout!.hidden =
        live === null || live.remote || !live.round.placed.some((p) => p.kind === 'turn');
    },
    staticTexts() {
      elBtnMirror!.dataset.tip = L().tipMirror;
      elBtnMark!.dataset.tip = L().tipMark;
      elBtnRelayout!.dataset.tip = L().tipRelayout;
    },
  };

  const board: BoardFactory<GameState, Move> = (svg, hooks) => {
    const b = createBoard(svg, hooks);
    rawBoard = b;
    return {
      render: (state, o) =>
        b.render(state, {
          ghostMoves: o.ghostMoves,
          selected: o.selected,
          animateSeq: o.animateSeq,
          interactive: o.interactive,
          // Разметка принадлежности ходов — переключатель вида Dofodo.
          markOwners: o.game?.markOwners === true,
          pending: o.pending,
          hideSeq: o.hideSeq,
        }),
      placedScreenPoint: b.placedScreenPoint,
      ghostTargets: b.ghostTargets,
      ensureVisible: b.ensureVisible,
      setAutoFit: b.setAutoFit,
      isAutoFit: b.isAutoFit,
    };
  };

  return { engine: dofodoEngine, view, board };
}
