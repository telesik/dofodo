// @vitest-environment jsdom
// Рука всегда вертикальна (идея 0035 штаба): переключателя «кости в руке
// горизонтально» в настройках больше нет, старое сохранённое значение
// handsVertical:false игнорируется без падений и не переписывается обратно.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { initApp } from '../src/ui/app';
import { L, LOCALES, setLocale } from '../src/ui/i18n';

const LS_UI_KEY = 'bonesai-ui-v1';

function mountIndexHtml(): void {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
  const body = /<body>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/g, '');
}

describe('рука всегда вертикальна', () => {
  const mem = new Map<string, string>();
  const storage = {
    get: (k: string) => mem.get(k) ?? null,
    set: (k: string, v: string) => void mem.set(k, v),
    remove: (k: string) => void mem.delete(k),
  };

  beforeAll(() => {
    (globalThis as { matchMedia?: unknown }).matchMedia = () => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    mountIndexHtml();
    // jsdom не реализует scrollTo у элементов — рука прокручивается к ходу.
    Element.prototype.scrollTo = () => undefined;
    // Настройки сборки до 07.09.2026: горизонтальная рука и выключенный звук.
    mem.set(LS_UI_KEY, JSON.stringify({ handsVertical: false, sound: false, locale: 'ru' }));
  });

  it('старые настройки с handsVertical:false не мешают старту, переключателя нет', () => {
    const app = initApp({ storage });
    expect(app.getMatch()).toBeNull();
    document.getElementById('btn-settings')?.click();
    const toggles = [...document.querySelectorAll<HTMLInputElement>('#settings input[data-set]')].map(
      (i) => i.dataset.set,
    );
    expect(toggles).toContain('sound');
    expect(toggles).not.toContain('hands');

    // Кости в руке стоят вертикально: узкая сторона по горизонтали.
    app.startRemoteMatch({
      names: ['А', 'Б'],
      first: 0,
      variant: { doubleOnlyCloses: false },
      seed: 7,
      remoteSeat: 1,
    });
    const svgs = document.querySelectorAll<SVGSVGElement>('#hand-bottom .hand-tile svg.tile-svg');
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) {
      expect(Number(svg.getAttribute('width'))).toBeLessThan(Number(svg.getAttribute('height')));
    }

    // Сохранённые настройки больше не содержат ключа ориентации.
    const sound = document.querySelector<HTMLInputElement>('#settings input[data-set="sound"]');
    sound?.click();
    const saved = JSON.parse(mem.get(LS_UI_KEY) ?? '{}') as Record<string, unknown>;
    expect('handsVertical' in saved).toBe(false);
  });

  it('строки tipOrient нет ни в одном словаре', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      expect('tipOrient' in L()).toBe(false);
    }
    setLocale('ru');
  });
});
