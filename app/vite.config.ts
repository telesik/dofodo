import { execSync } from 'node:child_process';
import { defineConfig } from 'vitest/config';

/** Короткий хэш коммита; «+» в конце — в рабочем дереве есть незакоммиченное. */
function gitHash(): string {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const dirty = execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
    return dirty ? `${hash}+` : hash;
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
    __GIT_HASH__: JSON.stringify(gitHash()),
  },
  test: {
    // Метрика покрытия (тикет 0014): `npm run coverage` — отчёт в терминал
    // (text), для глаз (html в coverage/, вне git) и машиночитаемый (lcov).
    // Пороги — «пол-храповик» (ratchet): зафиксирован ПЕРВЫЙ фактический
    // замер, округлённый вниз до целых, — падение покрытия валит прогон,
    // рост со временем закрепляется поднятием порога (решением автора,
    // не автоматически). Цифры честно неравномерны: движок покрыт плотно
    // (тесты по параграфам правил + симуляция), UI-контроллер app.ts —
    // интеграционно стендом мобильного, юнитами почти нет.
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      reporter: ['text', 'html', 'lcov'],
      // Первый замер 28.08.2026: lines/stmts 46.54, branches 85.07,
      // functions 18.13 (движок 93.5%, UI юнитами почти не покрыт).
      // Этап 29.08.2026 (тикет 0014): на чистом дереве lines/stmts 52.99,
      // branches 90.79 — покрыты tile-svg, replay, rng, sound (разметка
      // записей), словарные функции i18n, shuffleLayout. Вне юнитов остаются
      // DOM-слои app.ts, board.ts (createBoard) и main.ts — они под
      // интеграционным стендом мобильного. Пол branches — с зазором ~2 пп
      // (запас на новые ветки движка). Пол functions НЕ поднят осознанно:
      // v8 пишет неимпортированный app.ts как одну «покрытую» (empty-report)
      // функцию, а 3/4 знаменателя — словарные стрелки i18n; факт 98.77 —
      // артефакт метрики, и первый же юнит с импортом app.ts обрушил бы его
      // до ~83. Вернуться к полу functions на DOM-этапе (jsdom-смоук initApp).
      thresholds: {
        lines: 52,
        statements: 52,
        functions: 18,
        branches: 80, // 07.09.2026: jsdom-тест приложения включил app.ts и board.ts в отчёт (решение автора)
      },
    },
  },
});
