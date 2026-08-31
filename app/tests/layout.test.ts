// Раскладка стола: выбор стороны поворота (§6.3 — правилам безразличен)
// и перекладка веток при наложении.

import { describe, expect, it } from 'vitest';
import {
  applyMove,
  cellKey,
  DIR,
  legalMoves,
  newRound,
  placementGeometry,
  shuffleLayout,
  simulateLayout,
  type Move,
} from '../src/engine';
import { BASE, makeState, playout } from './helpers';

type PlaceMove = Extract<Move, { type: 'place' } | { type: 'placeRoot' }>;

describe('сторона поворота (§6.3)', () => {
  const state = () =>
    makeState({
      hands: [['2-5'], ['0-1']],
      ends: [{ id: 0, value: 2, attach: { x: 3, y: 0 }, dir: DIR.E, fresh: false }],
    });

  it('side выбирает перпендикуляр: 0 — север, 1 — юг (для конца на восток)', () => {
    const g0 = placementGeometry(state(), '2-5', 0, 'turn', 0);
    expect(g0.cells[1]).toEqual({ x: 3, y: -1 });
    expect(g0.newEnds[1]!.dir).toEqual({ x: 0, y: -1 });
    const g1 = placementGeometry(state(), '2-5', 0, 'turn', 1);
    expect(g1.cells[1]).toEqual({ x: 3, y: 1 });
    expect(g1.newEnds[1]!.dir).toEqual({ x: 0, y: 1 });
  });

  it('без side сторона выбирается автоматически, как раньше', () => {
    const g = placementGeometry(state(), '2-5', 0, 'turn');
    expect([-1, 1]).toContain(g.cells[1]!.y);
  });

  it('applyMove кладёт кость на выбранную сторону и пишет side в протокол', () => {
    const next = applyMove(state(), {
      type: 'place',
      tile: '2-5',
      endId: 0,
      mode: 'turn',
      side: 1,
    });
    expect(next.placed[0]!.cells[1]).toEqual({ x: 3, y: 1 });
    const recorded = next.history[0]!;
    expect(recorded.type).toBe('place');
    if (recorded.type === 'place') expect(recorded.side).toBe(1);
  });
});

