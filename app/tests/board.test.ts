// Геометрия сцены стола. Правил не касается (§6.3: раскладка правилам
// безразлична) — здесь проверяется только то, что картинка строится верно.
import { describe, expect, it } from 'vitest';
import { farHalfGhosts, sceneCell, shadedEndIds, tileTransform } from '../src/ui/board';
import { CELL } from '../src/ui/tile-svg';
import { legalMoves, type Move, type Vec } from '../src/engine';
import { BASE, playout } from './helpers';

/** Угол из строки transform, приведённый к [0, 360). */
function angleOf(tr: string): number {
  const m = /rotate\((-?[\d.]+)\)/.exec(tr);
  expect(m).not.toBeNull();
  return ((Number(m![1]) % 360) + 360) % 360;
}

function centerOf(tr: string): { x: number; y: number } {
  const m = /translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tr);
  expect(m).not.toBeNull();
  return { x: Number(m![1]), y: Number(m![2]) };
}

describe('зеркальный стол (§6.3 — только вид)', () => {
  it('sceneCell отражает x, не трогает y и обратим', () => {
    const c: Vec = { x: 3, y: -2 };
    expect(sceneCell(c, false)).toEqual(c);
    expect(sceneCell(c, true)).toEqual({ x: -3, y: -2 });
    expect(sceneCell(sceneCell(c, true), true)).toEqual(c);
  });

  it('корень ложится тупиком влево, в зеркале — тупиком вправо', () => {
    // ROOT_CELLS = [{-1,0},{0,0}]: рост на восток, тупик на западе.
    const a: Vec = { x: -1, y: 0 };
    const b: Vec = { x: 0, y: 0 };
    expect(tileTransform(a, b, false)).toBe(`translate(${(-CELL / 2).toFixed(1)} 0.0) rotate(0.0)`);
    expect(tileTransform(a, b, true)).toBe(`translate(${(CELL / 2).toFixed(1)} 0.0) rotate(180.0)`);
  });

  it('зеркало = отражение центра и поворот на 180° − угол, для всех направлений', () => {
    // Кость занимает две соседние клетки: четыре направления в четырёх местах
    // стола, включая отрицательные координаты и ось x = 0.
    const anchors: Vec[] = [
      { x: 0, y: 0 },
      { x: 3, y: 2 },
      { x: -4, y: 1 },
      { x: 2, y: -5 },
    ];
    const steps: Vec[] = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    for (const a of anchors) {
      for (const s of steps) {
        const b: Vec = { x: a.x + s.x, y: a.y + s.y };
        const plain = tileTransform(a, b, false);
        const mirrored = tileTransform(a, b, true);
        const p = centerOf(plain);
        const m = centerOf(mirrored);
        expect(m.x).toBeCloseTo(-p.x, 6);
        expect(m.y).toBeCloseTo(p.y, 6);
        // Ровно этот инвариант и легко потерять: отразить центр, а угол забыть.
        expect(angleOf(mirrored)).toBeCloseTo((360 + 180 - angleOf(plain)) % 360, 6);
      }
    }
  });

  it('дубль поперёк (§7.1) отражается вместе с полуклетками', () => {
    // Поперёк ветки, растущей вниз: кость занимает половинки слева и справа
    // от клетки роста — координаты дробные, и отражение обязано их пережить.
    const a: Vec = { x: 1.5, y: 3 };
    const b: Vec = { x: 2.5, y: 3 };
    const m = centerOf(tileTransform(a, b, true));
    expect(m.x).toBeCloseTo(-2 * CELL, 6);
    expect(m.y).toBeCloseTo(3 * CELL, 6);
    // Дубль симметричен: обе половинки равны, поворот на 180° не виден.
    expect(angleOf(tileTransform(a, b, true))).toBeCloseTo(180, 6);
  });

  it('вертикальная кость в зеркале остаётся вертикальной', () => {
    // Ветка, растущая вниз: отражение по x не должно её «класть».
    const tr = tileTransform({ x: 2, y: 0 }, { x: 2, y: 1 }, true);
    expect(angleOf(tr)).toBeCloseTo(90, 6);
    expect(centerOf(tr).x).toBeCloseTo(-2 * CELL, 6);
  });
});

