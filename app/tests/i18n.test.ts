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
  it('во всех языках несёт номер партии и цель матча', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      const label = L().matchRoundLabel(10, 150);
      expect(label, code).toContain('10');
      expect(label, code).toContain('150');
    }
  });

  it('показывает и канонические 100 — дефолт не прячется', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      expect(L().matchRoundLabel(1, 100), code).toContain('100');
    }
  });
});
