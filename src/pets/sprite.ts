import { directionRow, petScale } from './registry';
import type { Direction, Pet } from './types';

export interface SpriteOptions {
  animate: boolean; // false: hold frame 0 (reduced motion, or "Animate the pet" off)
  loop: boolean; // false: play once and hold the last frame
}

// Inline styles for one animation of a sheet (N frames across, 4 direction rows), per docs/DESIGN.md §3.
// The `pet-frames` keyframes in overlay.css move background-position-x from 0% to 100%;
// steps(N, jump-none) shows each frame k at k / (N - 1) * 100% for an equal share of the duration.
export function spriteStyle(pet: Pet, animationKey: string, direction: Direction, box: number, opts: SpriteOptions) {
  const anim = pet.animations[animationKey] ?? pet.animations[pet.states.focus];
  const n = anim.frames;
  const size = pet.frameSize * petScale(pet, box);

  const style: Record<string, string | number> = {
    width: size,
    height: size,
    backgroundImage: `url(${anim.url})`,
    backgroundSize: `${n * 100}% 400%`,
    backgroundPositionX: '0%',
    backgroundPositionY: `${(directionRow[direction] / 3) * 100}%`,
  };

  if (opts.animate && n > 1) {
    style.animationName = 'pet-frames';
    style.animationDuration = `${(n / anim.fps).toFixed(3)}s`;
    style.animationTimingFunction = `steps(${n}, jump-none)`;
    style.animationIterationCount = opts.loop ? 'infinite' : '1';
    if (!opts.loop) style.animationFillMode = 'forwards';
  }

  return style;
}
