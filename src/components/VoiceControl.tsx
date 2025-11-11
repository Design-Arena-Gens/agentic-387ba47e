import React, { useState, useEffect, useRef } from 'react';

interface Props {
  sendCommand: (cmd: string) => void;
  connected: boolean;
}

const VoiceControl: React.FC<Props> = ({ sendCommand, connected }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        processCommand(finalTranscript.trim().toLowerCase());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processCommand = (command: string) => {
    setLastCommand(command);
    speak(`Processing: ${command}`);

    // Command mapping
    if (command.includes('forward') || command.includes('go ahead')) {
      sendCommand('MOTOR:FORWARD');
    } else if (command.includes('backward') || command.includes('go back')) {
      sendCommand('MOTOR:BACKWARD');
    } else if (command.includes('left') || command.includes('turn left')) {
      sendCommand('MOTOR:LEFT');
    } else if (command.includes('right') || command.includes('turn right')) {
      sendCommand('MOTOR:RIGHT');
    } else if (command.includes('stop')) {
      sendCommand('MOTOR:STOP');
    } else if (command.includes('gpio') && command.includes('on')) {
      const match = command.match(/gpio\s*(\d+)\s*on/);
      if (match) sendCommand(`GPIO:${match[1]}:1`);
    } else if (command.includes('gpio') && command.includes('off')) {
      const match = command.match(/gpio\s*(\d+)\s*off/);
      if (match) sendCommand(`GPIO:${match[1]}:0`);
    } else if (command.includes('servo')) {
      const match = command.match(/servo\s*(\d+)\s*angle\s*(\d+)/);
      if (match) sendCommand(`SERVO:${match[1]}:${match[2]}`);
    } else if (command.includes('scan')) {
      sendCommand('SCAN:START');
    } else {
      speak('Command not recognized');
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      speak('Voice control stopped');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      speak('Voice control started');
    }
  };

  const testTTS = () => {
    speak('Text to speech is working correctly.');
  };

  return (
    <div className="card">
      <h2>🎤 Voice Control</h2>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>
          Say commands like: "forward", "turn left", "stop", "GPIO 5 on", "servo 0 angle 90", "scan"
        </p>
      </div>

      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <strong>Live Transcript:</strong>
        <p style={{ marginTop: '0.5rem', minHeight: '3rem', color: isListening ? '#333' : '#999' }}>
          {transcript || (isListening ? 'Listening...' : 'Not listening')}
        </p>
      </div>

      {lastCommand && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
          <strong>Last Command:</strong>
          <p style={{ marginTop: '0.5rem' }}>{lastCommand}</p>
        </div>
      )}

      <div className="button-group">
        <button
          className={`btn ${isListening ? 'btn-danger' : 'btn-success'}`}
          onClick={toggleListening}
          disabled={!connected}
        >
          {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
        </button>
        <button className="btn btn-secondary" onClick={testTTS}>
          Test TTS
        </button>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', fontSize: '0.875rem' }}>
        <strong>Voice Commands:</strong>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
          <li>"forward" / "backward" - Move robot</li>
          <li>"turn left" / "turn right" - Turn robot</li>
          <li>"stop" - Stop all motors</li>
          <li>"GPIO 5 on/off" - Control GPIO pins</li>
          <li>"servo 0 angle 90" - Set servo position</li>
          <li>"scan" - Start scanning mode</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceControl;
