import { useEffect, useRef } from 'react';

export default function LetterGlobe({
  size = 340,
  autoRotate = true,
  className = ''
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef({
    rotX: 0.3,
    rotY: 0,
    velX: 0,
    velY: 0.004,
    dragging: false,
    lastX: 0,
    lastY: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');

    const colors = [
      '#FAF8F5', '#E8E4DD', '#D4CFC5', '#B8B2A7', '#9C968A',
      '#D4AF37', '#D4AF37', '#D4AF37', '#C9A227', '#B8962E',
      '#E8D48B', '#8B7355', '#6B5B45'
    ];

    const points = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const numPoints = 220;

    for (let i = 0; i < numPoints; i++) {
      points.push({
        theta: 2 * Math.PI * i / goldenRatio,
        phi: Math.acos(1 - 2 * (i + 0.5) / numPoints),
        char: chars[Math.floor(Math.random() * chars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 9 + Math.random() * 8
      });
    }

    const state = stateRef.current;

    function animate() {
      ctx.fillStyle = '#141210';
      ctx.fillRect(0, 0, size, size);

      if (!state.dragging && autoRotate) {
        state.velX *= 0.95;
        state.velY *= 0.98;
        if (Math.abs(state.velY) < 0.003) state.velY = 0.004;
      }

      state.rotX += state.velX;
      state.rotY += state.velY;

      const projected = points.map(p => {
        const x = radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y = radius * Math.cos(p.phi);
        const z = radius * Math.sin(p.phi) * Math.sin(p.theta);

        const cosY = Math.cos(state.rotY), sinY = Math.sin(state.rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const cosX = Math.cos(state.rotX), sinX = Math.sin(state.rotX);
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const fov = 500;
        const scale = fov / (z2 + fov);

        return { x: centerX + x1 * scale, y: centerY + y1 * scale, z: z2, scale, char: p.char, color: p.color, size: p.size };
      });

      projected.sort((a, b) => a.z - b.z);

      projected.forEach(p => {
        const depth = (p.z + radius) / (2 * radius);
        const opacity = 0.08 + depth * 0.92;

        ctx.save();
        ctx.font = `500 ${p.size * p.scale}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const r = parseInt(p.color.slice(1,3), 16);
        const g = parseInt(p.color.slice(3,5), 16);
        const b = parseInt(p.color.slice(5,7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;

        if (depth > 0.4 && (p.color === '#D4AF37' || p.color === '#C9A227' || p.color === '#B8962E')) {
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 18 * depth;
        }

        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    function start(x, y) { state.dragging = true; state.lastX = x; state.lastY = y; state.velX = 0; state.velY = 0; }
    function move(x, y) {
      if (!state.dragging) return;
      state.velY = (x - state.lastX) * 0.008;
      state.velX = (y - state.lastY) * 0.008;
      state.rotY += state.velY;
      state.rotX += state.velX;
      state.lastX = x;
      state.lastY = y;
    }
    function end() { state.dragging = false; }

    canvas.addEventListener('mousedown', e => start(e.offsetX, e.offsetY));
    canvas.addEventListener('mousemove', e => move(e.offsetX, e.offsetY));
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0], r = canvas.getBoundingClientRect();
      start(t.clientX - r.left, t.clientY - r.top);
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0], r = canvas.getBoundingClientRect();
      move(t.clientX - r.left, t.clientY - r.top);
    }, { passive: false });

    canvas.addEventListener('touchend', end);

    animate();

    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [size, autoRotate]);

  return <canvas ref={canvasRef} className={className} style={{ cursor: 'grab', touchAction: 'none' }} />;
}
