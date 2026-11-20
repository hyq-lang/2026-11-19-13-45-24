/**
 * 回到页面顶部（Logo / BACK TO TOP 共用）。
 * - 尊重 prefers-reduced-motion：减少动效时瞬时到顶。
 * - 正常环境平滑滚动；带超时兜底：某些渲染环境（后台标签页 / 无头浏览器 /
 *   低性能设备）smooth 依赖的帧不推进，滚动会停在半途，此时强制瞬时归零，
 *   保证「返回顶部」始终可靠到达，而不是卡在中间。
 * - 使用 scrollTo 而非 hash 跳转，不往历史栈写入 #top，前进后退更干净。
 */
export function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.setTimeout(() => {
    if (window.scrollY > 2) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, 950);
}
