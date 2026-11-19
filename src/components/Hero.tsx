import { site } from '../data';
import TechBackground from './TechBackground';
import { ArrowDown, ArrowUpRight } from './Icons';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <TechBackground />

      <div className="container hero__inner">
        <div className="hero__content">
          <span className="eyebrow hero__eyebrow">
            <span className="dot" />
            {site.hero.eyebrow}
          </span>

          <h1 className="hero__title">
            {site.hero.titleLines.map((line, i) => (
              <span className="hero__line" key={i} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                <span>{line}</span>
              </span>
            ))}
          </h1>

          <p className="hero__subtitle">{site.hero.subtitle}</p>

          <div className="hero__cta">
            <a href={site.hero.primaryCta.href} className="btn btn--primary">
              {site.hero.primaryCta.label}
              <ArrowUpRight />
            </a>
            <a href={site.hero.secondaryCta.href} className="btn btn--ghost">
              {site.hero.secondaryCta.label}
              <ArrowUpRight />
            </a>
          </div>
        </div>

        <div className="hero__side">
          <span>{site.hero.sideLabel}</span>
          <i />
        </div>
      </div>

      <div className="container hero__bottom">
        <a href="#about" className="hero__scroll">
          <span className="hero__scroll-icon">
            <ArrowDown />
          </span>
          <span>{site.hero.scrollHint}</span>
        </a>
        <span className="hero__avail">
          <span className="dot" />
          {site.availability}
        </span>
      </div>
    </section>
  );
}
