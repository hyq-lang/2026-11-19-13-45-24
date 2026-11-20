import { useEffect, useRef, useState } from 'react';
import { site } from '../data';
import { scrollToTop } from '../scroll';
import { ArrowUpRight } from './Icons';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // 当前所在栏目（href），用于激活态；首屏 Hero 无对应导航项时为空
  const [activeHref, setActiveHref] = useState<string>('');
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 首屏（Hero）保持透明融入视频，滚过约 72% 屏高时浮现磨砂玻璃。
    // 同一条 rAF 里顺带计算激活栏目，避免额外注册滚动监听。
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const next = y > window.innerHeight * 0.72;
      setScrolled((prev) => (prev === next ? prev : next));

      // 判定线取视口 38% 处：越过该线的最后一个 section 即为当前栏目。
      const probeLine = window.innerHeight * 0.38;
      let current = '';
      for (const item of site.nav) {
        const el = document.querySelector(item.href);
        if (el && el.getBoundingClientRect().top <= probeLine) current = item.href;
      }
      // 触底时强制高亮最后一栏，避免底部留白区仍显示上一栏目。
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) {
        current = site.nav[site.nav.length - 1].href;
      }
      setActiveHref((prev) => (prev === current ? prev : current));
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

  // 菜单展开时锁定背景滚动；Esc / 点击导航外部均可关闭。
  // PC 端菜单常驻（open 恒为 false），此 effect 不生效，不影响桌面体验。
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  /** 点击导航项：即时高亮 + 关闭菜单（锚点跳转由 href 原生完成，平滑滚动由 CSS 控制） */
  const onNavClick = (href: string) => {
    setActiveHref(href);
    setOpen(false);
  };

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`} ref={navRef}>
      <div className="container nav__inner">
        <a
          href="#top"
          className="nav__brand"
          aria-label="回到顶部"
          onClick={(e) => {
            e.preventDefault();
            setActiveHref('');
            setOpen(false);
            scrollToTop();
          }}
        >
          <span className="nav__logo">{site.initials}</span>
          <span className="nav__brandname">{site.nameEn}</span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="主导航">
          {site.nav.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={isActive ? 'is-active' : undefined}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => onNavClick(item.href)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="nav__actions">
          <a href={`mailto:${site.email}`} className="nav__contact">
            <span>联系我</span>
            <ArrowUpRight />
          </a>
          <button
            type="button"
            className={`nav__toggle ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? '关闭菜单' : '打开菜单'}
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
