import type { PetStateKey } from '../timer/types';

export type Direction = 'front' | 'back' | 'left' | 'right';

export interface AnimationSpec {
  file: string;
  frames: number;
  fps: number;
}

// Shape of assets/sprites/<id>/manifest.json (see docs/DESIGN.md §3).
export interface PetManifest {
  id: string;
  name: string;
  frameSize: number;
  directions: Direction[];
  animations: Record<string, AnimationSpec>;
  states: Record<PetStateKey, string>;
}

export interface PetAnimation extends AnimationSpec {
  url: string;
}

export interface Pet extends Omit<PetManifest, 'animations'> {
  animations: Record<string, PetAnimation>;
}
