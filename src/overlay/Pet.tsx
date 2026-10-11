import type { CSSProperties } from 'react';
import { directionRow, petScale } from '../pets/registry';
import type { Direction, Pet as PetData } from '../pets/types';

interface PetProps {
  pet: PetData;
  animation: string;
  direction: Direction;
  box: number; // px; the sprite is drawn at a whole-number scale inside this square
  frame?: number;
  label: string;
}

// A single static frame of a sheet (N frames across, 4 direction rows). Animation comes in milestone 3.
export function Pet({ pet, animation, direction, box, frame = 0, label }: PetProps) {
  const anim = pet.animations[animation] ?? pet.animations[pet.states.focus];
  const size = pet.frameSize * petScale(pet, box);
  const n = anim.frames;

  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundImage: `url(${anim.url})`,
    backgroundSize: `${n * 100}% 400%`,
    backgroundPositionX: n > 1 ? `${(frame / (n - 1)) * 100}%` : '0%',
    backgroundPositionY: `${(directionRow[direction] / 3) * 100}%`,
  };

  return (
    <div className="pet-box" style={{ width: box, height: box }}>
      <div className="pet" role="img" aria-label={label} style={style} />
    </div>
  );
}
