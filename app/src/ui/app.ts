// Приложение Dofodo: общий каркас студии (экраны, руки, базар, история,
// настройки, оркестровка ходов — подмодуль commons/, telesik-web-commons)
// плюс игра (game.ts: виды, тексты, стол, кнопки шапки Dofodo).
// Контракт для платформенной надстройки — AppOptions и AppHandle — прежний.

import { initShell } from '../../../commons/src/shell/shell';
import type {
  AppHandle as ShellAppHandle,
  AppOptions as ShellAppOptions,
  StartSetup as ShellStartSetup,
} from '../../../commons/src/shell/types';
import type { GameState, MatchOutcome, Move, RoundResult, Variant } from '../engine';
import { createDofodoGame } from './game';
import { detectLocale, getLocale, L, LOCALES, setLocale, type Locale } from './i18n';

export type { KVStore } from './store';
export type {
  ExtraAction,
  ExtraToggle,
  NextRoundWait,
  OpponentOption,
} from '../../../commons/src/shell/types';
export { MATCH_TARGETS } from './game';

/** Ключи хранилища: сейв матча и настройки интерфейса. Экспортированы для
 *  мобильной надстройки (миграция, паспорт сети) — литералы там повторялись. */
export const LS_KEY = 'bonesai-match-v1';
export const LS_UI_KEY = 'bonesai-ui-v1';

/** Параметры старта матча, собранные стартовым экраном. */
export type StartSetup = ShellStartSetup<Variant>;

/** Что платформа (веб-вход, мобильная надстройка) настраивает в приложении. */
export type AppOptions = ShellAppOptions<GameState, Move, Variant, RoundResult, MatchOutcome>;

/** Управление приложением снаружи: вход внешних ходов и чтение состояния. */
export type AppHandle = ShellAppHandle<GameState, Move, Variant, RoundResult, MatchOutcome>;

export function initApp(opts: AppOptions = {}): AppHandle {
  return initShell({
    ...opts,
    game: createDofodoGame(),
    keys: { match: LS_KEY, ui: LS_UI_KEY },
    i18n: {
      getLocale,
      // Коды приходят из LOCALES — того же списка, что рисует селектор.
      setLocale: (code) => setLocale(code as Locale),
      detectLocale,
      locales: LOCALES,
    },
    texts: L,
    build: { version: __APP_VERSION__, hash: __GIT_HASH__ },
  });
}
