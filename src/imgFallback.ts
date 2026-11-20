import type { SyntheticEvent } from 'react';

/**
 * 图片加载失败降级占位。
 * - 使用内联 SVG data URI，与原站暗色 / 紫色体系一致，无外部依赖。
 * - 只替换失败图片的 src，不触碰磁盘上的任何原始作品图。
 * - data-fallback 标记防止占位图自身再次报错导致无限循环。
 */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12141c"/>
      <stop offset="1" stop-color="#0b0c11"/>
    </linearGradient>
    <linearGradient id="ln" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9b7cff"/>
      <stop offset="1" stop-color="#c9a7ff"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <g transform="translate(400 214)" fill="none" stroke="url(#ln)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
    <rect x="-46" y="-42" width="92" height="80" rx="10"/>
    <circle cx="-20" cy="-18" r="7"/>
    <path d="M-46 26 L-14 -6 L6 14 L20 0 L46 26"/>
  </g>
  <text x="400" y="322" text-anchor="middle" font-family="system-ui, sans-serif" font-size="17" fill="#a6a9b4" letter-spacing="2">图片暂时无法显示</text>
  <text x="400" y="350" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#6c6f7b" letter-spacing="3">IMAGE UNAVAILABLE</text>
</svg>`;

const FALLBACK_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FALLBACK_SVG)}`;

export function onImgError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.imgFallback === '1') return;
  img.dataset.imgFallback = '1';
  // 若处于 <picture> 内，先移除已失败的 <source>，否则浏览器仍会优先取 source 导致占位不生效
  const picture = img.parentElement;
  if (picture?.tagName === 'PICTURE') {
    picture.querySelectorAll('source').forEach((s) => s.remove());
  }
  img.classList.add('img--fallback');
  img.src = FALLBACK_SRC;
}
