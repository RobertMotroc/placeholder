import { useState } from 'react';
import { spriteStyle } from '../pets/sprite';
import type { Direction, Pet as PetData } from '../pets/types';

interface PetProps {
  pet: PetData;
  animation: string;
  direction: Direction;
  box: number; // px; the sprite is drawn at a whole-number scale inside this square
  label: string;
  animate: boolean;
  // Set for one-shot reactions: play `animation` once, then loop this animation instead.
  thenAnimation?: string;
}

// Remount (via `key`) whenever the animation should restart from frame 0.
export function Pet({ pet, animation, direction, box, label, animate, thenAnimation }: PetProps) {
  const [finished, setFinished] = useState(false);
  // Without animation a one-shot can't end, so go straight to the pose it falls back to.
  const done = finished || !animate;
  const oneShot = thenAnimation !== undefined && !done;
  const current = done && thenAnimation ? thenAnimation : animation;

  const style = spriteStyle(pet, current, direction, box, { animate, loop: !oneShot });

  return (
    <div className="pet-box" style={{ width: box, height: box }}>
      <div
        key={current}
        className="pet"
        role="img"
        aria-label={label}
        style={style}
        onAnimationEnd={oneShot ? () => setFinished(true) : undefined}
      />
    </div>
  );
}
