/**
 * 项目详情页（进入 / 退出转场的终点与起点）
 * - 主视觉 data-detail-hero + view-transition-name: project-hero
 * - 内部滚动 .detail__scroll：所有滚动动效 / 进度 / 章节高亮均以此容器为基准
 * - 章节导航基于 gallery 真实 alt 文案生成，不虚构内容
 * - 图片：加载占位 + 渐显 + 点击放大（Lightbox）
 * - 阅读进度条、上一个 / 下一个项目切换
 * - 所有文案与图片复用 site.work.projects 的既有数据
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { site } from '../data';
import { prefersReducedMotion } from '../transitions';
import { onImgError } from '../imgFallback';
import Lightbox from './Lightbox';
import './ProjectDetail.css';

type Project = (typeof site.work.projects)[number];
type GalleryImage = { src: string; alt: string };

interface Props {
  project: Project;
  projects: Project[];
  onClose: () => void;
  onSwitch: (project: Project) => void;
}

interface Chapter {
  id: string;
  label: string;
  fullLabel: string;
}

/** 用真实 alt 文案生成简短章节名，不新增语义 */
function shotLabel(g: GalleryImage, i: number): string {
  if (/作品集开篇|万象归栈/.test(g.alt)) return '作品开篇';
  const desc = g.alt.split('·')[0].trim();
  return desc ? `${desc} ${String(i + 1).padStart(2, '0')}` : `设计稿 ${String(i + 1).padStart(2, '0')}`;
}

