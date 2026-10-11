import { getPet } from '../pets/registry';
import type { TimerView } from '../timer/view';
import { Pet } from './Pet';

const petActions: Record<TimerView['petState'], string> = {
  focus: 'sitting',
  break: 'on a break',
  paused: 'waiting with its back turned',
  complete: 'celebrating',
  skipped: 'startled',
};

interface ScreenProps {
  petId: string;
  view: TimerView;
  animatePet: boolean;
}

export function Screen({ petId, view, animatePet }: ScreenProps) {
  const pet = getPet(petId);
  const pipsLabel = `Session ${Math.min(view.sessionsDone + 1, view.sessionsPerCycle)} of ${view.sessionsPerCycle}`;

  return (
    <div className="bezel">
      <div className="screen">
        <div className="status">
          <span>{view.modeLabel}</span>
          <span className="pips" role="img" aria-label={pipsLabel}>
            {Array.from({ length: view.sessionsPerCycle }, (_, i) => (
              <span key={i} className={i < view.sessionsDone ? 'pip done' : 'pip'} />
            ))}
          </span>
        </div>
        <div className="timer" role="timer" aria-live="off">
          {view.time}
        </div>
        <div className="ground" aria-hidden="true">
          <div className="progress" style={{ width: `${view.progress * 100}%` }} />
        </div>
        <div className="pet-slot">
          <Pet
            key={view.phaseKey}
            pet={pet}
            animation={pet.states[view.petState]}
            // Done and Skipped are one-shot reactions that then settle into a pose (docs/DESIGN.md §2).
            thenAnimation={view.petThen ? pet.states[view.petThen] : undefined}
            direction={view.petDirection}
            box={64}
            label={`${pet.name} ${petActions[view.petState]}`}
            animate={animatePet}
          />
        </div>
      </div>
    </div>
  );
}
