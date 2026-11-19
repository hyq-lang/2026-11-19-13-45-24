import { useEffect, useRef } from 'react';
import { site } from '../data';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

/**
 * Hero 动态背景。
 * - 若 data.ts 中 heroVideo 有值，则渲染真实视频背景。
 * - 否则渲染 Canvas 科技粒子网络（离线可用、不会因外链失效）。
 */
export default function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 视频滚出首屏后暂停解码播放，回到首屏再恢复，节省 CPU/GPU。
  useEffect(() => {
    const video = videoRef.current;
    if (!site.heroVideo || !video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (site.heroVideo) return; // 使用视频时跳过 canvas 动画
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(110, Math.floor((width * height) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.15,
      }));
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 粒子运动
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      }

      // 连线：粒子之间 + 鼠标附近
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const o = (1 - dist / 130) * 0.12;
            ctx.strokeStyle = `rgba(255,255,255,${o})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // 鼠标感应连线（珊瑚色）
        const m = particles[i];
        const md = Math.hypot(m.x - mouse.x, m.y - mouse.y);
        if (md < 180) {
          const o = (1 - md / 180) * 0.5;
          ctx.strokeStyle = `rgba(155,124,255,${o})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r + 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(155,124,255,${o})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="tech-bg" aria-hidden="true">
      {site.heroVideo ? (
        <video
          ref={videoRef}
          className="tech-bg__video"
          src={site.heroVideo}
          poster="/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <canvas ref={canvasRef} className="tech-bg__canvas" />
      )}
      <div className="tech-bg__glow tech-bg__glow--a" />
      <div className="tech-bg__glow tech-bg__glow--b" />
      <div className="tech-bg__grid" />
      <div className="tech-bg__vignette" />
      <div className="tech-bg__grain" />
      <div className="tech-bg__noise" />
    </div>
  );
}
