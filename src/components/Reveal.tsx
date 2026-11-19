import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/* ------------------------------------------------------------------
 * 共享显现调度器：所有 <Reveal> 共用一个 scroll/resize/load 监听，
 * 并用 requestAnimationFrame 节流。避免每个实例各自注册监听、
 * 各自调用 getBoundingClientRect 造成滚动时大量强制布局。
 * ------------------------------------------------------------------ */
const registry = new Set<HTMLDivElement>();
let scheduled = false;
let listening = false;

function checkAll() {
  scheduled = false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  registry.forEach((el) => {
    if (el.classList.contains('is-visible')) {
      registry.delete(el);
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < vh - 40 && rect.bottom > 0) {
      el.classList.add('is-visible');
      registry.delete(el);
    }
  });
  if (registry.size === 0) stopListening();
}

function onScroll() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(checkAll);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', checkAll);
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  window.removeEventListener('load', checkAll);
}

/** 进入视口后触发显现动画的包裹组件 */
export default function Reveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (delay) el.style.animationDelay = `${delay}ms`;

    registry.add(el);
    startListening();
    checkAll(); // 立即检测已在首屏内的元素

    return () => {
      registry.delete(el);
      if (registry.size === 0) stopListening();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
