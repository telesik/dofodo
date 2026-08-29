// Отрисовка костей — чистые строковые генераторы SVG (tile-svg.ts).
// Правил не касается: проверяется, что разметка несёт нужные элементы
// и размеры, — упавший шаблон (NaN в координатах, потерянные пипсы,
// перепутанные оси вертикальной обёртки) ловится без браузера.
import { describe, expect, it } from 'vitest';
import {
  TILE_L,
  TILE_W,
  bonsaiEmblem,
  tileBack,
  tileDefs,
  tileFace,
  tileSvgElement,
} from '../src/ui/tile-svg';

/** Число пипсов в фрагменте разметки. */
function pipCount(svg: string): number {
  return (svg.match(/class="pip"/g) ?? []).length;
}

describe('tile-svg — общие определения', () => {
  it('tileDefs несёт все id, на которые ссылаются кости и разметка ходов', () => {
    const defs = tileDefs();
    for (const id of ['g-ivory', 'g-back', 'f-tile', 'f-raised', 'f-own-first', 'f-own-second']) {
      expect(defs).toContain(`id="${id}"`);
    }
  });

});

describe('tileFace — лицо кости', () => {
  it('рисует ровно a+b пипсов для каждой пары значений', () => {
    for (let a = 0; a <= 6; a++) {
      for (let b = 0; b <= 6; b++) {
        expect(pipCount(tileFace(a, b)), `${a}:${b}`).toBe(a + b);
      }
    }
  });

  it('в координатах нет NaN', () => {
    for (const svg of [tileFace(0, 0), tileFace(6, 6), tileBack(), tileDefs()]) {
      expect(svg).not.toContain('NaN');
    }
  });

  it('тень: по умолчанию f-tile, raised — f-raised, flat — без фильтра', () => {
    expect(tileFace(1, 2)).toContain('url(#f-tile)');
    expect(tileFace(1, 2, { shadow: 'raised' })).toContain('url(#f-raised)');
    expect(tileFace(1, 2, { shadow: 'flat' })).not.toContain('filter=');
  });

  it('золотая окантовка корня — только по opts.accent', () => {
    const rects = (svg: string) => (svg.match(/<rect /g) ?? []).length;
    const plain = tileFace(3, 3);
    const accented = tileFace(3, 3, { accent: true });
    expect(accented).toContain('#c9a86a');
    expect(rects(accented)).toBe(rects(plain) + 1); // рамка — дополнительный rect
    expect(plain).not.toContain('#c9a86a');
  });

  it('дополнительный класс попадает на группу', () => {
    expect(tileFace(0, 1, { className: 'ghost' })).toContain('class="tile-face ghost"');
  });
});

describe('tileBack — рубашка', () => {
  it('тёмный лак с эмблемой бонсая и рамкой', () => {
    const svg = tileBack();
    expect(svg).toContain('url(#g-back)');
    expect(svg).toContain('class="emblem"');
    expect(svg).toContain('url(#f-tile)');
    expect(tileBack({ shadow: 'flat' })).not.toContain('filter=');
  });
});

describe('bonsaiEmblem', () => {
  it('позиция и масштаб уходят в transform', () => {
    const svg = bonsaiEmblem(10, -4, 40);
    expect(svg).toContain('translate(10 -4)');
    expect(svg).toContain('scale(2)');
    expect(svg).not.toContain('NaN');
  });
});

describe('tileSvgElement — обёртка для рук и базара', () => {
  it('горизонтальная: ширина w, высота по пропорции кости', () => {
    const svg = tileSvgElement(tileFace(2, 5), 96);
    const h = (96 * TILE_W) / TILE_L;
    expect(svg).toContain(`width="96"`);
    expect(svg).toContain(`height="${h}"`);
    expect(svg).toMatch(/class="tile-svg\b/);
    expect(svg).not.toContain('rotate(90)');
  });

  it('вертикальная: стороны меняются местами, внутренности повёрнуты на 90°', () => {
    const svg = tileSvgElement(tileFace(2, 5), 96, { vertical: true });
    const h = (96 * TILE_W) / TILE_L;
    expect(svg).toContain(`width="${h}"`);
    expect(svg).toContain(`height="96"`);
    expect(svg).toContain('rotate(90)');
  });

  it('extraClass добавляется к классу svg', () => {
    expect(tileSvgElement('', 50, { extraClass: 'pile-tile' })).toContain(
      'class="tile-svg pile-tile"',
    );
  });
});
