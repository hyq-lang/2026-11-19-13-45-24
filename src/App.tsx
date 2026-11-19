import { useEffect, useRef, useState } from 'react';
import './App.css';
import { useSiteAnimations } from './animations';
import DarkVeil from './components/DarkVeil';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Work from './components/Work';
import Strengths from './components/Strengths';
import Contact from './components/Contact';

export default function App() {
  // GSAP 动效系统（首屏 opening + 滚动进场 + 视差），内部含减少动效/兜底处理
  useSiteAnimations();

  const progressRef = useRef<HTMLDivElement>(null);
  // DarkVeil 是 fixed 全屏 WebGL，首屏被不透明 Hero 视频遮住。
  // 延迟到接近第二屏时才挂载，避免首屏白白跑重着色器。
  const [veilActive, setVeilActive] = useState(false);
  const veilActivated = useRef(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;

      if (!veilActivated.current && window.scrollY > window.innerHeight * 0.4) {
        veilActivated.current = true;
        setVeilActive(true);
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" ref={progressRef} />
      {/* 全屏固定流动背景：头图以不透明背景遮住它，头图以下区块透明透出 */}
      <div className="page-veil" aria-hidden="true">
        {veilActive && (
          <div className="page-veil__canvas">
            <DarkVeil
              color="#6b12ff"
              speed={0.35}
              brightness={1.05}
              sheen={0.55}
              glow={0.55}
              grain={0.035}
              warp={0.15}
              flow={0.85}
              fade={0.35}
              quality={0.5}
            />
          </div>
        )}
        <div className="page-veil__tint" />
      </div>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Work />
        <Strengths />
        <Contact />
      </main>
    </>
  );
}
