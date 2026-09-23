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
      // Первый замер 28.08.2026: 46.54 строк / 85.07 веток / 18.13 функций;
      // история замеров и решений по полам с тех пор — в штабе,
      // telesik-hq projects/dofodo/ops/coverage-web-history.md (telesik-team#52).
      thresholds: {
        // Храповик (решение автора 20.09.2026, telesik-team#115): полы подняты
        // вслед за фактом 98,9 / 98,9 / 99,6 / 92,7 после страховки UI
        // jsdom-тестами (app-start/play/history/handle, board-pointer) с
        // зазором ~2–3 пп. Прежние 85/85/95/84 — тем же днём по #112;
        // 77/77/90/80 — с 17.09. Норма веток 88 (снижение 07.09) возвращена.
        lines: 96,
        statements: 96,
        functions: 97,
        branches: 90,
      },
    },
  },
});
