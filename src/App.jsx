import { useState } from 'react';
import HandGestureParticles from './components/HandGestureParticles';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState('heart');
  const [particleColor, setParticleColor] = useState('#ff69b4');
  const [particleCount, setParticleCount] = useState(2000);

  return (
    <div className="app">
      <HandGestureParticles
        template={selectedTemplate}
        particleColor={particleColor}
        particleCount={particleCount}
      />

      <ControlPanel
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        color={particleColor}
        onColorChange={setParticleColor}
        particleCount={particleCount}
        onParticleCountChange={setParticleCount}
      />

      <div className="app-header">
        <h1 className="app-title">
          <span className="title-gradient">3D Particle System</span>
        </h1>
        <p className="app-subtitle">Hand Gesture Controlled</p>
      </div>

      <div className="camera-permission-notice">
        <p>📷 Please allow camera access for hand gesture control</p>
      </div>
    </div>
  );
}

export default App;
