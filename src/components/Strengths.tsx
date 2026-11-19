import { site } from '../data';
import Reveal from './Reveal';
import { iconMap, ArrowUpRight } from './Icons';
import type { MouseEvent } from 'react';

export default function Strengths() {
  const { strengths } = site;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <section className="section strengths" id="strengths">
      <div className="container">
        <div className="section-head">
          <div className="section-head__meta">
            <span className="section-head__index">/ {strengths.index}</span>
            <span className="eyebrow">{strengths.label}</span>
          </div>
          <h2 className="section-head__title">{strengths.heading}</h2>
          <p className="section-head__desc">{strengths.description}</p>
        </div>

        <div className="strengths__grid">
          {strengths.items.map((item, i) => {
            const Icon = iconMap[item.icon];
            return (
              <Reveal key={item.title} delay={(i % 3) * 80}>
                <div className="strength" onMouseMove={onMove}>
                  <div className="strength__top">
                    <div className="strength__icon">{Icon && <Icon />}</div>
                    <span className="strength__no">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="strength__body">
                    <h3 className="strength__title">{item.title}</h3>
                    <span className="strength__en">{item.en}</span>
                    <p className="strength__desc">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="strength__arrow" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
