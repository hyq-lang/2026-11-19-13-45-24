/**
 * ============================================================
 *  项目进入 / 退出 转场引擎
 * ------------------------------------------------------------
 *  进入：卡片封面 → 详情主视觉（共享元素 project-hero 展开）
 *  退出：详情主视觉 → 卡片封面（共享元素 project-hero 回缩）
 *
 *  主方案：View Transitions API —— 浏览器原生共享元素转场，
 *          卡片封面与详情主视觉共用 view-transition-name，
 *          由浏览器完成「展开 / 回缩」，root 交叉淡入淡出负责
 *          列表背景与详情内容的渐隐渐现。
 *  降级：  FLIP + Web Animations API —— 克隆封面、测量首尾矩形、
 *          用 transform 做位移缩放，兼容不支持 VT 的浏览器。
 *  终极降级：prefers-reduced-motion / 目标卡片缺失 —— 直接切换，
 *          保证任何情况下都能进入 / 返回，不卡死。
 *
 *  设计约束：
 *  - 转场时长 350~600ms，内容淡出 200~300ms，缓动自然，无弹跳。
 *  - 只动 transform / opacity。
 *  - commit() 用 flushSync 同步提交，确保新快照拍到目标 DOM。
 * ============================================================
 */
import { flushSync } from 'react-dom';

const HERO_VIEW_NAME = 'project-hero';
const DURATION = 520;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

type Commit = () => void;
type Settle = () => void;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function canUseViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof (document as Document & { startViewTransition?: unknown }).startViewTransition ===
      'function'
  );
}

/**
 * 共享元素进入转场。
 * @param source   被点击卡片的封面元素（转场起点）
 * @param commit   同步提交「打开详情」状态的回调
 * @param onSettled 动画结束后的回调（用于锁定滚动 / 收尾）
 */
export function enterProject(
  source: HTMLElement | null,
  commit: Commit,
  onSettled?: Settle,
): void {
  const settle: Settle = () => onSettled?.();

  // 减少动效 / 无起点：直接切换，保证可用性与即时反馈
  if (!source || prefersReducedMotion()) {
    commit();
    settle();
    return;
  }

  // ---------- 主方案：View Transitions API ----------
  if (canUseViewTransitions()) {
    source.style.viewTransitionName = HERO_VIEW_NAME;
    const doc = document as Document & {
      startViewTransition: (cb: () => void) => { finished: Promise<void> };
    };
    try {
      const transition = doc.startViewTransition(() => {
        // 同步渲染详情页（其主视觉带同名 view-transition-name）
        flushSync(commit);
        // 关键：新快照拍摄前移除卡片上的名字，避免与详情主视觉重名冲突
        source.style.viewTransitionName = '';
      });
      transition.finished.then(settle, settle);
    } catch {
      // 极端情况下 API 抛错：清理并退化为直接切换
      source.style.viewTransitionName = '';
      commit();
      settle();
    }
    return;
  }

  // ---------- 降级：FLIP + Web Animations API ----------
  flipEnter(source, commit, settle);
}

function flipEnter(source: HTMLElement, commit: Commit, onSettled: Settle): void {
  const first = source.getBoundingClientRect();
  if (!first.width || !first.height) {
    commit();
    onSettled();
    return;
  }

  // 1) 克隆封面，固定在卡片的原始位置（First）
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('style');
  clone.className = 'flip-hero';
  clone.style.cssText = [
    'position:fixed',
    `left:${first.left}px`,
    `top:${first.top}px`,
    `width:${first.width}px`,
    `height:${first.height}px`,
    'margin:0',
    'z-index:400',
    'object-fit:cover',
    `border-radius:${getComputedStyle(source).borderRadius}`,
    'pointer-events:none',
    'transform-origin:top left',
    'will-change:transform',
  ].join(';');
  document.body.appendChild(clone);

  // 2) 暂停详情内容动画，同步切换到详情页
  document.documentElement.classList.add('flip-in-progress');
  flushSync(commit);

  const target = () => document.querySelector<HTMLElement>('[data-detail-hero]');

  // 双 rAF 确保详情 DOM 完成布局后再测目标矩形（Last）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = target();
      const last = el?.getBoundingClientRect();
      const finish = () => {
        clone.remove();
        if (el) el.style.opacity = '';
        document.documentElement.classList.remove('flip-in-progress');
        onSettled();
      };
      if (!el || !last || !last.width) {
        finish();
        return;
      }

      // 真实主视觉先隐藏，由克隆图完成飞行后接管
      el.style.opacity = '0';
      const dx = last.left - first.left;
      const dy = last.top - first.top;
      const sx = last.width / first.width;
      const sy = last.height / first.height;

      // 3) Invert + Play：只动 transform，飞向详情主视觉
      const anim = clone.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1,1)' },
          { transform: `translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})` },
        ],
        { duration: DURATION, easing: EASE, fill: 'forwards' },
      );
      anim.finished.then(finish, finish);
    });
  });
}

