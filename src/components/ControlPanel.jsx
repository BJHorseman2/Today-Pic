import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import './ControlPanel.css';

const templates = [
  { id: 'heart', name: 'Heart', icon: '❤️', color: '#ff69b4' },
  { id: 'flower', name: 'Flower', icon: '🌸', color: '#ff1493' },
  { id: 'saturn', name: 'Saturn', icon: '🪐', color: '#ffd700' },
  { id: 'buddha', name: 'Buddha', icon: '🧘', color: '#ff8c00' },
  { id: 'fireworks', name: 'Fireworks', icon: '🎆', color: '#00ffff' }
];

export default function ControlPanel({
  selectedTemplate,
  onTemplateChange,
  color,
  onColorChange,
  particleCount,
  onParticleCountChange
}) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  return (
    <div className={`control-panel ${isPanelExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header">
        <h2>Particle Controls</h2>
        <button
          className="toggle-btn"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          aria-label={isPanelExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {isPanelExpanded ? '−' : '+'}
        </button>
      </div>

      {isPanelExpanded && (
        <div className="panel-content">
          {/* Template Selection */}
          <div className="control-section">
            <h3>Templates</h3>
            <div className="template-grid">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className={`template-btn ${selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => onTemplateChange(template.id)}
                  title={template.name}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="control-section">
            <h3>Color</h3>
            <div className="color-picker-container">
              <button
                className="color-preview"
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                style={{ background: color }}
                aria-label="Open color picker"
              >
                <span className="color-value">{color}</span>
              </button>

              {isColorPickerOpen && (
                <div className="color-picker-popover">
                  <div
                    className="color-picker-backdrop"
                    onClick={() => setIsColorPickerOpen(false)}
                  />
                  <div className="color-picker-wrapper">
                    <HexColorPicker color={color} onChange={onColorChange} />
                    <div className="preset-colors">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          className="preset-color"
                          style={{ background: template.color }}
                          onClick={() => {
                            onColorChange(template.color);
                            setIsColorPickerOpen(false);
                          }}
                          title={`${template.name} color`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Particle Count Slider */}
          <div className="control-section">
            <h3>Particle Count</h3>
            <div className="slider-container">
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={particleCount}
                onChange={(e) => onParticleCountChange(Number(e.target.value))}
                className="particle-slider"
              />
              <span className="slider-value">{particleCount}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="control-section instructions">
            <h3>How to Use</h3>
            <ul>
              <li>
                <strong>1 Hand:</strong> Open/close your hand to scale particles
              </li>
              <li>
                <strong>2 Hands:</strong> Move hands apart/together to expand/contract
              </li>
              <li>
                <strong>Tip:</strong> Allow camera access for gesture control
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
