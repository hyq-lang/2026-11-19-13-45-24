/**
 * 作品图片灯箱
 * - 居中沉浸式展示，object-fit:contain 保持原始比例、不裁切
 * - 半透明遮罩 + 明显关闭按钮，点遮罩 / ESC 关闭
 * - 左右切换（按钮 / 键盘 / 移动端滑动）、缩放（按钮 / 双击 / 双指）、拖拽平移
 * - 所有图片直接引用原始 src，不重新生成、不降质
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { onImgError } from '../imgFallback';
import './Lightbox.css';

interface GalleryImage {
  src: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
  index: number;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function Lightbox({ images, index, title, onIndexChange, onClose }: Props) {
  const total = images.length;
  const image = images[index] ?? images[0];
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  // 拖拽平移状态
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  // 触摸手势状态（单指滑动 / 双指缩放）
  const touch = useRef<{
    mode: 'none' | 'swipe' | 'pinch';
    startX: number;
    startY: number;
    startDist: number;
    startScale: number;
    lastX: number;
  } | null>(null);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setLoaded(false);
  }, []);

  // 切换图片时重置缩放与位移
  useEffect(() => { resetView(); }, [index, resetView]);

  const setZoom = useCallback((next: number) => {
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    setScale(clamped);
    if (clamped === MIN_SCALE) setOffset({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (dir: number) => {
      if (total < 2) return;
      onIndexChange((index + dir + total) % total);
    },
    [index, total, onIndexChange],
  );

  // 键盘：ESC 关闭 / 左右切换 / +-缩放 / 0 复位
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(scale + 0.5);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(scale - 0.5);
      } else if (e.key === '0') {
        e.preventDefault();
        resetView();
      }
    };
    // 捕获阶段优先于详情页的 Esc 关闭监听
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose, go, setZoom, scale, resetView]);

  // 灯箱打开时锁定底层滚动（详情页本身已锁，这里额外兜底）
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= MIN_SCALE) return;
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset({
      x: drag.current.ox + (e.clientX - drag.current.px),
      y: drag.current.oy + (e.clientY - drag.current.py),
    });
  };
  const onPointerUp = () => { drag.current = null; };

  const dist = (t: React.TouchList) => {
    const a = t[0];
    const b = t[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touch.current = {
        mode: 'pinch',
        startX: 0,
        startY: 0,
        startDist: dist(e.touches),
        startScale: scale,
        lastX: 0,
      };
    } else if (e.touches.length === 1) {
      touch.current = {
        mode: 'swipe',
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startDist: 0,
        startScale: scale,
        lastX: e.touches[0].clientX,
      };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = touch.current;
    if (!t) return;
    if (t.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      setZoom((t.startDist ? (dist(e.touches) / t.startDist) * t.startScale : t.startScale));
    } else if (t.mode === 'swipe' && e.touches.length === 1) {
      t.lastX = e.touches[0].clientX;
    }
  };
  const onTouchEnd = () => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    if (t.mode === 'swipe' && scale <= MIN_SCALE) {
      const dx = t.lastX - t.startX;
      if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
    }
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} 图片预览`}>
      <div className="lightbox__bar">
        <div className="lightbox__info">
          <span className="lightbox__title">{title}</span>
          <span className="lightbox__counter">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
        <div className="lightbox__tools">
          <button type="button" className="lightbox__tool" onClick={() => setZoom(scale - 0.5)} disabled={scale <= MIN_SCALE} aria-label="缩小">−</button>
          <span className="lightbox__scale">{Math.round(scale * 100)}%</span>
          <button type="button" className="lightbox__tool" onClick={() => setZoom(scale + 0.5)} disabled={scale >= MAX_SCALE} aria-label="放大">+</button>
          <button type="button" className="lightbox__tool lightbox__tool--reset" onClick={resetView} aria-label="复位">复位</button>
          <button type="button" className="lightbox__close" onClick={onClose} aria-label="关闭图片预览">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>
      </div>

      <div className="lightbox__stage" onClick={onBackdrop}>
        {total > 1 ? (
          <button type="button" className="lightbox__arrow lightbox__arrow--prev" onClick={() => go(-1)} aria-label="上一张">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        ) : null}

        <div
          className={`lightbox__frame${scale > MIN_SCALE ? ' is-zoomed' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setZoom(scale > MIN_SCALE ? MIN_SCALE : 2);
          }}
        >
          <img
            key={image.src}
            className={`lightbox__image${loaded ? ' is-loaded' : ''}`}
            src={image.src}
            alt={image.alt}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={onImgError}
            style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}
          />
        </div>

        {total > 1 ? (
          <button type="button" className="lightbox__arrow lightbox__arrow--next" onClick={() => go(1)} aria-label="下一张">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : null}
      </div>

      <div className="lightbox__hint">点击图片放大 · 拖动平移 · ← → 切换 · ESC 关闭</div>
    </div>
  );
}
