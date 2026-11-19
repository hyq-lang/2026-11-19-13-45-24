import { useState } from 'react';
import { site } from '../data';
import Reveal from './Reveal';
import { ArrowUpRight } from './Icons';

export default function Experience() {
  const { experience } = site;
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="section experience" id="experience">
      <div className="container">
        <div className="section-head">
          <div className="section-head__meta">
            <span className="section-head__index">/ {experience.index}</span>
            <span className="eyebrow">{experience.label}</span>
          </div>
          <h2 className="section-head__title">{experience.heading}</h2>
          <p className="section-head__desc">{experience.description}</p>
        </div>

        <div className="timeline">
          {experience.items.map((item, i) => {
            const isOpen = active === i;
            return (
              <Reveal key={i} delay={i * 70}>
                <div className={`tl-item ${isOpen ? 'is-open' : ''}`}>
                  <div className="tl-rail">
                    <span className="tl-dot" />
                    <span className="tl-line" />
                  </div>

                  <button
                    className="tl-head"
                    onClick={() => setActive(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <div className="tl-head__main">
                      <span className={`tl-type tl-type--${item.type === '教育' ? 'edu' : item.type === '实习' ? 'intern' : 'work'}`}>
                        {item.type}
                      </span>
                      <h3 className="tl-role">{item.role}</h3>
                      <span className="tl-org">{item.org}</span>
                      {item.current && <span className="tl-current"><span className="dot" /> 最近</span>}
                    </div>
                    <div className="tl-head__right">
                      <div className="tl-period">
                        <span>{item.period}</span>
                        <span className="tl-place">{item.place}</span>
                      </div>
                      <span className="tl-expand">
                        <span />
                        <span />
                      </span>
                    </div>
                  </button>

                  <div className="tl-body" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                    <div className="tl-body__inner">
                      <p className="tl-desc">{item.desc}</p>
                      <ul className="tl-highlights">
                        {item.highlights.map((h, hi) => (
                          <li key={hi}>
                            <ArrowUpRight />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
