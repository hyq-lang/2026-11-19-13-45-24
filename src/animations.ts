/**
 * ============================================================
 *  站点动效系统 — GSAP + ScrollTrigger
 * ------------------------------------------------------------
 *  设计原则：
 *  1) 渐进增强：所有元素 CSS 默认可见；这里用 gsap.from() 在
 *     useLayoutEffect（首帧绘制前）设置初始态。若脚本失效/出错，
 *     内容依然完整显示——绝不会重现 opacity:0 空白问题。
 *  2) gsap.context 统一管理，兼容 React StrictMode 的双次挂载。
 *  3) 高级缓动：expo/power4，慢节奏、大位移、丝滑归位，
 *     刻意不用 back/elastic，避免廉价弹跳。
 *  4) 性能：仅动 transform/opacity/clip-path；进场动画 once:true
 *     触发后即销毁触发监听；视差只作用于少量媒体元素。
 * ============================================================
 */
import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** 统一的进场缓动 —— 慢、稳、丝滑，无回弹 */
const EASE = {
  reveal: 'power4.out',
  title: 'expo.out',
  soft: 'power3.out',
  inOut: 'power4.inOut',
};

function buildOpening() {
  const tl = gsap.timeline({
    defaults: { ease: EASE.soft },
    onComplete: () => ScrollTrigger.refresh(),
  });

  // 导航：从顶部轻微落下
  tl.from('.nav__brand, .nav__links a, .nav__contact', {
    y: -18,
    opacity: 0,
    duration: 1,
    stagger: 0.05,
    ease: EASE.soft,
  }, 0.1);

  // 眉题
  tl.from('.hero__eyebrow', {
    y: 24,
    opacity: 0,
    duration: 1.1,
    ease: EASE.reveal,
  }, 0.25);

  // 主标题：遮罩揭开（yPercent）+ 压缩后归位（scale + letter-spacing）
  tl.from('.hero__line > span', {
    yPercent: 125,
    scale: 0.9,
    letterSpacing: '0.02em',
    opacity: 0,
    transformOrigin: 'left bottom',
    duration: 1.7,
    stagger: 0.16,
    ease: EASE.title,
  }, 0.35);

  // 副标题
  tl.from('.hero__subtitle', {
    y: 36,
    opacity: 0,
    duration: 1.3,
    ease: EASE.reveal,
  }, 1.05);

  // 按钮
  tl.from('.hero__cta > *', {
    y: 30,
    opacity: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: EASE.reveal,
  }, 1.2);

  // 右侧竖排 + 底部滚动提示
  tl.from('.hero__side', { opacity: 0, x: 24, duration: 1.2, ease: EASE.soft }, 1.1);
  tl.from('.hero__bottom > *', {
    y: 20,
    opacity: 0,
    duration: 1.1,
    stagger: 0.12,
    ease: EASE.soft,
  }, 1.35);

  return tl;
}

/** section 头部：meta 先、英文/中文大标题大幅进场、描述跟上 */
function animateHead(scope: ParentNode, trigger: Element) {
  const meta = scope.querySelector('.section-head__meta');
  const title = scope.querySelector('.section-head__title');
  const desc = scope.querySelector('.section-head__desc');

  const targets = [meta, title, desc].filter(Boolean) as Element[];
  if (!targets.length) return;

  const st = { trigger, start: 'top 80%', once: true } as const;

  if (meta) {
    gsap.from(meta, {
      x: -50,
      opacity: 0,
      duration: 1.2,
      ease: EASE.soft,
      scrollTrigger: st,
    });
  }
  if (title) {
    gsap.from(title, {
      y: 90,
      opacity: 0,
      clipPath: 'inset(0 0 100% 0)',
      letterSpacing: '0.04em',
      duration: 1.6,
      ease: EASE.title,
      scrollTrigger: { trigger, start: 'top 80%', once: true },
    });
  }
  if (desc) {
    gsap.from(desc, {
      y: 40,
      opacity: 0,
      duration: 1.3,
      ease: EASE.reveal,
      scrollTrigger: { trigger, start: 'top 80%', once: true },
    });
  }
}

/** 卡片依次 stagger 出现 */
function animateCards(container: Element | null, selector: string, trigger?: Element) {
  if (!container) return;
  const items = Array.from(container.querySelectorAll(selector));
  if (!items.length) return;
  gsap.from(items, {
    y: 70,
    opacity: 0,
    duration: 1.25,
    stagger: 0.12,
    ease: EASE.reveal,
    scrollTrigger: {
      trigger: trigger ?? container,
      start: 'top 84%',
      once: true,
    },
  });
}

