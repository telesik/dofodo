// Защитные ветви движка, до которых игра в тестах не доходит: законченный
// раунд, корень без дублей и без базара, кость не из руки. Подсчёт ветвей
// vitest 4 показал, что их никто не проверял (telesik-team#854).
import { describe, expect, it } from 'vitest';
import { applyMoveTrusted, chooseBotMove, isFish, legalMoves, type GameState } from '../src/engine';
import { makeState } from './helpers';

const main = (): GameState => makeState({ hands: [['4-5', '2-3'], ['1-1']], ends: [{ value: 5 }] });

describe('движок: защитные ветви', () => {
  it('законченный раунд: ходов нет, бот отказывается ходить', () => {
    const over: GameState = { ...main(), phase: 'over' };
    expect(legalMoves(over)).toEqual([]);
    expect(() => chooseBotMove(over)).toThrow('Нет легальных ходов');
  });

  it('корень без дублей: добор, а без базара — пас', () => {
    const root: GameState = { ...main(), phase: 'root', ends: [], placed: [], occupied: [] };
    expect(legalMoves({ ...root, boneyard: ['6-6'] })).toEqual([{ type: 'draw' }]);
    expect(legalMoves({ ...root, boneyard: [] })).toEqual([{ type: 'pass' }]);
    // До корня рыбы не бывает: стол ещё пуст.
    expect(isFish(root)).toBe(false);
  });

  it('кость не из руки: доверенный ход падает с понятной ошибкой', () => {
    expect(() => applyMoveTrusted(main(), { type: 'placeRoot', tile: '6-6' })).toThrow('Кости 6-6 нет в руке');
  });
});