/* ============================================================
 *  退出转场：详情主视觉 → 原项目卡片
 * ============================================================ */

const EXIT_DURATION = 480; // 主视觉回缩 350~550ms
const CONTENT_FADE = 220;  // 详情内容淡出 200~300ms

/** 查询项目卡片封面（退出转场的归属目标），带兼容降级 */
function findSourceCard(projectId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLElement>(`[data-project-source="${projectId}"]`);
}

/**
 * 共享元素退出转场。
 * @param projectId  目标项目 id，用于定位要缩回的卡片封面
 * @param commit     同步提交「关闭详情 + 恢复主页滚动」的回调
 * @param onSettled  动画结束回调
 */
export function exitProject(
  projectId: string,
  commit: Commit,
  onSettled?: Settle,
): void {
  const settle: Settle = () => onSettled?.();
  const target = findSourceCard(projectId);

  // 减少动效 / 目标卡片不存在（被重新渲染或移除）：直接切换，保证一定能返回
  if (!target || prefersReducedMotion()) {
    commit();
    settle();
    return;
  }

  // ---------- 主方案：View Transitions API ----------
  if (canUseViewTransitions()) {
    const doc = document as Document & {
      startViewTransition: (cb: () => void) => { finished: Promise<void> };
    };
    try {
      const transition = doc.startViewTransition(() => {
        // 卸载详情 + 恢复滚动，全部在拍新快照前同步完成，
        // 这样新快照里的卡片正好位于「进入前」的位置。
        flushSync(commit);
        // 把共享元素名字交给目标卡片封面；旧快照拍的是详情主视觉（CSS 静态同名）。
        target.style.viewTransitionName = HERO_VIEW_NAME;
      });
      const cleanup = () => {
        target.style.viewTransitionName = '';
        settle();
      };
      transition.finished.then(cleanup, cleanup);
    } catch {
      // 极端情况 API 抛错：清理并直接切换
      target.style.viewTransitionName = '';
      commit();
      settle();
    }
    return;
  }

  // ---------- 降级：FLIP + Web Animations API ----------
  flipExit(target, commit, settle);
}

function flipExit(target: HTMLElement, commit: Commit, onSettled: Settle): void {
  // First = 详情主视觉当前位置
  const hero = document.querySelector<HTMLElement>('[data-detail-hero]');
  const first = hero?.getBoundingClientRect();
  const coverSrc = hero?.querySelector<HTMLImageElement>('img')?.getAttribute('src') ?? '';

  if (!first || !first.width || !first.height) {
    commit();
    onSettled();
    return;
  }

  // 克隆主视觉（用同一张封面图），固定在当前位置
  const clone = document.createElement('img');
  clone.src = coverSrc;
  clone.className = 'flip-hero';
  clone.style.cssText = [
    'position:fixed',
    `left:${first.left}px`,
    `top:${first.top}px`,
    `width:${first.width}px`,
    `height:${first.height}px`,
    'margin:0',
    'z-index:400',
    'object-fit:cover',
    `border-radius:${getComputedStyle(hero!).borderRadius}`,
    'pointer-events:none',
    'transform-origin:top left',
    'will-change:transform',
  ].join(';');
  document.body.appendChild(clone);

  // 详情内容先淡出（200~300ms），再提交关闭；主视觉不淡出，交给克隆飞行。
  document.querySelector<HTMLElement>('.detail')?.classList.add('detail--exiting');

  const afterFade = () => {
    flushSync(commit);
    // 隐藏真实卡片封面，避免与飞行克隆重叠穿帮
    target.style.opacity = '0';

    // 双 rAF 等首页布局稳定（滚动已恢复）后再测卡片位置（Last）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const last = target.getBoundingClientRect();
        const finish = () => {
          clone.remove();
          target.style.opacity = '';
          onSettled();
        };
        if (!last.width || !last.height) {
          finish();
          return;
        }
        const dx = last.left - first.left;
        const dy = last.top - first.top;
        const sx = last.width / first.width;
        const sy = last.height / first.height;
        const anim = clone.animate(
          [
            { transform: 'translate3d(0,0,0) scale(1,1)' },
            { transform: `translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})` },
          ],
          { duration: EXIT_DURATION, easing: EASE, fill: 'forwards' },
        );
        anim.finished.then(finish, finish);
      });
    });
  };

  // 内容淡出与克隆飞行有轻微重叠，整体自然紧凑
  window.setTimeout(afterFade, CONTENT_FADE);
}