describe('подписи концов и тени (идея 0010)', () => {
  // Ходы в каноническом виде: TileId через дефис (tileId в tiles.ts),
  // поперёк кладётся только дубль (§7.1).
  const place = (
    tile: string,
    endId: number,
    mode: 'straight' | 'turn' | 'cross',
    side?: 0 | 1,
  ): Move => ({
    type: 'place',
    tile,
    endId,
    mode,
    ...(side !== undefined ? { side } : {}),
  });

  it('без выбранной кости не затенён ни один конец', () => {
    // Гейт по selected — защита контракта render: непустые ghostMoves
    // без выбранной кости не рисуются, значит и подписи не гасятся.
    expect(shadedEndIds([], null).size).toBe(0);
    expect(shadedEndIds([place('6-4', 1, 'straight')], null).size).toBe(0);
  });

  it('в наборе — ровно концы переданных теней', () => {
    const shaded = shadedEndIds(
      [place('6-4', 1, 'straight'), place('3-3', 3, 'cross')],
      '6-4',
    );
    // Про game.ends функция не знает: гасится лишь то, куда легла тень,
    // конец без тени (id вне списка ходов) остаётся с подписью.
    expect([...shaded].sort()).toEqual([1, 3]);
  });

  it('поворот двумя тенями затеняет свой конец, тень корня — ничего', () => {
    const turns = shadedEndIds(
      [place('6-4', 5, 'turn', 0), place('6-4', 5, 'turn', 1)],
      '6-4',
    );
    expect([...turns]).toEqual([5]);
    // До корня концов нет вовсе: тень корня не касается подписей.
    const root: Move = { type: 'placeRoot', tile: '6-6' };
    expect(shadedEndIds([root], '6-6').size).toBe(0);
  });

  it('endId каждого легального хода есть среди game.ends', () => {
    // Гашение ищет маркер по id: единственный способ его сломать —
    // разъезд нумераций Move.endId и End.id. Целая партия случайной
    // политикой проверяет соответствие на каждом ходе.
    playout(20260827, 0, BASE, (state) => {
      const ids = new Set(state.ends.map((e) => e.id));
      for (const m of legalMoves(state)) {
        if (m.type === 'place') expect(ids.has(m.endId)).toBe(true);
      }
    });
  });
});

describe('приставная половина теней конца (идея 0017)', () => {
  const place = (
    tile: string,
    endId: number,
    mode: 'straight' | 'turn' | 'cross',
    side?: 0 | 1,
  ): Move => ({
    type: 'place',
    tile,
    endId,
    mode,
    ...(side !== undefined ? { side } : {}),
  });

  it('рядом с прямой тенью повороты остаются без приставной половины', () => {
    const straight = place('6-4', 5, 'straight');
    const t0 = place('6-4', 5, 'turn', 0);
    const t1 = place('6-4', 5, 'turn', 1);
    const far = farHalfGhosts([straight, t0, t1]);
    expect(far.has(t0)).toBe(true);
    expect(far.has(t1)).toBe(true);
    expect(far.has(straight)).toBe(false);
  });

  it('конец из одних поворотов не трогается: приставки 180°-симметричны', () => {
    const far = farHalfGhosts([place('6-4', 5, 'turn', 0), place('6-4', 5, 'turn', 1)]);
    expect(far.size).toBe(0);
  });

  it('прямая тень другого конца поворот не урезает', () => {
    const turn = place('6-4', 5, 'turn', 0);
    expect(farHalfGhosts([place('6-4', 1, 'straight'), turn]).has(turn)).toBe(false);
  });

  it('черновик хода рисуется полным: он показывает, как кость ляжет', () => {
    const straight = place('6-4', 5, 'straight');
    const t0 = place('6-4', 5, 'turn', 0);
    const t1 = place('6-4', 5, 'turn', 1);
    const far = farHalfGhosts([straight, t0, t1], t0);
    // Сторона поворота — часть тождества хода: урезанным перестаёт быть
    // ровно выбранный поворот, его зеркальный собрат остаётся дальней половиной.
    expect(far.has(t0)).toBe(false);
    expect(far.has(t1)).toBe(true);
  });

  it('пара «прямо + поперёк» дубля не в счёт', () => {
    const far = farHalfGhosts([place('3-3', 2, 'straight'), place('3-3', 2, 'cross')]);
    expect(far.size).toBe(0);
  });
});
