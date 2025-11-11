import React, { useRef, useState, useEffect } from 'react';

const CameraControl: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      setStream(newStream);
      setIsActive(true);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Failed to access camera: ' + error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  useEffect(() => {
    if (facingMode && !stream) {
      // Auto-restart after switch
      const timer = setTimeout(() => {
        if (!stream) startCamera();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [facingMode]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="card">
      <h2>📷 Camera Control</h2>

      <div style={{ marginBottom: '1rem' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            maxHeight: '400px',
            borderRadius: '8px',
            background: '#000',
            display: isActive ? 'block' : 'none'
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {capturedImage && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Captured Image</h3>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setCapturedImage(null)}
              style={{ marginTop: '0.5rem' }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="button-group">
        {!isActive ? (
          <button className="btn btn-success" onClick={startCamera}>
            Start Camera
          </button>
        ) : (
          <>
            <button className="btn btn-danger" onClick={stopCamera}>
              Stop Camera
            </button>
            <button className="btn" onClick={switchCamera}>
              Switch ({facingMode === 'user' ? 'Front' : 'Back'})
            </button>
            <button className="btn" onClick={capturePhoto}>
              Capture Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraControl;