describe('перекладка веток при наложении', () => {
  // Спираль: три поворота в одну сторону закручивают ветку, и очередная
  // прямая кость ложится точно на корень. Ходы легальны по структуре:
  // повороты — только на концы, оставшиеся от прямых (не свежие).
  const spiral: PlaceMove[] = [
    { type: 'placeRoot', tile: '0-0' },
    { type: 'place', tile: '0-1', endId: 0, mode: 'turn', side: 1 }, // юг
    { type: 'place', tile: '1-2', endId: 2, mode: 'straight' },
    { type: 'place', tile: '2-3', endId: 3, mode: 'turn', side: 1 }, // запад
    { type: 'place', tile: '3-4', endId: 5, mode: 'straight' },
    { type: 'place', tile: '4-5', endId: 6, mode: 'turn', side: 1 }, // север
    { type: 'place', tile: '5-6', endId: 8, mode: 'straight' },
    { type: 'place', tile: '6-0', endId: 9, mode: 'turn', side: 1 }, // восток, к корню
    { type: 'place', tile: '0-2', endId: 11, mode: 'straight' }, // легла бы на корень
  ];

  it('без перекладки спираль в самом деле наезжает на корень', () => {
    expect(simulateLayout(spiral, { respectAllSides: true })).toBeNull();
  });

  it('перекладка флипует один из поворотов и убирает наложение', () => {
    const res = simulateLayout(spiral);
    expect(res).not.toBeNull();
    // Последний поворот ушёл в другую сторону (на запад вместо востока)…
    expect(res!.cells[7]).toEqual([
      { x: -3, y: 0 },
      { x: -4, y: 0 },
    ]);
    // …и прямая кость легла свободно, а не на корень.
    expect(res!.cells[8]).toEqual([
      { x: -5, y: 0 },
      { x: -6, y: 0 },
    ]);
    // Клетки всех костей уникальны — наложений нет.
    const keys = res!.cells.flatMap((c) => c.map((v) => `${v.x},${v.y}`));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('пока наложений нет, записанные стороны соблюдаются', () => {
    const res = simulateLayout(spiral.slice(0, 8), { respectAllSides: true });
    expect(res).not.toBeNull();
    // Последний поворот лежит именно на записанной стороне (восток).
    expect(res!.cells[7]).toEqual([
      { x: -3, y: 0 },
      { x: -2, y: 0 },
    ]);
  });

  it('упор конца в ветку (без наложения) чинится requireFreeEnds', () => {
    // После 8 ходов спирали наложения нет, но конец последнего поворота
    // упёрся клеткой роста прямо в корень.
    const eight = spiral.slice(0, 8);
    const plain = simulateLayout(eight, { respectAllSides: true })!;
    const occ = new Set(plain.occupied);
    expect(plain.ends.some((e) => occ.has(`${e.attach.x},${e.attach.y}`))).toBe(true);
    // Со свободными концами поворот флипается, упора нет.
    const free = simulateLayout(eight, { requireFreeEnds: true })!;
    expect(free).not.toBeNull();
    const occ2 = new Set(free.occupied);
    expect(free.ends.every((e) => !occ2.has(`${e.attach.x},${e.attach.y}`))).toBe(true);
  });

  it('соль даёт другую валидную раскладку того же дерева', () => {
    const eight = spiral.slice(0, 8);
    const base = simulateLayout(eight)!;
    let different = false;
    for (let s = 1; s <= 8 && !different; s++) {
      const alt = simulateLayout(eight, { salt: s });
      if (alt && JSON.stringify(alt.cells) !== JSON.stringify(base.cells)) different = true;
    }
    expect(different).toBe(true);
  });
});

describe('shuffleLayout — ручная перекладка (кнопка ↺)', () => {
  it('другая геометрия при неизменной топологии: клетки согласованы, концы те же', () => {
    // Ищем сыгранную партию, где другая раскладка существует; детерминировано.
    const topo = (ends: readonly { id: number; value: number; fresh: boolean; fromSeq: number }[]) =>
      ends.map((e) => `${e.id}:${e.value}:${e.fresh}:${e.fromSeq}`).sort();
    let found = '';
    for (let seed = 1; seed <= 30 && !found; seed++) {
      const state = playout(seed, 0, BASE);
      for (let salt = 1; salt <= 8; salt++) {
        const next = shuffleLayout(state, salt);
        if (!next) continue;
        found = `seed=${seed} salt=${salt}`;
        // Перекладка обязана дать другую геометрию хотя бы одной кости…
        expect(JSON.stringify(next.placed.map((p) => p.cells)), found).not.toBe(
          JSON.stringify(state.placed.map((p) => p.cells)),
        );
        // …без наложений: у каждой кости две клетки, все уникальны.
        const cells = next.placed.flatMap((p) => p.cells);
        expect(cells, found).toHaveLength(next.placed.length * 2);
        const keys = cells.map((c) => cellKey(c));
        expect(new Set(keys).size, found).toBe(keys.length);
        // occupied — без дублей и того же размера, что до перекладки
        // (поперечный дубль хранит в cells две полуклетки, а занимает три
        // целых, поэтому сверяется размер, а не поимённый состав).
        expect(new Set(next.occupied).size, found).toBe(next.occupied.length);
        expect(next.occupied.length, found).toBe(state.occupied.length);
        // Кости с целыми клетками лежат ровно на занятых клетках.
        for (const p of next.placed) {
          for (const c of p.cells) {
            if (Number.isInteger(c.x) && Number.isInteger(c.y)) {
              expect(next.occupied, found).toContain(cellKey(c));
            }
          }
        }
        // Топология концов неизменна (§6.3): id/value/fresh/fromSeq те же.
        expect(topo(next.ends), found).toEqual(topo(state.ends));
        break;
      }
    }
    expect(found, '30 плейаутов × 8 солей не дали ни одной перекладки — регрессия?').toBeTruthy();
  });

  it('дерево из одного корня: другой раскладки нет — null', () => {
    // Настоящий стол с одной костью: первый ход placeRoot через движок.
    let rooted: ReturnType<typeof applyMove> | null = null;
    for (let seed = 1; seed <= 10 && !rooted; seed++) {
      const st = newRound({ seed, first: 0, variant: BASE });
      const root = legalMoves(st).find((m) => m.type === 'placeRoot');
      if (root) rooted = applyMove(st, root);
    }
    expect(rooted, 'ни в одной раздаче 1..10 у первого игрока нет дубля?').not.toBeNull();
    expect(rooted!.placed).toHaveLength(1);
    for (let salt = 1; salt <= 8; salt++) expect(shuffleLayout(rooted!, salt)).toBeNull();
  });

  it('пустая история (вырожденный вход) — null, защитная ветка', () => {
    expect(shuffleLayout(makeState({ hands: [['6-6'], ['1-2']] }), 3)).toBeNull();
  });
});
