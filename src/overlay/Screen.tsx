import { getPet } from '../pets/registry';
import { Pet } from './Pet';

interface ScreenProps {
  petId: string;
  modeLabel: string;
  time: string;
  sessionsDone: number;
  sessionsPerCycle: number;
  progress: number; // 0..1, time remaining
}

export function Screen({ petId, modeLabel, time, sessionsDone, sessionsPerCycle, progress }: ScreenProps) {
  const pet = getPet(petId);
  return (
    <div className="bezel">
      <div className="screen">
        <div className="status">
          <span>{modeLabel}</span>
          <span className="pips" role="img" aria-label={`Session ${sessionsDone + 1} of ${sessionsPerCycle}`}>
            {Array.from({ length: sessionsPerCycle }, (_, i) => (
              <span key={i} className={i < sessionsDone ? 'pip done' : 'pip'} />
            ))}
          </span>
        </div>
        <div className="timer">{time}</div>
        <div className="ground" aria-hidden="true">
          <div className="progress" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="pet-slot">
          <Pet pet={pet} animation={pet.states.focus} direction="left" box={64} label={`${pet.name} on the timer screen`} />
        </div>
      </div>
    </div>
  );
}
