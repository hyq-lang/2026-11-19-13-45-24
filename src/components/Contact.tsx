import { site } from '../data';
import Reveal from './Reveal';
import { ArrowUpRight } from './Icons';

export default function Contact() {
  const { contact } = site;

  return (
    <section className="contact" id="contact">
      <div className="contact__glow" aria-hidden="true" />
      <div className="container contact__inner">
        <Reveal>
          <span className="eyebrow contact__eyebrow">
            <span className="dot" />
            {contact.label}
          </span>
        </Reveal>

        <h2 className="contact__heading">
          {contact.headingLines.map((line, i) => (
            <span className="contact__line" key={i}>{line}</span>
          ))}
        </h2>

        <Reveal delay={100}>
          <p className="contact__desc">{contact.description}</p>
          <a href={`mailto:${site.email}`} className="contact__email">
            <span>{site.email}</span>
            <ArrowUpRight />
          </a>
        </Reveal>

        <Reveal delay={160}>
          <div className="contact__socials">
            {contact.socials.map((s) => (
              <a href={s.href} key={s.label} target={s.href !== '#' ? '_blank' : undefined} rel="noreferrer">
                {s.label} <ArrowUpRight />
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="container contact__footer">
        <span>{contact.footerNote}</span>
        <span className="contact__made">{contact.madeWith} <i /></span>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </section>
  );
}
