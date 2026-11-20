import { useCallback, useRef } from 'react';
import { site } from '../data';
import { onImgError } from '../imgFallback';
import Reveal from './Reveal';
import { ArrowUpRight } from './Icons';

type Project = (typeof site.work.projects)[number];

interface Props {
  onOpen: (project: Project, source: HTMLElement | null) => void;
}

export default function Work({ onOpen }: Props) {
  const { work } = site;
  // 记录每张卡片的封面元素，作为共享元素转场的起点
  const sourceRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleOpen = useCallback(
    (p: Project) => {
      // 把被点击卡片的封面元素交给 App，由 App 编排共享元素转场
      onOpen(p, sourceRefs.current[p.id] ?? null);
    },
    [onOpen],
  );

  const goContact = useCallback(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="section work" id="work">
      <div className="container">
        <div className="section-head">
          <div className="section-head__meta">
            <span className="section-head__index">/ {work.index}</span>
            <span className="eyebrow">{work.label}</span>
          </div>
          <h2 className="section-head__title">{work.heading}</h2>
          <p className="section-head__desc">{work.description}</p>
        </div>

        <div className="work__grid">
          {work.projects.map((p, i) => {
            const gallery = 'gallery' in p ? p.gallery : undefined;
            const cover = 'cover' in p ? p.cover : undefined;
            const hasGallery = !!gallery?.length;
            const hasCover = !!cover;

            return (
              <Reveal key={p.id} delay={(i % 2) * 90}>
                <article className="project">
                  <button
                    type="button"
                    className="project__trigger"
                    onClick={() => (hasCover && hasGallery ? handleOpen(p) : goContact())}
                    aria-label={`查看项目：${p.title}`}
                  >
                    <div className="project__media">
                      {cover ? (
                        <img
                          ref={(el) => { sourceRefs.current[p.id] = el; }}
                          data-project-source={p.id}
                          className="project__cover"
                          src={cover}
                          alt={p.title}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          onError={onImgError}
                        />
                      ) : (
                        <ProjectArt kind={p.art} />
                      )}
                      <div className="project__overlay">
                        <span className="project__view">
                          查看作品 <ArrowUpRight />
                        </span>
                      </div>
                      <span className="project__no">{p.id}</span>
                      {hasGallery ? (
                        <span className="project__count">{gallery!.length} 张作品图</span>
                      ) : null}
                    </div>
                    <div className="project__meta">
                      <div className="project__info">
                        <h3 className="project__title">{p.title}</h3>
                        <span className="project__category">{p.category}</span>
                      </div>
                      <div className="project__right">
                        <div className="project__tags">
                          {p.tags.map((t) => <span key={t}>{t}</span>)}
                        </div>
                        <span className="project__year">{p.year}</span>
                      </div>
                    </div>
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** 根据 kind 渲染不同的抽象项目视觉，全部用 CSS / SVG 生成，无需外部图片 */
function ProjectArt({ kind }: { kind: string }) {
  switch (kind) {
    case 'app':
      return (
        <div className="art art--app">
          <div className="art__orb" />
          <div className="phone">
            <div className="phone__notch" />
            <div className="phone__map">
              <span className="phone__route" />
              <span className="phone__pin phone__pin--1" />
              <span className="phone__pin phone__pin--2" />
            </div>
            <div className="phone__card">
              <span className="phone__bar phone__bar--lg" />
              <span className="phone__bar phone__bar--sm" />
            </div>
          </div>
          <span className="art__label">MOBILE EXPERIENCE</span>
        </div>
      );
    case 'brand':
      return (
        <div className="art art--brand">
          <div className="brand__word">NOVA</div>
          <div className="brand__ring" />
          <span className="art__label">BRAND IDENTITY</span>
        </div>
      );
    case 'dashboard':
      return (
        <div className="art art--dash">
          <div className="dash">
            <div className="dash__side">
              <i /><i /><i /><i /><i />
            </div>
            <div className="dash__main">
              <div className="dash__top"><span /><span /></div>
              <div className="dash__cards">
                <div className="dash__kpi"><b>84.2%</b><span className="dash__spark" /></div>
                <div className="dash__kpi"><b>12.8k</b><span className="dash__spark" /></div>
                <div className="dash__kpi"><b>2,104</b><span className="dash__spark" /></div>
              </div>
              <div className="dash__chart">
                {[38, 62, 48, 80, 55, 92, 70, 84].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
          <span className="art__label">DESIGN SYSTEM</span>
        </div>
      );
    case 'commerce':
      return (
        <div className="art art--commerce">
          <div className="commerce__head"><span /><span /></div>
          <div className="commerce__grid">
            <div className="commerce__tile commerce__tile--a" />
            <div className="commerce__tile commerce__tile--b" />
            <div className="commerce__tile commerce__tile--c" />
          </div>
          <span className="art__label">WEB / E-COMMERCE</span>
        </div>
      );
    case 'flow':
      return (
        <div className="art art--flow">
          <div className="flow__nodes">
            <span className="flow__node flow__node--1" />
            <span className="flow__node flow__node--2" />
            <span className="flow__node flow__node--3" />
            <span className="flow__node flow__node--4" />
            <svg className="flow__lines" viewBox="0 0 600 400" preserveAspectRatio="none">
              <path d="M150 120 C 260 120, 260 250, 380 250" />
              <path d="M150 300 C 260 300, 260 150, 380 150" />
              <path d="M380 150 L 470 200" />
              <path d="M380 250 L 470 200" />
            </svg>
          </div>
          <span className="art__label">PRODUCT / INTERACTION</span>
        </div>
      );
    default:
      return <div className="art" />;
  }
}
