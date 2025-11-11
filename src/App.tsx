import React, { useState } from 'react';
import SerialConnection from './components/SerialConnection';
import CameraControl from './components/CameraControl';
import VoiceControl from './components/VoiceControl';
import GPIOControl from './components/GPIOControl';
import ServoControl from './components/ServoControl';
import Mapping from './components/Mapping';
import Telemetry from './components/Telemetry';
import MacroControl from './components/MacroControl';
import DataStorage from './components/DataStorage';
import './App.css';

export interface SerialPortState {
  port: SerialPort | null;
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  writer: WritableStreamDefaultWriter<Uint8Array> | null;
  connected: boolean;
}

function App() {
  const [serialState, setSerialState] = useState<SerialPortState>({
    port: null,
    reader: null,
    writer: null,
    connected: false
  });
  const [telemetryData, setTelemetryData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('control');

  const sendCommand = async (command: string) => {
    if (serialState.writer && serialState.connected) {
      try {
        const encoder = new TextEncoder();
        await serialState.writer.write(encoder.encode(command + '\n'));
        console.log('Sent:', command);
      } catch (error) {
        console.error('Send error:', error);
      }
    }
  };

  const tabs = [
    { id: 'control', label: 'Control' },
    { id: 'camera', label: 'Camera' },
    { id: 'voice', label: 'Voice' },
    { id: 'mapping', label: 'Mapping' },
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'macros', label: 'Macros' },
    { id: 'data', label: 'Data' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 Pico Control PWA</h1>
        <SerialConnection
          serialState={serialState}
          setSerialState={setSerialState}
          setTelemetryData={setTelemetryData}
        />
      </header>

      <nav className="app-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-content">
        {activeTab === 'control' && (
          <div className="control-grid">
            <GPIOControl sendCommand={sendCommand} connected={serialState.connected} />
            <ServoControl sendCommand={sendCommand} connected={serialState.connected} />
          </div>
        )}

        {activeTab === 'camera' && (
          <CameraControl />
        )}

        {activeTab === 'voice' && (
          <VoiceControl sendCommand={sendCommand} connected={serialState.connected} />
        )}

        {activeTab === 'mapping' && (
          <Mapping />
        )}

        {activeTab === 'telemetry' && (
          <Telemetry data={telemetryData} />
        )}

        {activeTab === 'macros' && (
          <MacroControl sendCommand={sendCommand} connected={serialState.connected} />
        )}

        {activeTab === 'data' && (
          <DataStorage />
        )}
      </main>
    </div>
  );
}

export default App;
