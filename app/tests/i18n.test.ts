// Подпись «Партия N (до T)» на итогах (фича 0015): цель матча стала
// выбираемой (50/100/150/200, идея 0002), и экран итогов — единственное
// место, где игрок сверяет счёт с финишем. Скобочная часть у языков
// разная, поэтому цель — параметр matchRoundLabel, а не склейка в UI;
// тест держит инвариант «каждый словарь показывает и номер, и цель»,
// чтобы новый язык или правка строки не потеряли одно из двух.
import { afterEach, describe, expect, it } from 'vitest';
import { L, LOCALES, setLocale } from '../src/ui/i18n';

afterEach(() => setLocale('ru'));

describe('matchRoundLabel (фича 0015)', () => {
  it('во всех языках несёт номер партии и цель матча — в этом порядке', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      const label = L().matchRoundLabel(10, 150);
      expect(label, code).toContain('10');
      expect(label, code).toContain('150');
      // Порядок ловит перепутанные плейсхолдеры (`Партия ${target}…`):
      // во всех локалях номер партии стоит раньше цели.
      expect(label.indexOf('10'), code).toBeLessThan(label.indexOf('150'));
    }
  });

  it('показывает и канонические 100 — дефолт не прячется', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      expect(L().matchRoundLabel(1, 100), code).toContain('100');
    }
  });
});

describe('словари целиком', () => {
  it('переключение локали реально меняет словарь', () => {
    const tag = (code: (typeof LOCALES)[number]['code']) => {
      setLocale(code);
      return L().tagline;
    };
    // Три разных семьи письма: скопированный словарь не спрячется.
    expect(tag('ru')).not.toBe(tag('en'));
    expect(tag('en')).not.toBe(tag('zh'));
  });

  it('каждая строка каждого словаря — непустая; каждая функция отрабатывает', () => {
    // Числовые аргументы по арности: шаблоны интерполируют их без потери
    // типа, а склонения (ruTiles/ukTiles) исполняют настоящие ветки.
    // Ловит упавший шаблон и NaN/undefined в тексте во всех словарях разом.
    const args = [2, 5, 7, 4] as const; // с запасом по арности словарных функций
    for (const { code } of LOCALES) {
      setLocale(code);
      const dict = L() as unknown as Record<string, unknown>;
      for (const [key, val] of Object.entries(dict)) {
        if (typeof val === 'function') {
          const out: unknown = (val as (...a: unknown[]) => unknown)(
            ...args.slice(0, Math.max(1, (val as { length: number }).length)),
          );
          expect(typeof out, `${code}.${key}`).toBe('string');
          expect((out as string).length, `${code}.${key}`).toBeGreaterThan(0);
          expect(out, `${code}.${key}`).not.toContain('undefined');
          expect(out, `${code}.${key}`).not.toContain('NaN');
        } else {
          expect(typeof val, `${code}.${key}`).toBe('string');
          expect((val as string).length, `${code}.${key}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('склонение счёта костей: русский и украинский по всем формам', () => {
    // handMetaHidden(n) = «N кость/кости/костей · …» — единственная
    // настоящая логика словарей; формы включают коварные 11 и 21.
    const cases: Array<[string, number, string]> = [
      ['ru', 1, 'кость'], ['ru', 2, 'кости'], ['ru', 5, 'костей'],
      ['ru', 11, 'костей'], ['ru', 21, 'кость'], ['ru', 22, 'кости'],
      ['uk', 1, 'кістка'], ['uk', 2, 'кістки'], ['uk', 5, 'кісток'],
      ['uk', 11, 'кісток'], ['uk', 21, 'кістка'],
    ];
    for (const [code, n, word] of cases) {
      setLocale(code as (typeof LOCALES)[number]['code']);
      expect(L().handMetaHidden(n), `${code}:${n}`).toContain(`${n} ${word}`);
    }
  });
});

// Единственное число счётчика костей: «1 tile», а не «1 tiles». В тестах
// игра всегда шла с полными руками — форма для одной кости ни разу не
// проверялась (подсчёт ветвей vitest 4, telesik-team#854).
describe('счётчик костей: одна кость и много', () => {
  const one: Partial<Record<(typeof LOCALES)[number]['code'], [string, string]>> = {
    en: ['1 tile', '7 tiles'],
    es: ['1 ficha', '7 fichas'],
    de: ['1 Stein', '7 Steine'],
    pt: ['1 peça', '7 peças'],
    fr: ['1 domino', '7 dominos'],
    it: ['1 tessera', '7 tessere'],
  };

  it('подпись руки и закрытой руки согласуется с числом', () => {
    for (const [code, [single, many]] of Object.entries(one)) {
      setLocale(code as (typeof LOCALES)[number]['code']);
      expect(L().handMeta(1, 3), code).toContain(single);
      expect(L().handMeta(1, 3), code).not.toContain(many.split(' ')[1]);
      expect(L().handMetaHidden(1), code).toContain(single);
      expect(L().handMeta(7, 30), code).toContain(many);
      expect(L().handMetaHidden(7), code).toContain(many);
    }
  });

  it('украинская отмена: 1 кістка, 3 кістки, 13 кісток, 22 кістки', () => {
    setLocale('uk');
    expect(L().handMeta(1, 0)).toContain('1 кістка');
    expect(L().handMeta(3, 0)).toContain('3 кістки');
    expect(L().handMeta(13, 0)).toContain('13 кісток');
    expect(L().handMeta(22, 0)).toContain('22 кістки');
  });
});
