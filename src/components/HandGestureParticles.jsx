import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

// Particle template generators
const ParticleTemplates = {
  heart: (count) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const z = (Math.random() - 0.5) * 5;
      positions.push(new THREE.Vector3(x * 0.3, y * 0.3, z));
    }
    return positions;
  },

  flower: (count) => {
    const positions = [];
    const petals = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 5 * (1 + 0.5 * Math.sin(petals * angle));
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      const z = (Math.random() - 0.5) * 3;
      positions.push(new THREE.Vector3(x, y, z));
    }
    return positions;
  },

  saturn: (count) => {
    const positions = [];
    const ringCount = Math.floor(count * 0.4);
    const sphereCount = count - ringCount;

    // Sphere
    for (let i = 0; i < sphereCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 1;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push(new THREE.Vector3(x, y, z));
    }

    // Rings
    for (let i = 0; i < ringCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 3;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = (Math.random() - 0.5) * 0.5;
      positions.push(new THREE.Vector3(x, y, z));
    }
    return positions;
  },

  buddha: (count) => {
    const positions = [];
    // Sitting Buddha silhouette approximation
    for (let i = 0; i < count; i++) {
      const y = (i / count) * 12 - 6;
      let radius;

      if (y < -4) { // Base/legs
        radius = 4 + Math.sin((y + 4) * 0.5) * 2;
      } else if (y < 2) { // Body
        radius = 3.5 - Math.abs(y) * 0.2;
      } else { // Head
        radius = 2.5 - (y - 2) * 0.3;
      }

      const angle = Math.random() * Math.PI * 2;
      const r = radius * Math.random();
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      positions.push(new THREE.Vector3(x, y, z));
    }
    return positions;
  },

  fireworks: (count) => {
    const positions = [];
    const explosions = 5;
    const particlesPerExplosion = Math.floor(count / explosions);

    for (let e = 0; e < explosions; e++) {
      const centerX = (Math.random() - 0.5) * 15;
      const centerY = (Math.random() - 0.5) * 15;
      const centerZ = (Math.random() - 0.5) * 15;

      for (let i = 0; i < particlesPerExplosion; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.random() * 3;
        const x = centerX + r * Math.sin(phi) * Math.cos(theta);
        const y = centerY + r * Math.sin(phi) * Math.sin(theta);
        const z = centerZ + r * Math.cos(phi);
        positions.push(new THREE.Vector3(x, y, z));
      }
    }
    return positions;
  }
};

