import React, { useState } from 'react';

interface Props {
  sendCommand: (cmd: string) => void;
  connected: boolean;
}

const GPIOControl: React.FC<Props> = ({ sendCommand, connected }) => {
  const [gpioStates, setGpioStates] = useState<Record<number, boolean>>({});
  const pins = [0, 1, 2, 3, 4, 5, 15, 16, 17, 18, 19, 20, 21, 22];

  const toggleGPIO = (pin: number) => {
    const newState = !gpioStates[pin];
    setGpioStates(prev => ({ ...prev, [pin]: newState }));
    sendCommand(`GPIO:${pin}:${newState ? 1 : 0}`);
  };

  const setAllHigh = () => {
    pins.forEach(pin => {
      setGpioStates(prev => ({ ...prev, [pin]: true }));
      sendCommand(`GPIO:${pin}:1`);
    });
  };

  const setAllLow = () => {
    pins.forEach(pin => {
      setGpioStates(prev => ({ ...prev, [pin]: false }));
      sendCommand(`GPIO:${pin}:0`);
    });
  };

  return (
    <div className="card">
      <h2>⚡ GPIO Control</h2>

      <div className="button-group" style={{ marginBottom: '1rem' }}>
        <button className="btn btn-success" onClick={setAllHigh} disabled={!connected}>
          All High
        </button>
        <button className="btn btn-danger" onClick={setAllLow} disabled={!connected}>
          All Low
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '0.75rem'
        }}
      >
        {pins.map(pin => (
          <button
            key={pin}
            className={`btn ${gpioStates[pin] ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => toggleGPIO(pin)}
            disabled={!connected}
            style={{ padding: '1rem 0.5rem' }}
          >
            GPIO {pin}
            <br />
            <span style={{ fontSize: '0.875rem' }}>{gpioStates[pin] ? 'HIGH' : 'LOW'}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        <p>Click pins to toggle HIGH/LOW states.</p>
      </div>
    </div>
  );
};

export default GPIOControl;
