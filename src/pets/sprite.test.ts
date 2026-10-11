import { describe, expect, it } from 'vitest';
import { getPet, pets } from './registry';
import { spriteStyle } from './sprite';

const loop = { animate: true, loop: true };

describe('pet registry', () => {
  it('finds all 13 pets with a sheet for every mapped state', () => {
    expect(pets).toHaveLength(13);
    for (const pet of pets) {
      for (const anim of Object.values(pet.states)) {
        expect(pet.animations[anim], `${pet.id} maps a state to "${anim}"`).toBeDefined();
      }
    }
  });
});

describe('spriteStyle', () => {
  const hare = getPet('hare');

  it('sizes the sheet to N frames x 4 rows and picks the direction row', () => {
    const s = spriteStyle(hare, 'idle', 'left', 64, loop);
    expect(s).toMatchObject({ width: 64, height: 64, backgroundSize: '400% 400%', backgroundPositionY: `${(2 / 3) * 100}%` });
    expect(spriteStyle(hare, 'idle', 'back', 64, loop).backgroundPositionY).toBe(`${(1 / 3) * 100}%`);
  });

  it('loops with one step per frame at the manifest fps', () => {
    const s = spriteStyle(hare, 'run', 'left', 64, loop);
    expect(s).toMatchObject({
      animationName: 'pet-frames',
      animationTimingFunction: 'steps(6, jump-none)',
      animationDuration: `${(6 / 6.67).toFixed(3)}s`,
      animationIterationCount: 'infinite',
    });
  });

  it('a one-shot plays once and holds its last frame', () => {
    const s = spriteStyle(hare, 'hurt', 'left', 64, { animate: true, loop: false });
    expect(s).toMatchObject({ animationIterationCount: '1', animationFillMode: 'forwards' });
  });

  it('holds frame 0 when animation is off', () => {
    const s = spriteStyle(hare, 'run', 'left', 64, { animate: false, loop: true });
    expect(s.backgroundPositionX).toBe('0%');
    expect(s.animationName).toBeUndefined();
  });

  it('scales by whole multiples only', () => {
    expect(spriteStyle(getPet('chick'), 'idle', 'left', 64, loop).width).toBe(64); // 16px x4
    expect(spriteStyle(getPet('bull'), 'idle', 'left', 96, loop).width).toBe(64); // 64px x1, not 1.5
    expect(spriteStyle(hare, 'idle', 'left', 96, loop).width).toBe(96); // 32px x3
  });

  it('falls back to the idle animation for an unknown name', () => {
    expect(spriteStyle(getPet('sheep'), 'hurt', 'left', 64, loop).backgroundImage).toBe(
      spriteStyle(getPet('sheep'), 'idle', 'left', 64, loop).backgroundImage,
    );
  });
});
