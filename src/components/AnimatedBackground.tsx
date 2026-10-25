import React, { useEffect, useRef } from 'react';
import { HolyricsAnimatedBg } from '../services/holyricsService';

interface Props {
  bgType: HolyricsAnimatedBg;
  className?: string;
}

export const AnimatedBackground: React.FC<Props> = ({ bgType, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!bgType || bgType === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 1. PARTICULAS DOURADAS (Glória & Unção)
    // =========================================================================
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      targetAlpha: number;
      hue: number;
    }

    const particles: Particle[] = [];
    const particleCount = 75;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.8 + 1,
        speedY: -(Math.random() * 0.45 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.8 + 0.2,
        hue: Math.random() * 20 + 38 // Tom dourado nobre (38-58)
      });
    }

    // =========================================================================
    // 2. ONDAS CELESTIAIS (Louvor e Adoração)
    // =========================================================================
    let waveStep = 0;

    // =========================================================================
    // 3. FEIXES DE LUZ (Raios Divinos)
    // =========================================================================
    interface Ray {
      angle: number;
      width: number;
      speed: number;
      alpha: number;
      maxAlpha: number;
    }
    const rays: Ray[] = [
      { angle: -0.45, width: 0.18, speed: 0.0003, alpha: 0.15, maxAlpha: 0.25 },
      { angle: -0.22, width: 0.24, speed: -0.0004, alpha: 0.18, maxAlpha: 0.3 },
      { angle: 0.05, width: 0.2, speed: 0.00035, alpha: 0.2, maxAlpha: 0.35 },
      { angle: 0.28, width: 0.22, speed: -0.0003, alpha: 0.16, maxAlpha: 0.28 },
      { angle: 0.5, width: 0.19, speed: 0.00045, alpha: 0.14, maxAlpha: 0.22 }
    ];

    // =========================================================================
    // 4. BOKEH DE ADORAÇÃO (Orbes Fluídicos)
    // =========================================================================
    interface BokehOrb {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      baseAlpha: number;
      pulseSpeed: number;
      color: string;
    }
    const bokehColors = [
      'rgba(234, 179, 8,',   // Dourado
      'rgba(14, 165, 233,',  // Ciano
      'rgba(168, 85, 247,',  // Roxo
      'rgba(244, 63, 94,',   // Rosa suave
      'rgba(20, 184, 166,'   // Turquesa
    ];
    const bokehOrbs: BokehOrb[] = [];
    for (let i = 0; i < 22; i++) {
      bokehOrbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 90 + 50,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseAlpha: Math.random() * 0.18 + 0.08,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: bokehColors[i % bokehColors.length]
      });
    }

    // =========================================================================
    // 5. NEBULOSA DE ORAÇÃO (Nuvens Espirituais)
    // =========================================================================
    let nebulaTime = 0;

    // =========================================================================
    // 6. CHAMA DO ESPÍRITO (Avivamento Pentecostal)
    // =========================================================================
    interface Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      life: number;
      maxLife: number;
      color: string;
    }
    const embers: Ember[] = [];
    const emberCount = 65;
    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1.2,
        speedY: -(Math.random() * 0.8 + 0.3),
        speedX: (Math.random() - 0.5) * 0.4,
        life: Math.random() * 100,
        maxLife: Math.random() * 100 + 80,
        color: Math.random() > 0.4 ? 'rgba(249, 115, 22,' : 'rgba(234, 179, 8,'
      });
    }

    // LOOP PRINCIPAL DE ANIMAÇÃO
    const render = () => {
      // Limpa canvas
      ctx.clearRect(0, 0, width, height);

      if (bgType === 'particulas_douradas') {
        // Fundo Gradiente Cósmico Ouro & Preto
        const bgGrad = ctx.createRadialGradient(
          width * 0.5, height * 0.4, 40,
          width * 0.5, height * 0.5, Math.max(width, height) * 0.8
        );
        bgGrad.addColorStop(0, '#1c1503');
        bgGrad.addColorStop(0.5, '#0b0801');
        bgGrad.addColorStop(1, '#030200');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Renderiza partículas de ouro
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          // Halo da partícula
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
          glow.addColorStop(0, `hsla(${p.hue}, 95%, 65%, ${p.alpha})`);
          glow.addColorStop(0.5, `hsla(${p.hue}, 90%, 50%, ${p.alpha * 0.4})`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Núcleo brilhante
          ctx.fillStyle = `hsla(${p.hue + 10}, 100%, 85%, ${p.alpha * 1.2})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (bgType === 'ondas_celestiais') {
        // Fundo Azul Profundo
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#030712');
        bgGrad.addColorStop(0.4, '#0b1329');
        bgGrad.addColorStop(0.8, '#081734');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        waveStep += 0.007;

        // Desenha 4 camadas de ondas fluidas
        const layers = [
          { color: 'rgba(14, 165, 233, 0.12)', freq: 0.002, speed: 1.0, yOffset: 0.45, amp: 70 },
          { color: 'rgba(99, 102, 241, 0.14)', freq: 0.0028, speed: 1.4, yOffset: 0.55, amp: 85 },
          { color: 'rgba(45, 212, 191, 0.10)', freq: 0.0018, speed: 0.8, yOffset: 0.65, amp: 60 },
          { color: 'rgba(56, 189, 248, 0.15)', freq: 0.0024, speed: 1.2, yOffset: 0.75, amp: 95 }
        ];

        layers.forEach((layer) => {
          ctx.fillStyle = layer.color;
          ctx.beginPath();
          ctx.moveTo(0, height);

          const baseY = height * layer.yOffset;
          for (let x = 0; x <= width; x += 15) {
            const y = baseY + Math.sin(x * layer.freq + waveStep * layer.speed) * layer.amp +
                             Math.cos(x * layer.freq * 0.5 + waveStep * layer.speed * 0.7) * (layer.amp * 0.4);
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        });

      } else if (bgType === 'feixes_luz') {
        // Fundo Azul Real Noturno
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#040d21');
        bgGrad.addColorStop(0.5, '#020617');
        bgGrad.addColorStop(1, '#010309');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Fonte dos feixes no topo central
        const originX = width * 0.5;
        const originY = -50;

        rays.forEach((ray) => {
          ray.angle += ray.speed;
          if (ray.angle > 0.65 || ray.angle < -0.65) ray.speed *= -1;

          const length = height * 1.5;
          const leftAngle = ray.angle - ray.width * 0.5;
          const rightAngle = ray.angle + ray.width * 0.5;

          const p1X = originX + Math.sin(leftAngle) * length;
          const p1Y = originY + Math.cos(leftAngle) * length;
          const p2X = originX + Math.sin(rightAngle) * length;
          const p2Y = originY + Math.cos(rightAngle) * length;

          const rayGrad = ctx.createRadialGradient(originX, originY, 40, originX, originY + height * 0.8, length);
          rayGrad.addColorStop(0, `rgba(186, 230, 253, ${ray.alpha * 1.5})`);
          rayGrad.addColorStop(0.3, `rgba(56, 189, 248, ${ray.alpha})`);
          rayGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(p1X, p1Y);
          ctx.lineTo(p2X, p2Y);
          ctx.closePath();
          ctx.fill();
        });

        // Brilho no topo central
        const topGlow = ctx.createRadialGradient(originX, 0, 10, originX, 0, 350);
        topGlow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        topGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.25)');
        topGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGlow;
        ctx.beginPath();
        ctx.arc(originX, 0, 350, 0, Math.PI * 2);
        ctx.fill();

      } else if (bgType === 'bokeh_avivamento') {
        // Fundo Roxo & Índigo Profundo
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#090514');
        bgGrad.addColorStop(0.5, '#0d091e');
        bgGrad.addColorStop(1, '#05020a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        bokehOrbs.forEach((orb) => {
          orb.x += orb.vx;
          orb.y += orb.vy;

          if (orb.x < -orb.radius) orb.x = width + orb.radius;
          if (orb.x > width + orb.radius) orb.x = -orb.radius;
          if (orb.y < -orb.radius) orb.y = height + orb.radius;
          if (orb.y > height + orb.radius) orb.y = -orb.radius;

          const currentAlpha = orb.baseAlpha + Math.sin(Date.now() * orb.pulseSpeed) * 0.05;

          const orbGrad = ctx.createRadialGradient(
            orb.x, orb.y, orb.radius * 0.1,
            orb.x, orb.y, orb.radius
          );
          orbGrad.addColorStop(0, `${orb.color} ${Math.max(0, currentAlpha * 1.5)})`);
          orbGrad.addColorStop(0.5, `${orb.color} ${Math.max(0, currentAlpha * 0.8)})`);
          orbGrad.addColorStop(1, `${orb.color} 0)`);

          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (bgType === 'nebulosa_oracao') {
        nebulaTime += 0.004;

        // Fundo Cósmico
        ctx.fillStyle = '#020308';
        ctx.fillRect(0, 0, width, height);

        // Nuvens orbitais
        const centers = [
          { x: width * 0.35 + Math.sin(nebulaTime) * 120, y: height * 0.4 + Math.cos(nebulaTime) * 80, rad: 380, col: 'rgba(147, 51, 234, 0.16)' },
          { x: width * 0.65 + Math.cos(nebulaTime * 0.8) * 140, y: height * 0.6 + Math.sin(nebulaTime * 0.8) * 90, rad: 420, col: 'rgba(16, 185, 129, 0.12)' },
          { x: width * 0.5 + Math.sin(nebulaTime * 1.2) * 80, y: height * 0.3 + Math.cos(nebulaTime * 1.2) * 60, rad: 300, col: 'rgba(59, 130, 246, 0.15)' }
        ];

        centers.forEach((c) => {
          const g = ctx.createRadialGradient(c.x, c.y, 20, c.x, c.y, c.rad);
          g.addColorStop(0, c.col);
          g.addColorStop(0.6, c.col.replace(/[\d\.]+\)$/, '0.04)'));
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.rad, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (bgType === 'fogo_pentecostal') {
        // Fundo Rubi / Brasa Escuro
        const bgGrad = ctx.createRadialGradient(
          width * 0.5, height * 0.9, 50,
          width * 0.5, height * 0.5, Math.max(width, height) * 0.85
        );
        bgGrad.addColorStop(0, '#260a03');
        bgGrad.addColorStop(0.4, '#120401');
        bgGrad.addColorStop(1, '#040100');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Brilho na base (como uma fornalha / altar aceso)
        const baseGlow = ctx.createRadialGradient(width * 0.5, height, 50, width * 0.5, height, width * 0.6);
        baseGlow.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
        baseGlow.addColorStop(0.4, 'rgba(249, 115, 22, 0.15)');
        baseGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = baseGlow;
        ctx.fillRect(0, height * 0.5, width, height * 0.5);

        // Brasas subindo
        embers.forEach((emb) => {
          emb.y += emb.speedY;
          emb.x += emb.speedX + Math.sin(emb.life * 0.1) * 0.4;
          emb.life += 1;

          if (emb.life > emb.maxLife || emb.y < -10) {
            emb.y = height + Math.random() * 20;
            emb.x = Math.random() * width;
            emb.life = 0;
            emb.maxLife = Math.random() * 100 + 80;
          }

          const progress = emb.life / emb.maxLife;
          const alpha = Math.sin(progress * Math.PI) * 0.85;

          const glow = ctx.createRadialGradient(emb.x, emb.y, 0, emb.x, emb.y, emb.size * 3);
          glow.addColorStop(0, `${emb.color} ${alpha})`);
          glow.addColorStop(0.6, `${emb.color} ${alpha * 0.3})`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(emb.x, emb.y, emb.size * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(emb.x, emb.y, emb.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [bgType]);

  if (!bgType || bgType === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 w-full h-full ${className}`}
    />
  );
};
