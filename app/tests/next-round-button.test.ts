// Идея 0030 штаба: три состояния кнопки «Следующая партия» в матче
// с внешним игроком; в локальной игре состояние договора игнорируется.
import { describe, expect, it } from 'vitest';
import { nextRoundButton } from '../src/ui/next-round-button';
import { L, LOCALES, setLocale, type Dict } from '../src/ui/i18n';

setLocale('ru');
const t: Dict = L();
const has = (html: string, ...parts: string[]): void => {
  for (const p of parts) expect(html).toContain(p);
};

describe('nextRoundButton', () => {
  it('никто не нажал — обычная активная кнопка', () => {
    const html = nextRoundButton(null, true, t);
    has(html, 'data-action="next-round"', t.btnNextRound);
    expect(html).not.toContain('disabled');
    expect(html).not.toMatch(/waiting|peer-ready/);
  });

  it('нажали мы — кнопка погашена и ждёт соперника', () => {
    const html = nextRoundButton({ waiting: true, peerReady: false }, true, t);
    has(html, 'class="btn waiting"', 'disabled', t.btnWaiting);
    expect(html).not.toContain(t.btnNextRound);
  });

  it('соперник нажал первым — кнопка активна и зовёт', () => {
    const html = nextRoundButton({ waiting: false, peerReady: true }, true, t);
    has(html, 'class="btn peer-ready"', t.btnPeerReady);
    expect(html).not.toContain('disabled');
  });

  it('нажали оба (договор ещё не применён) — приоритет у нашего ожидания', () => {
    const html = nextRoundButton({ waiting: true, peerReady: true }, true, t);
    has(html, 'waiting', 'disabled', t.btnWaiting);
  });

  it('локальная игра — состояние договора игнорируется', () => {
    for (const w of [
      { waiting: true, peerReady: false },
      { waiting: false, peerReady: true },
    ]) {
      const html = nextRoundButton(w, false, t);
      has(html, t.btnNextRound);
      expect(html).not.toMatch(/disabled|waiting|peer-ready/);
    }
  });

  it('все семь языков дают три разных подписи', () => {
    for (const { code } of LOCALES) {
      setLocale(code);
      const d = L();
      const labels = new Set([d.btnNextRound, d.btnWaiting, d.btnPeerReady]);
      expect(labels.size, code).toBe(3);
    }
    setLocale('ru');
  });
});
