import { site } from '../data';
import { onImgError } from '../imgFallback';
import Reveal from './Reveal';
import SpecularCard from './SpecularCard';
import { ArrowUpRight } from './Icons';

export default function About() {
  const { about } = site;

  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="about__grid">
          {/* 居中标题 */}
          <Reveal className="about__intro">
            <span className="eyebrow">
              <span className="dot" />
              {about.label}
            </span>
            <h2 className="about__heading">{about.heading}</h2>
          </Reveal>

          {/* 放大的镜面流光名片卡，居中 */}
          <Reveal className="about__visual-col">
            <SpecularCard
              className="about__visual"
              radius={26}
              tint="#9b7cff"
              tintOpacity={0.06}
              blur={14}
              textColor="#ededf0"
              lineColor="#b79cff"
              baseColor="#3b3552"
              intensity={1}
              idleIntensity={0.42}
              shineSize={14}
              shineFade={42}
              thickness={1.5}
              glow={1}
              followMouse
              proximity={320}
              autoAnimate
              speed={0.28}
            >
              <div className="portrait">
                <div className="portrait__frame">
                  <div className="portrait__backdrop" />
                  <picture>
                    <source srcSet="/images/portrait-cutout.webp" type="image/webp" />
                    <img
                      className="portrait__photo"
                      src="/images/portrait-cutout.png"
                      alt={`${site.nameZh} 的证件照`}
                      loading="lazy"
                      decoding="async"
                      onError={onImgError}
                    />
                  </picture>
                  <div className="portrait__scan" />
                  <div className="portrait__grid" />
                  <span className="portrait__tag">{site.roleLine}</span>
                </div>
              </div>

              {/* 个人信息并入人物卡 */}
              <div className="about__contact">
                {about.contactList.map((c) => (
                  <div className="about__contact-row" key={c.key}>
                    <span className="about__contact-key">{c.key}</span>
                    {c.href ? (
                      <a href={c.href} className="about__contact-val about__contact-val--link">
                        {c.value} <ArrowUpRight />
                      </a>
                    ) : (
                      <span className="about__contact-val">{c.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </SpecularCard>
          </Reveal>

          {/* 介绍文字，居中窄栏 */}
          <Reveal className="about__body" delay={60}>
            <div className="about__paragraphs">
              {about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          {/* 数据卡片 */}
          <Reveal className="stats" delay={100}>
            {about.stats.map((s, i) => (
              <div className="stats__item" key={i}>
                <div className="stats__num">
                  {String(s.value).padStart(2, '0')}<span>{s.suffix}</span>
                </div>
                <div className="stats__label">{s.label}</div>
                <span className="stats__idx">0{i + 1}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
