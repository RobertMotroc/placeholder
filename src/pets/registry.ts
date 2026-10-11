import type { Direction, Pet, PetAnimation, PetManifest } from './types';

// Every folder in assets/sprites/ with a manifest.json is a pet; adding one needs no code changes.
const manifests = import.meta.glob<PetManifest>('/assets/sprites/*/manifest.json', {
  eager: true,
  import: 'default',
});
const sheetUrls = import.meta.glob<string>('/assets/sprites/*/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

function loadPet(manifestPath: string, manifest: PetManifest): Pet {
  const folder = manifestPath.slice(0, manifestPath.lastIndexOf('/') + 1);
  const animations: Record<string, PetAnimation> = {};
  for (const [key, spec] of Object.entries(manifest.animations)) {
    const url = sheetUrls[folder + spec.file];
    if (!url) throw new Error(`Pet "${manifest.id}": missing sheet ${folder}${spec.file}`);
    animations[key] = { ...spec, url };
  }
  return { ...manifest, animations };
}

export const pets: Pet[] = Object.entries(manifests)
  .map(([path, manifest]) => loadPet(path, manifest))
  .sort((a, b) => a.name.localeCompare(b.name));

export const defaultPetId = 'hare';

export function getPet(id: string): Pet {
  return pets.find((p) => p.id === id) ?? pets.find((p) => p.id === defaultPetId)!;
}

export const directionRow: Record<Direction, number> = { front: 0, back: 1, left: 2, right: 3 };

// Largest whole-number scale that fits the box; never a fraction (CLAUDE.md rules).
export function petScale(pet: Pet, box: number): number {
  return Math.max(1, Math.floor(box / pet.frameSize));
}
