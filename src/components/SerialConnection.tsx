import React, { useEffect, useRef } from 'react';
import { SerialPortState } from '../App';

interface Props {
  serialState: SerialPortState;
  setSerialState: React.Dispatch<React.SetStateAction<SerialPortState>>;
  setTelemetryData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const SerialConnection: React.FC<Props> = ({ serialState, setSerialState, setTelemetryData }) => {
  const readLoopRef = useRef<boolean>(false);

  const connectSerial = async () => {
    try {
      if (!('serial' in navigator)) {
        alert('Web Serial API not supported. Use Chrome/Edge on desktop or Android.');
        return;
      }

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });

      const reader = port.readable.getReader();
      const writer = port.writable.getWriter();

      setSerialState({ port, reader, writer, connected: true });
      readLoopRef.current = true;

      // Start reading loop
      readLoop(reader);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect: ' + error);
    }
  };

  const readLoop = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (readLoopRef.current) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        lines.forEach(line => {
          line = line.trim();
          if (line) {
            console.log('Received:', line);
            parseTelemetry(line);
          }
        });
      }
    } catch (error) {
      console.error('Read error:', error);
    }
  };

  const parseTelemetry = (line: string) => {
    // Parse telemetry data (format: "KEY:VALUE")
    if (line.includes(':')) {
      const [key, value] = line.split(':', 2);
      setTelemetryData(prev => ({ ...prev, [key.trim()]: value.trim() }));
    }
  };

  const disconnectSerial = async () => {
    readLoopRef.current = false;

    try {
      if (serialState.reader) {
        await serialState.reader.cancel();
        serialState.reader.releaseLock();
      }
      if (serialState.writer) {
        await serialState.writer.close();
      }
      if (serialState.port) {
        await serialState.port.close();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }

    setSerialState({ port: null, reader: null, writer: null, connected: false });
  };

  useEffect(() => {
    return () => {
      readLoopRef.current = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span
        className={`status-indicator ${
          serialState.connected ? 'status-connected' : 'status-disconnected'
        }`}
      />
      <span style={{ fontWeight: 600, color: serialState.connected ? '#48bb78' : '#999' }}>
        {serialState.connected ? 'Connected' : 'Disconnected'}
      </span>
      {!serialState.connected ? (
        <button className="btn btn-success" onClick={connectSerial}>
          Connect
        </button>
      ) : (
        <button className="btn btn-danger" onClick={disconnectSerial}>
          Disconnect
        </button>
      )}
    </div>
  );
};

export default SerialConnection;
