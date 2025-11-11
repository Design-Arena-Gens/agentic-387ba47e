import React, { useState } from 'react';

interface Props {
  sendCommand: (cmd: string) => void;
  connected: boolean;
}

interface ServoState {
  angle: number;
}

const ServoControl: React.FC<Props> = ({ sendCommand, connected }) => {
  const [servos, setServos] = useState<Record<number, ServoState>>({
    0: { angle: 90 },
    1: { angle: 90 },
    2: { angle: 90 },
    3: { angle: 90 }
  });

  const updateServo = (id: number, angle: number) => {
    setServos(prev => ({ ...prev, [id]: { angle } }));
    sendCommand(`SERVO:${id}:${angle}`);
  };

  const presetPosition = (preset: 'home' | 'scan' | 'rest') => {
    switch (preset) {
      case 'home':
        [0, 1, 2, 3].forEach(id => updateServo(id, 90));
        break;
      case 'scan':
        updateServo(0, 45);
        updateServo(1, 135);
        updateServo(2, 90);
        updateServo(3, 90);
        break;
      case 'rest':
        [0, 1, 2, 3].forEach(id => updateServo(id, 0));
        break;
    }
  };

  return (
    <div className="card">
      <h2>🎛️ Servo Control</h2>

      <div className="button-group" style={{ marginBottom: '1rem' }}>
        <button className="btn" onClick={() => presetPosition('home')} disabled={!connected}>
          Home (90°)
        </button>
        <button className="btn" onClick={() => presetPosition('scan')} disabled={!connected}>
          Scan Position
        </button>
        <button className="btn btn-secondary" onClick={() => presetPosition('rest')} disabled={!connected}>
          Rest (0°)
        </button>
      </div>

      {Object.entries(servos).map(([id, state]) => (
        <div key={id} className="input-group">
          <label>
            Servo {id}: {state.angle}°
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="180"
              value={state.angle}
              onChange={e => updateServo(Number(id), Number(e.target.value))}
              disabled={!connected}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              min="0"
              max="180"
              value={state.angle}
              onChange={e => updateServo(Number(id), Number(e.target.value))}
              disabled={!connected}
              style={{ width: '80px', padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '4px' }}
            />
          </div>
        </div>
      ))}

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        <p>Control servo angles (0-180°). Servos must be connected to PWM-capable pins.</p>
      </div>
    </div>
  );
};

export default ServoControl;
