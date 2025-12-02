# 3D Particle System with Hand Gesture Control

An interactive real-time 3D particle system powered by Three.js and MediaPipe hand tracking. Control particle animations with your hands through your webcam!

## Features

- **Real-time Hand Tracking**: Uses MediaPipe to detect and track your hands through the camera
- **Gesture Controls**:
  - **1 Hand**: Open/close your hand to scale particles
  - **2 Hands**: Move your hands apart or together to expand/contract the particle system
- **Multiple Templates**: Choose from 5 beautiful particle patterns:
  - ❤️ Heart
  - 🌸 Flower
  - 🪐 Saturn
  - 🧘 Buddha
  - 🎆 Fireworks
- **Color Customization**: Pick any color for your particles with the built-in color picker
- **Adjustable Particle Count**: Control the density of particles (500-5000)
- **Modern UI**: Clean, responsive interface with smooth animations

## Requirements

- Node.js (v16 or higher)
- A modern web browser with WebGL support
- Webcam access for hand gesture control

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Today-Pic
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

5. **Important**: Allow camera access when prompted by your browser

## Usage

### Hand Gesture Controls

1. **Single Hand Mode**:
   - Make a fist: Particles shrink
   - Open your hand: Particles expand
   - The more you open your hand, the larger the particles become

2. **Two Hands Mode**:
   - Bring hands close together: Particles contract
   - Move hands apart: Particles expand
   - Hand openness also affects the scale

### UI Controls

- **Template Selector**: Click on any template button to change the particle pattern
- **Color Picker**: Click the color preview to open the picker and select a custom color, or choose from preset colors
- **Particle Count**: Use the slider to adjust the number of particles (affects performance)
- **Collapse Panel**: Click the `−` button to minimize the control panel

## Technical Stack

- **React**: UI framework
- **Three.js**: 3D rendering and particle system
- **MediaPipe Hands**: Hand tracking and gesture recognition
- **Vite**: Build tool and development server
- **react-colorful**: Color picker component

## Project Structure

```
Today-Pic/
├── src/
│   ├── components/
│   │   ├── HandGestureParticles.jsx  # Main particle system with hand tracking
│   │   ├── ControlPanel.jsx          # UI controls
│   │   ├── ControlPanel.css          # Control panel styles
│   │   └── LetterGlobe.jsx          # Legacy 3D globe component
│   ├── App.jsx                       # Main application component
│   ├── App.css                       # Application styles
│   └── main.jsx                      # Entry point
├── index.html                        # HTML template
├── package.json                      # Dependencies
├── vite.config.js                   # Vite configuration
└── README.md                        # This file
```

## How It Works

### Particle System

The particle system uses Three.js to render thousands of particles in 3D space. Each template has a unique algorithm to position particles:

- **Heart**: Mathematical heart curve formula
- **Flower**: Polar coordinate petals
- **Saturn**: Sphere with ring system
- **Buddha**: Sitting Buddha silhouette approximation
- **Fireworks**: Multiple explosion centers with radial particles

### Hand Tracking

MediaPipe Hands provides 21 3D landmarks for each detected hand. The system:

1. Calculates hand "openness" by measuring distances between finger tips and palm
2. Detects the number of hands (1 or 2)
3. For two hands, calculates the distance between them
4. Maps these values to particle scale in real-time

### Performance

- Optimized rendering with Three.js BufferGeometry
- Smooth scale transitions using lerp interpolation
- Efficient hand tracking at 30 FPS
- Adjustable particle count for different hardware capabilities

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (macOS 12+, iOS 15+)
- Opera: ✅ Full support

## Troubleshooting

**Camera not working:**
- Ensure you've allowed camera access in your browser
- Check if another application is using the camera
- Try refreshing the page
- For Firefox: Go to about:config and ensure `media.navigator.permission.disabled` is false

**Poor performance:**
- Reduce particle count using the slider
- Close other browser tabs
- Ensure hardware acceleration is enabled in browser settings

**Hand tracking not responsive:**
- Ensure good lighting conditions
- Position your hands clearly in front of the camera
- Try adjusting the distance from the camera
- Make sure your hands are visible and not obscured

## Development

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

- Three.js for 3D rendering
- MediaPipe for hand tracking technology
- React and Vite for the development framework

---

Made with ❤️ using hand gestures
