// @vitest-environment jsdom
// «Как играть» (идея 0032): шесть слайдов, навигация вперёд/назад, «Пропустить»
// и «Понятно» закрывают, тап по фону закрывает; на последнем слайде —
// ссылка на полные правила; все семь языков дают полный набор строк.
import { describe, expect, it, vi } from 'vitest';
import { howtoSlides, openHowTo } from '../src/ui/howto';
import { L, LOCALES, setLocale } from '../src/ui/i18n';

const root = (): HTMLElement | null => document.getElementById('howto');
const kicker = (): string => root()?.querySelector('.howto-kicker')?.textContent ?? '';
const click = (sel: string): void => {
  const el = root()?.querySelector<HTMLElement>(sel);
  if (!el) throw new Error(`нет ${sel}`);
  el.click();
};

describe('howto', () => {
  it('шесть слайдов, у каждого заголовок, текст и сцена с костями', () => {
    setLocale('ru');
    const slides = howtoSlides();
    expect(slides).toHaveLength(6);
    for (const s of slides) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.text.length).toBeGreaterThan(0);
      expect(s.scene).toContain('<svg');
      expect(s.scene).toContain('tile-face');
    }
  });

  it('навигация: далее до конца, назад, «Понятно» закрывает', () => {
    setLocale('ru');
    document.body.innerHTML = '';
    const onClose = vi.fn();
    openHowTo({ rulesUrl: 'https://example.test/rules', onClose });
    expect(kicker()).toContain('1 из 6');
    for (let i = 0; i < 5; i++) click('[data-howto="next"]');
    expect(kicker()).toContain('6 из 6');
    expect(root()?.querySelector('[data-howto="next"]')).toBeNull();
    expect(root()?.querySelector('a[href="https://example.test/rules"]')).not.toBeNull();
    click('[data-howto="prev"]');
    expect(kicker()).toContain('5 из 6');
    click('[data-howto="next"]');
    click('[data-howto="done"]');
    expect(root()).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('«Пропустить» и тап по фону закрывают', () => {
    document.body.innerHTML = '';
    openHowTo({ rulesUrl: 'x' });
    click('[data-howto="skip"]');
    expect(root()).toBeNull();
    openHowTo({ rulesUrl: 'x' });
    root()!.click();
    expect(root()).toBeNull();
  });

  it('все семь языков: строки на месте, слайды строятся', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      expect(L().howtoKicker(2, 5)).toContain('2');
      expect(howtoSlides()).toHaveLength(6);
    }
    setLocale('ru');
  });
});
