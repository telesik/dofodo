// Логотип: фигура с иконки — пять костей (6:6, 6:1, 1:4, 4:4, 1:1) и пешка,
// чистый inline-SVG без внешних ресурсов (решение автора 07.09.2026).
import { describe, expect, it } from 'vitest';
import { logoSvg } from '../src/ui/logo';

describe('logoSvg', () => {
  it('пять костей, 6+6+6+1+1+4+4+4+1+1 = 34 точки, пешка, размер по высоте', () => {
    const svg = logoSvg(48, 'x');
    expect(svg.startsWith('<svg class="logo x"')).toBe(true);
    expect(svg).toContain('height="48"');
    expect((svg.match(/<rect /g) ?? []).length).toBe(5);
    expect((svg.match(/<circle cx=/g) ?? []).length).toBe(34 + 1); // + голова пешки
    expect(svg).toContain('<ellipse'); // тень пешки
    expect(svg).not.toContain('url(');
    expect(svg).not.toContain('http');
  });
});