function buildScrollScenes() {
  // ---------- ABOUT ----------
  const about = document.querySelector('.about');
  if (about) {
    const intro = about.querySelector('.about__intro');
    if (intro) {
      const eyebrow = intro.querySelector('.eyebrow');
      const heading = intro.querySelector('.about__heading');
      if (eyebrow) {
        gsap.from(eyebrow, {
          y: 24, opacity: 0, duration: 1.1, ease: EASE.soft,
          scrollTrigger: { trigger: intro, start: 'top 82%', once: true },
        });
      }
      if (heading) {
        gsap.from(heading, {
          y: 80, opacity: 0, clipPath: 'inset(0 0 100% 0)', letterSpacing: '0.02em',
          duration: 1.6, ease: EASE.title,
          scrollTrigger: { trigger: intro, start: 'top 82%', once: true },
        });
      }
    }
    // 名片卡：位移 + 轻微缩放归位
    const visual = about.querySelector('.about__visual-col');
    if (visual) {
      gsap.from(visual, {
        y: 90, scale: 0.96, opacity: 0, duration: 1.6, ease: EASE.reveal,
        scrollTrigger: { trigger: visual, start: 'top 88%', once: true },
      });
    }
    // 人像：遮罩揭开
    const frame = about.querySelector('.portrait__frame');
    if (frame) {
      gsap.fromTo(frame,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.7,
          ease: EASE.inOut,
          scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
          onComplete: () => gsap.set(frame, { clearProps: 'clipPath' }),
        },
      );
    }
    const body = about.querySelector('.about__body');
    if (body) {
      gsap.from(body, {
        y: 50, opacity: 0, duration: 1.3, ease: EASE.reveal,
        scrollTrigger: { trigger: body, start: 'top 88%', once: true },
      });
    }
    animateCards(about.querySelector('.stats'), '.stats__item');
  }

  // ---------- EXPERIENCE / WORK / STRENGTHS ----------
  ['experience', 'work', 'strengths'].forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const head = section.querySelector('.section-head');
    if (head) animateHead(section, head);

    if (id === 'experience') animateCards(section.querySelector('.timeline'), '.reveal');
    if (id === 'work') animateCards(section.querySelector('.work__grid'), '.reveal');
    if (id === 'strengths') animateCards(section.querySelector('.strengths__grid'), '.reveal');
  });

  // ---------- CONTACT ----------
  const contact = document.querySelector('.contact');
  if (contact) {
    const inner = contact.querySelector('.contact__inner');
    if (inner) {
      const eyebrow = inner.querySelector('.eyebrow');
      const headingLines = inner.querySelectorAll('.contact__line');
      if (eyebrow) {
        gsap.from(eyebrow, {
          y: 26, opacity: 0, duration: 1.1, ease: EASE.soft,
          scrollTrigger: { trigger: inner, start: 'top 80%', once: true },
        });
      }
      if (headingLines.length) {
        gsap.from(headingLines, {
          y: 100, opacity: 0, clipPath: 'inset(0 0 100% 0)',
          duration: 1.6, stagger: 0.14, ease: EASE.title,
          scrollTrigger: { trigger: inner, start: 'top 80%', once: true },
        });
      }
      const rest = inner.querySelectorAll('.contact__desc, .contact__email, .contact__socials');
      if (rest.length) {
        gsap.from(rest, {
          y: 44, opacity: 0, duration: 1.3, stagger: 0.12, ease: EASE.reveal,
          scrollTrigger: { trigger: inner, start: 'top 78%', once: true },
        });
      }
    }
  }
}

/** 轻微视差：项目媒体内部的抽象视觉缓慢位移（transform only，scrub 平滑） */
function buildParallax() {
  gsap.utils.toArray<HTMLElement>('.project__media').forEach((media) => {
    const art = media.querySelector('.art') as HTMLElement | null;
    if (!art) return;
    gsap.fromTo(art,
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: media,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.1,
        },
      },
    );
  });
}

/**
 * 主 hook：在 App 根组件调用一次。
 */
export function useSiteAnimations() {
  useLayoutEffect(() => {
    // 尊重「减少动态效果」偏好：完全不设置初始隐藏，内容保持可见
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const root = document.documentElement;
    // 标记：CSS 借此关闭原生 CSS 进场动画，避免与 GSAP 双重播放
    root.classList.add('gsap-ready');

    const ctx = gsap.context(() => {
      buildOpening();
      buildScrollScenes();
      buildParallax();
    });

    // 字体加载会改变文字尺寸/布局高度，刷新触发点计算
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // 安全兜底：动画启动后 5 秒，只针对「已在视口内却仍近乎透明」的元素
    // 强制显示，防止极端情况下 ScrollTrigger 未触发造成空白；
    // 不影响视口外元素后续正常触发。
    const rescue = gsap.delayedCall(5, () => {
      document.querySelectorAll<HTMLElement>(
        '.reveal, [class*="__line"], .section-head__title, .about__heading',
      ).forEach((el) => {
        const r = el.getBoundingClientRect();
        const inView = r.top < window.innerHeight && r.bottom > 0;
        if (inView && parseFloat(getComputedStyle(el).opacity) < 0.08) {
          gsap.set(el, { clearProps: 'transform,clipPath,letterSpacing', opacity: 1 });
        }
      });
    });

    return () => {
      rescue.kill();
      ctx.revert();
      root.classList.remove('gsap-ready');
    };
  }, []);
}
