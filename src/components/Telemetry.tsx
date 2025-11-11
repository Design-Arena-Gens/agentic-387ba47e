import React, { useEffect, useState } from 'react';

interface Props {
  data: Record<string, string>;
}

const Telemetry: React.FC<Props> = ({ data }) => {
  const [history, setHistory] = useState<Array<{ timestamp: string; key: string; value: string }>>([]);

  useEffect(() => {
    Object.entries(data).forEach(([key, value]) => {
      setHistory(prev => [
        ...prev.slice(-99), // Keep last 100 entries
        { timestamp: new Date().toLocaleTimeString(), key, value }
      ]);
    });
  }, [data]);

  const clearHistory = () => {
    setHistory([]);
  };

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Key', 'Value'],
      ...history.map(entry => [entry.timestamp, entry.key, entry.value])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h2>📊 Telemetry</h2>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Current Values</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {Object.entries(data).length > 0 ? (
            Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: '1rem',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea'
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                  {key}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#333' }}>{value}</div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', gridColumn: '1 / -1' }}>
              No telemetry data received. Connect to Pico and send data in KEY:VALUE format.
            </p>
          )}
        </div>
      </div>

      <div className="button-group" style={{ marginBottom: '1rem' }}>
        <button className="btn" onClick={exportData} disabled={history.length === 0}>
          Export CSV
        </button>
        <button className="btn btn-secondary" onClick={clearHistory} disabled={history.length === 0}>
          Clear History
        </button>
      </div>

      <div>
        <h3>History ({history.length} entries)</h3>
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '1rem'
          }}
        >
          {history.length > 0 ? (
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Key</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {history
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : 'transparent' }}
                    >
                      <td style={{ padding: '0.5rem' }}>{entry.timestamp}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{entry.key}</td>
                      <td style={{ padding: '0.5rem' }}>{entry.value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#999', textAlign: 'center' }}>No history data</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        <p>
          Telemetry data is parsed from serial messages in format: <code>KEY:VALUE</code>
          <br />
          Example: <code>TEMP:25.3</code>, <code>DISTANCE:142</code>, <code>BATTERY:3.7</code>
        </p>
      </div>
    </div>
  );
};

export default Telemetry;
