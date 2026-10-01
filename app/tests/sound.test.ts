// Звук Dofodo: модуль с записями и синтезом живёт в общем пакете
// (telesik-web-commons, там же его тесты — разметка записей, WAV-фолбэк,
// застрявший контекст). Здесь — стык: какой ход каким стуком звучит, и
// исходный сценарий бага 0010 (AudioContext закрыт системой).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Лог значений gain.setValueAtTime всех узлов — ловит глушение мастера. */
const gainLog: number[] = [];

class FakeNode {
  context: unknown;
  gain = {
    setValueAtTime: (v: number) => {
      gainLog.push(v);
    },
    cancelScheduledValues: () => {},
    linearRampToValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
  };
  frequency = {
    value: 0,
    setValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
  };
  Q = { value: 0 };
  type = '';
  buffer: unknown = null;
  playbackRate = { value: 1 };
  constructor(ctx: unknown) {
    this.context = ctx;
  }
  connect(dest: unknown): unknown {
    return dest;
  }
  start(): void {}
  stop(): void {}
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state: 'running' | 'suspended' | 'interrupted' | 'closed' = 'running';
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  /** Сколько осцилляторов создано — отличает «синтез играет» от «тишины». */
  oscillators = 0;
  constructor() {
    FakeAudioContext.instances.push(this);
  }
  createGain(): FakeNode {
    return new FakeNode(this);
  }
  createBufferSource(): FakeNode {
    return new FakeNode(this);
  }
  createBiquadFilter(): FakeNode {
    return new FakeNode(this);
  }
  createOscillator(): FakeNode {
    this.oscillators++;
    return new FakeNode(this);
  }
  createBuffer(
    _channels: number,
    len: number,
    sampleRate: number,
  ): { sampleRate: number; getChannelData: () => Float32Array } {
    const data = new Float32Array(len);
    return { sampleRate, getChannelData: () => data };
  }
  resume(): Promise<void> {
    if (this.state !== 'closed') this.state = 'running';
    return Promise.resolve();
  }
  close(): Promise<void> {
    this.state = 'closed';
    return Promise.resolve();
  }
}

describe('sound.ts — переживает закрытие AudioContext (баг 0010)', () => {
  beforeEach(() => {
    vi.resetModules();
    FakeAudioContext.instances.length = 0;
    gainLog.length = 0;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('fetch', () => Promise.reject(new Error('нет сети в тесте')));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('после close() следующий звук пересоздаёт контекст, а не молчит', async () => {
    const { setSoundEnabled, playDraw } = await import('../src/ui/sound');

    setSoundEnabled(true);
    expect(FakeAudioContext.instances).toHaveLength(1);
    const first = FakeAudioContext.instances[0]!;

    expect(() => playDraw()).not.toThrow();
    expect(FakeAudioContext.instances).toHaveLength(1); // тот же контекст переиспользован

    await first.close();
    expect(first.state).toBe('closed');

    // До фикса: ensureCtx() видел ctx!==null и звал только resume(), который
    // из 'closed' не выводит — контекст оставался мёртвым, звук пропадал молча.
    expect(() => playDraw()).not.toThrow();
    expect(FakeAudioContext.instances).toHaveLength(2);
    expect(FakeAudioContext.instances[1]!.state).not.toBe('closed');
  });

  it('до загрузки записей играет синтез: каждый стук создаёт осцилляторы', async () => {
    const { setSoundEnabled, playPlace, playShuffle, isSoundEnabled } = await import(
      '../src/ui/sound'
    );
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
    const ctx = FakeAudioContext.instances[0]!;

    playPlace('root'); // торжественный двойной стук — два knock
    expect(ctx.oscillators).toBe(2);
    playPlace('cross');
    expect(ctx.oscillators).toBe(3);
    playPlace('straight');
    expect(ctx.oscillators).toBe(4);
    playPlace('turn');
    expect(ctx.oscillators).toBe(5);
    playShuffle(); // записи нет — тишина (retry загрузки), синтеза у шаффла нет
    expect(ctx.oscillators).toBe(5);

    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    playPlace('root'); // выключено — ранний выход, синтез не запускается
    expect(ctx.oscillators).toBe(5);
  });
});