export default function ProjectDetail({ project, projects, onClose, onSwitch }: Props) {
  // project 来自常量数组、引用稳定：memo 化后 gallery 引用不再每次渲染新建，
  // 使下方依赖 gallery 的 chapters useMemo 真正只算一次（消除无效重算）。
  const gallery = useMemo<GalleryImage[]>(
    () => ('gallery' in project ? project.gallery : []),
    [project],
  );
  const cover = 'cover' in project ? project.cover : '';
  const introSource = gallery.find((g) => !/作品集开篇|万象归栈/.test(g.alt)) ?? gallery[0];
  const intro = introSource ? introSource.alt.split('·')[0].trim() : project.category;

  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const chapterNavRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 章节：项目概述（真实存在）+ 每张设计稿（真实存在）
  const chapters = useMemo<Chapter[]>(() => {
    const base: Chapter[] = [
      { id: 'detail-overview', label: '项目概述', fullLabel: '项目概述' },
    ];
    gallery.forEach((g, i) => {
      base.push({
        id: `detail-shot-${i + 1}`,
        label: shotLabel(g, i),
        fullLabel: g.alt,
      });
    });
    return base;
  }, [gallery]);

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const prevProject = projects[(currentIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIndex + 1) % projects.length];

  // 滚动驱动：阅读进度 + 当前章节高亮 + 克制视差（单例 rAF 节流）
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    // 元素列表在本次挂载内稳定，缓存起来避免每帧 querySelectorAll / getElementById
    const parallaxEls = Array.from(scroller.querySelectorAll<HTMLElement>('[data-parallax]'));
    const chapterEls = chapters.map((ch) => document.getElementById(ch.id));
    let ticking = false;
    let lastActive = -1;
    const update = () => {
      ticking = false;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const pct = max > 0 ? (scroller.scrollTop / max) * 100 : 0;
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;

      const scrollerTop = scroller.getBoundingClientRect().top;
      let active = 0;
      chapterEls.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top - scrollerTop <= 140) active = i;
      });
      // 仅在章节变化时更新 state，避免每帧触发 React 调度
      if (active !== lastActive) {
        lastActive = active;
        setActiveChapter(active);
      }

      // 视差：仅处理视口附近的大图，幅度 ±12px，避免影响阅读
      for (const el of parallaxEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < scrollerTop || r.top > scrollerTop + scroller.clientHeight) continue;
        const center = r.top + r.height / 2;
        const rel = (center - (scrollerTop + scroller.clientHeight / 2)) / scroller.clientHeight;
        const shift = Math.max(-12, Math.min(12, -rel * 26));
        el.style.setProperty('--parallax', `${shift.toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('resize', onScroll);
    };
  }, [chapters]);

  // 滚动入场：以内部容器为 root，once 语义（展示过不再重播）
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const els = Array.from(scroller.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    // 仅在 JS 正常运行时才把待入场元素置为隐藏；JS 失效时默认可见，绝不空白
    document.documentElement.classList.add('detail-io-ready');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { root: scroller, rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      document.documentElement.classList.remove('detail-io-ready');
    };
  }, [project.id]);

  // 切换项目后滚动位置由组件重挂载重置；这里再做一次兜底
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [project.id]);

  // 章节定位：在当前滚动容器内平滑滚动，避开顶部吸附区
  const gotoChapter = (id: string) => {
    const scroller = scrollRef.current;
    const target = document.getElementById(id);
    if (!scroller || !target) return;
    const top =
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      140;
    scroller.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  // 当前章节自动滚入导航可视区（移动端横向导航）
  useEffect(() => {
    const nav = chapterNavRef.current;
    if (!nav) return;
    const el = nav.querySelector<HTMLElement>('.detail__chapter.is-active');
    if (!el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.left < navRect.left || elRect.right > navRect.right) {
      nav.scrollTo({
        left: el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, [activeChapter]);

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={project.title}>
      {/* 阅读进度条：随内部滚动更新，项目切换时随组件重挂载归零 */}
      <div className="detail__progress" aria-hidden="true"><span ref={progressRef} /></div>

      <header className="detail__topbar">
        <button type="button" className="detail__back" onClick={onClose}>
          <span aria-hidden="true">←</span> 返回作品
        </button>
        <span className="detail__topno">CASE {project.id} / {String(projects.length).padStart(2, '0')}</span>
      </header>

      {/* 章节导航：PC 固定侧边 / 移动端顶部横向可滑动 */}
      {chapters.length > 1 ? (
        <nav className="detail__chapters" ref={chapterNavRef} aria-label="项目章节导航">
          <span className="detail__chapters-label">CONTENTS</span>
          <div className="detail__chapters-list">
            {chapters.map((ch, i) => (
              <button
                type="button"
                key={ch.id}
                className={`detail__chapter${i === activeChapter ? ' is-active' : ''}`}
                title={ch.fullLabel}
                onClick={() => gotoChapter(ch.id)}
              >
                <span className="detail__chapter-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="detail__chapter-label">{ch.label}</span>
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="detail__scroll" ref={scrollRef}>
        {/* 主视觉：与卡片封面共享元素的终点 / 起点 */}
        <div className="detail__hero" data-detail-hero>
          {cover ? (
            <img className="detail__hero-media" src={cover} alt={project.title} onError={onImgError} />
          ) : null}
          <div className="detail__hero-veil" aria-hidden="true" />
        </div>

        <div className="detail__content container">
          <div className="detail__intro-block" id="detail-overview">
            <span className="detail__no">{project.id}</span>
            <h1 className="detail__title">{project.title}</h1>
            <p className="detail__category">{project.category}</p>
            <p className="detail__desc">{intro}</p>
            <div className="detail__meta">
              <span className="detail__year">{project.year}</span>
              {project.tags.map((t) => (
                <span className="detail__tag" key={t}>{t}</span>
              ))}
              {gallery.length > 0 ? (
                <span className="detail__count">{gallery.length} 张作品图</span>
              ) : null}
            </div>
          </div>

          <div className="detail__gallery">
            {gallery.map((g, i) => (
              <figure
                className="detail__shot detail__reveal"
                id={`detail-shot-${i + 1}`}
                key={g.src}
                data-reveal
              >
                <button
                  type="button"
                  className="detail__shot-open"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`放大查看：${g.alt}`}
                >
                  <img
                    className="detail__shot-img"
                    src={g.src}
                    alt={g.alt}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    data-parallax
                    onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                    onError={onImgError}
                  />
                  <span className="detail__shot-zoom" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6" /></svg>
                  </span>
                </button>
                <figcaption>
                  {String(i + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
                </figcaption>
              </figure>
            ))}
          </div>

          <footer className="detail__foot detail__reveal" data-reveal>
            <div className="detail__switch" aria-label="项目切换">
              {prevProject ? (
                <button type="button" className="detail__switch-btn" onClick={() => onSwitch(prevProject)}>
                  <span className="detail__switch-dir">← 上一个项目</span>
                  <span className="detail__switch-name">{prevProject.title}</span>
                </button>
              ) : <span />}
              <button type="button" className="detail__switch-all" onClick={onClose}>返回全部项目</button>
              {nextProject ? (
                <button type="button" className="detail__switch-btn detail__switch-btn--next" onClick={() => onSwitch(nextProject)}>
                  <span className="detail__switch-dir">下一个项目 →</span>
                  <span className="detail__switch-name">{nextProject.title}</span>
                </button>
              ) : <span />}
            </div>
          </footer>
        </div>
      </div>

      {lightboxIndex !== null && gallery.length > 0 ? (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          title={project.title}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}
