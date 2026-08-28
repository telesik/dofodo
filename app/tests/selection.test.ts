// Политика выделения текста (баг 0022): долгое касание по столу — жест
// прицеливания, а не выделение, iOS же выделял SVG-подписи стола (цифры
// концов, бейдж базара) и поднимал меню Copy / Look Up поверх поля.
// Лекарство — глобальный запрет на body плюс точечные разрешения тому,
// что игрок копирует осознанно. Оба правила живут в style.css и легко
// теряются при рефакторинге стилей — тест держит сам инвариант политики.
// Каскад браузера здесь не воспроизводится (jsdom в проекте нет) — живое
// поведение проверено в браузере, протокол — в тикете 0022.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Файл читается напрямую (не vite-импортом `?raw`: vitest по умолчанию
// не гоняет CSS через пайплайн и отдаёт пустышку); путь — от module URL,
// без node:path и __dirname — их типов нет в tsconfig (types: vite/client).
const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

interface Rule {
  selectors: string[];
  decl: string;
}

/** Правила верхнего уровня «селекторы { декларации }»; @-блоки (media
 *  и прочие) пропускаются целиком — политика объявлена на верхнем уровне. */
function topLevelRules(source: string): Rule[] {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: Rule[] = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open < 0) break;
    const head = text.slice(i, open).trim();
    // Тело с учётом вложенности: у @media внутри свои блоки.
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') depth--;
      j++;
    }
    if (!head.startsWith('@')) {
      rules.push({
        selectors: head.split(',').map((s) => s.trim().replace(/\s+/g, ' ')),
        decl: text.slice(open + 1, j - 1),
      });
    }
    i = j;
  }
  return rules;
}

const rules = topLevelRules(css);
const has = (decl: string, prop: string, value: string): boolean =>
  new RegExp(`(^|[;\\s])${prop.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}\\s*:\\s*${value}\\b`).test(
    decl,
  );

describe('политика выделения текста (баг 0022)', () => {
  it('запрет объявлен на body: user-select и touch-callout', () => {
    const body = rules.find(
      (r) => r.selectors.includes('body') && has(r.decl, 'user-select', 'none'),
    );
    expect(body, 'на body нет запрета user-select: none').toBeTruthy();
    expect(has(body!.decl, '-webkit-user-select', 'none')).toBe(true);
    expect(has(body!.decl, '-webkit-touch-callout', 'none')).toBe(true);
  });

  it('исключения: поля ввода и то, что игрок копирует осознанно', () => {
    const allow = rules.find(
      (r) => has(r.decl, 'user-select', 'text') && r.selectors.includes('input'),
    );
    expect(allow, 'нет разрешающего правила user-select: text с input').toBeTruthy();
    // Поля ввода — iOS без явного text не даёт в них ни курсора, ни
    // выделения; остальное — строка версии (карточка и бейдж), тексты
    // настроек, счётчик позиции истории.
    for (const sel of [
      'input',
      '#version-badge',
      '.card .version-line',
      '#settings .card',
      '#history-bar .replay-pos',
    ]) {
      expect(allow!.selectors, `в исключениях нет «${sel}»`).toContain(sel);
    }
    expect(has(allow!.decl, '-webkit-user-select', 'text')).toBe(true);
  });
});
