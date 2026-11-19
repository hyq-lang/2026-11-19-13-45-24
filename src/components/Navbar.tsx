import { useEffect, useState } from 'react';
import { site } from '../data';
import { ArrowUpRight } from './Icons';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 首屏（Hero）保持透明融入视频，滚过约 72% 屏高（即将进入第二屏）时浮现磨砂玻璃
    // rAF 节流 + 状态未变化时不触发 setState，避免滚动时无意义重渲染
    let ticking = false;
    const update = () => {
      ticking = false;
      const next = window.scrollY > window.innerHeight * 0.72;
      setScrolled((prev) => (prev === next ? prev : next));
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
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" aria-label="回到顶部">
          <span className="nav__logo">{site.initials}</span>
          <span className="nav__brandname">{site.nameEn}</span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`}>
          {site.nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a href={`mailto:${site.email}`} className="nav__contact">
            <span>联系我</span>
            <ArrowUpRight />
          </a>
          <button
            className={`nav__toggle ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="切换菜单"
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