export default function HandGestureParticles({
  template = 'heart',
  particleColor = '#ff69b4',
  particleCount = 2000
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const handsRef = useRef(null);
  const cameraUtilsRef = useRef(null);
  const animationIdRef = useRef(null);

  const [handData, setHandData] = useState({ scale: 1, distance: 0, handsDetected: 0 });

  // Calculate hand openness (0 = closed fist, 1 = open hand)
  const calculateHandOpenness = (landmarks) => {
    if (!landmarks || landmarks.length < 21) return 0;

    const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
    const fingerBases = [5, 9, 13, 17]; // Corresponding bases
    const palm = landmarks[0]; // Wrist

    let totalDistance = 0;
    let baseDistance = 0;

    fingerTips.forEach((tip, i) => {
      const tipPoint = landmarks[tip];
      const basePoint = landmarks[fingerBases[i]];
      const palmPoint = palm;

      const tipDist = Math.sqrt(
        Math.pow(tipPoint.x - palmPoint.x, 2) +
        Math.pow(tipPoint.y - palmPoint.y, 2) +
        Math.pow(tipPoint.z - palmPoint.z, 2)
      );

      const baseDist = Math.sqrt(
        Math.pow(basePoint.x - palmPoint.x, 2) +
        Math.pow(basePoint.y - palmPoint.y, 2) +
        Math.pow(basePoint.z - palmPoint.z, 2)
      );

      totalDistance += tipDist;
      baseDistance += baseDist;
    });

    return Math.min(1, totalDistance / (baseDistance * 1.5));
  };

  // Calculate distance between two hands
  const calculateHandDistance = (hand1, hand2) => {
    if (!hand1 || !hand2) return 0;

    const palm1 = hand1[9]; // Middle finger base
    const palm2 = hand2[9];

    return Math.sqrt(
      Math.pow(palm1.x - palm2.x, 2) +
      Math.pow(palm1.y - palm2.y, 2) +
      Math.pow(palm1.z - palm2.z, 2)
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particle system
    const geometry = new THREE.BufferGeometry();
    const positions = ParticleTemplates[template](particleCount);
    const positionArray = new Float32Array(positions.length * 3);

    positions.forEach((pos, i) => {
      positionArray[i * 3] = pos.x;
      positionArray[i * 3 + 1] = pos.y;
      positionArray[i * 3 + 2] = pos.z;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

    const material = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Animation loop
    let baseScale = 1;
    let targetScale = 1;

    const animate = () => {
      // Smooth scale transition
      baseScale += (targetScale - baseScale) * 0.1;

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.002;
        particlesRef.current.rotation.x += 0.001;
        particlesRef.current.scale.setScalar(baseScale);
      }

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Setup MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const handsCount = results.multiHandLandmarks.length;

        if (handsCount === 1) {
          // Single hand - control rotation based on openness
          const openness = calculateHandOpenness(results.multiHandLandmarks[0]);
          targetScale = 0.5 + openness * 1.5; // Scale from 0.5 to 2
          setHandData({ scale: targetScale, distance: 0, handsDetected: 1 });
        } else if (handsCount === 2) {
          // Two hands - control scale based on distance
          const hand1 = results.multiHandLandmarks[0];
          const hand2 = results.multiHandLandmarks[1];
          const distance = calculateHandDistance(hand1, hand2);

          const openness1 = calculateHandOpenness(hand1);
          const openness2 = calculateHandOpenness(hand2);
          const avgOpenness = (openness1 + openness2) / 2;

          // Scale based on both distance and hand openness
          targetScale = (0.5 + distance * 3) * (0.5 + avgOpenness * 0.5);
          targetScale = Math.min(Math.max(targetScale, 0.3), 4);

          setHandData({ scale: targetScale, distance, handsDetected: 2 });
        }
      } else {
        // No hands detected - return to base scale
        targetScale = 1;
        setHandData({ scale: 1, distance: 0, handsDetected: 0 });
      }
    });

    handsRef.current = hands;

    // Setup camera
    const video = videoRef.current;
    if (video) {
      const camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 640,
        height: 480
      });
      camera.start();
      cameraUtilsRef.current = camera;
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (cameraUtilsRef.current) {
        cameraUtilsRef.current.stop();
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  // Update particle template when it changes
  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = ParticleTemplates[template](particleCount);
    const positionArray = new Float32Array(positions.length * 3);

    positions.forEach((pos, i) => {
      positionArray[i * 3] = pos.x;
      positionArray[i * 3 + 1] = pos.y;
      positionArray[i * 3 + 2] = pos.z;
    });

    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionArray, 3)
    );
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  }, [template, particleCount]);

  // Update particle color when it changes
  useEffect(() => {
    if (!particlesRef.current) return;
    particlesRef.current.material.color.set(particleColor);
  }, [particleColor]);

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '200px',
          height: '150px',
          transform: 'scaleX(-1)',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          display: 'none' // Hidden by default, set to 'block' to show camera feed
        }}
      />

      {/* Hand tracking status indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'monospace',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ marginBottom: '6px' }}>
          Hands: {handData.handsDetected}
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: handData.handsDetected > 0 ? '#00ff00' : '#666',
            marginLeft: '10px'
          }} />
        </div>
        <div>Scale: {handData.scale.toFixed(2)}x</div>
        {handData.handsDetected === 2 && (
          <div style={{ marginTop: '6px', fontSize: '12px', opacity: 0.7 }}>
            Distance: {handData.distance.toFixed(3)}
          </div>
        )}
      </div>
    </>
  );
}
