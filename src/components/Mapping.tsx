import React, { useState, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Orientation {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

const Mapping: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [path, setPath] = useState<Point[]>([]);
  const [keypoints, setKeypoints] = useState<Point[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>({ alpha: null, beta: null, gamma: null });
  const [motion, setMotion] = useState({ x: 0, y: 0, z: 0 });
  const positionRef = useRef<Point>({ x: 250, y: 250 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      });
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (acc) {
        setMotion({
          x: acc.x || 0,
          y: acc.y || 0,
          z: acc.z || 0
        });

        // Simulate position update based on motion
        if (isTracking) {
          const threshold = 2;
          if (Math.abs(acc.x || 0) > threshold || Math.abs(acc.y || 0) > threshold) {
            const newX = positionRef.current.x + (acc.x || 0) * 0.5;
            const newY = positionRef.current.y + (acc.y || 0) * 0.5;
            positionRef.current = { x: newX, y: newY };
            setPath(prev => [...prev, { x: newX, y: newY }]);
          }
        }
      }
    };

    if (isTracking) {
      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isTracking]);

  useEffect(() => {
    drawMap();
  }, [path, keypoints]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw path
    if (path.length > 1) {
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }

    // Draw keypoints
    keypoints.forEach(point => {
      ctx.fillStyle = '#f56565';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw current position
    if (path.length > 0) {
      const current = path[path.length - 1];
      ctx.fillStyle = '#48bb78';
      ctx.beginPath();
      ctx.arc(current.x, current.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const toggleTracking = () => {
    if (!isTracking) {
      // Request permission on iOS
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any)
          .requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              setIsTracking(true);
            }
          })
          .catch(console.error);
      } else {
        setIsTracking(true);
      }
    } else {
      setIsTracking(false);
    }
  };

  const addKeypoint = () => {
    if (path.length > 0) {
      const current = path[path.length - 1];
      setKeypoints(prev => [...prev, current]);
    }
  };

  const clearMap = () => {
    setPath([]);
    setKeypoints([]);
    positionRef.current = { x: 250, y: 250 };
  };

  const simulateMovement = (direction: string) => {
    const step = 20;
    const current = positionRef.current;

    let newPoint: Point = current;
    switch (direction) {
      case 'up':
        newPoint = { x: current.x, y: current.y - step };
        break;
      case 'down':
        newPoint = { x: current.x, y: current.y + step };
        break;
      case 'left':
        newPoint = { x: current.x - step, y: current.y };
        break;
      case 'right':
        newPoint = { x: current.x + step, y: current.y };
        break;
    }

    positionRef.current = newPoint;
    setPath(prev => [...prev, newPoint]);
  };

  return (
    <div className="card">
      <h2>🗺️ Mapping & Navigation</h2>

      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{
          width: '100%',
          maxWidth: '500px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}
      />

      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Sensor Data</h3>
        <div style={{ fontSize: '0.875rem' }}>
          <p>
            <strong>Orientation:</strong> α={orientation.alpha?.toFixed(1) ?? 'N/A'}°,
            β={orientation.beta?.toFixed(1) ?? 'N/A'}°, γ={orientation.gamma?.toFixed(1) ?? 'N/A'}°
          </p>
          <p>
            <strong>Motion:</strong> X={motion.x.toFixed(2)}, Y={motion.y.toFixed(2)}, Z={motion.z.toFixed(2)}
          </p>
          <p>
            <strong>Path Points:</strong> {path.length} | <strong>Keypoints:</strong> {keypoints.length}
          </p>
        </div>
      </div>

      <div className="button-group" style={{ marginBottom: '1rem' }}>
        <button
          className={`btn ${isTracking ? 'btn-danger' : 'btn-success'}`}
          onClick={toggleTracking}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
        <button className="btn" onClick={addKeypoint} disabled={path.length === 0}>
          Add Keypoint
        </button>
        <button className="btn btn-secondary" onClick={clearMap}>
          Clear Map
        </button>
      </div>

      <div>
        <h3>Manual Control (for testing)</h3>
        <div className="button-group">
          <button className="btn" onClick={() => simulateMovement('up')}>
            ↑
          </button>
          <button className="btn" onClick={() => simulateMovement('down')}>
            ↓
          </button>
          <button className="btn" onClick={() => simulateMovement('left')}>
            ←
          </button>
          <button className="btn" onClick={() => simulateMovement('right')}>
            →
          </button>
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
        <p>
          Uses DeviceMotion/Orientation for IMU data. On mobile, move your device to track position.
          Green dot = current position, red dots = keypoints, blue line = path.
        </p>
      </div>
    </div>
  );
};

export default Mapping;
