import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './DepthCarousel.css';

export type DepthCarouselItem = {
  image: string;
  alt: string;
  width: number;
  height: number;
  projectId: string;
  imageIndex: number;
  imageCount: number;
};

type DepthCarouselProps = {
  items: DepthCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: DepthCarouselItem) => void;
  onItemClick?: (item: DepthCarouselItem) => void;
  className?: string;
};

type DragState = {
  x: number;
  startPos: number;
  lastX: number;
  lastT: number;
  velocity: number;
  moved: boolean;
  pointerId: number;
};

type CarouselConfig = {
  count: number;
  depth: number;
  spread: number;
  tilt: number;
  tiltDirection: 'left' | 'right';
  visibleCards: number;
  falloff: number;
  blur: number;
  duration: number;
  ease: string;
  loop: boolean;
  cardWidth: number;
  autoplayDelay: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function DepthCarousel({
  items,
  cardWidth = 360,
  cardHeight = 480,
  radius = 16,
  tint = '#161514',
  depth = 190,
  spread = 82,
  tilt = 18,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 3,
  falloff = 0.18,
  blur = 4,
  duration = 700,
  ease = 'power3.out',
  autoplay = false,
  autoplayDelay = 3600,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  onItemClick,
  className = '',
}: DepthCarouselProps) {
  const data = useMemo(() => items, [items]);
  const count = data.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const overlayRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const positionRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scaleRef = useRef(1);
  const configRef = useRef<CarouselConfig>({} as CarouselConfig);
  const onChangeRef = useRef(onChange);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const autoplayRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const [active, setActive] = useState(0);

  onChangeRef.current = onChange;
  configRef.current = {
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay,
  };

  const layout = useCallback((position: number) => {
    const config = configRef.current;
    if (!config.count) return;
    const direction = config.tiltDirection === 'left' ? -1 : 1;

    for (let index = 0; index < config.count; index += 1) {
      const card = cardRefs.current[index];
      if (!card) continue;

      let distance = index - position;
      if (config.loop && config.count > 1) {
        distance = ((distance % config.count) + config.count) % config.count;
        if (distance > config.count / 2) distance -= config.count;
      }

      const behind = Math.max(0, distance);
      const absoluteDistance = Math.abs(distance);
      const isVisible = absoluteDistance <= config.visibleCards + 0.5;
      const translateZ = -config.depth * distance;
      const translateX = direction * config.spread * distance;
      const rotateY = direction * config.tilt * clamp(distance, 0, 1);
      let opacity = distance < 0 ? Math.max(0, 1 + distance) : 1;
      if (!isVisible) opacity = 0;
      const brightness = Math.max(0.2, 1 - behind * config.falloff);
      const blurPixels = config.blur > 0
        ? Math.min(config.blur, (behind / Math.max(1, config.visibleCards)) * config.blur)
        : 0;

      card.style.transform = `translate(-50%, -50%) scale(${scaleRef.current}) translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(3)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPixels.toFixed(2)}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = isVisible && opacity > 0.05 ? 'auto' : 'none';

      const overlay = overlayRefs.current[index];
      if (overlay) overlay.style.opacity = clamp(behind * config.falloff * 1.25, 0, 0.72).toFixed(3);
    }
  }, []);

  const notify = useCallback((index: number) => {
    setActive(index);
    onChangeRef.current?.(index, data[index]);
  }, [data]);

  const tweenTo = useCallback((target: number, animate: boolean) => {
    tweenRef.current?.kill();
    const config = configRef.current;
    const proxy = { position: positionRef.current };
    tweenRef.current = gsap.to(proxy, {
      position: target,
      duration: animate && !reducedMotionRef.current ? config.duration / 1000 : 0,
      ease: config.ease,
      onUpdate: () => {
        positionRef.current = proxy.position;
        layout(proxy.position);
      },
      onComplete: () => {
        if (config.count > 0) {
          positionRef.current = ((positionRef.current % config.count) + config.count) % config.count;
        }
        layout(positionRef.current);
      },
    });
  }, [layout]);

  const setFocus = useCallback((rawIndex: number, animate = true) => {
    const config = configRef.current;
    if (!config.count) return;
    const index = config.loop
      ? ((rawIndex % config.count) + config.count) % config.count
      : clamp(rawIndex, 0, config.count - 1);
    let delta = index - positionRef.current;
    if (config.loop && config.count > 1) {
      delta = ((delta % config.count) + config.count) % config.count;
      if (delta > config.count / 2) delta -= config.count;
    }
    tweenTo(positionRef.current + delta, animate);
    if (index !== focusRef.current) {
      focusRef.current = index;
      notify(index);
    }
  }, [notify, tweenTo]);

  const navigateBy = useCallback((step: number) => {
    setFocus(focusRef.current + step, true);
  }, [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const neededWidth = cardWidth + Math.abs(spread) * 1.5 + 48;
      const availableHeight = Math.max(1, entries[0].contentRect.height - 120);
      scaleRef.current = Math.min(width / neededWidth, availableHeight / cardHeight, 1);
      layout(positionRef.current);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [cardWidth, cardHeight, layout, spread]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClickRef.current = false;
    if (!(event.target as HTMLElement).closest('.depth-carousel__card')) return;
    if (configRef.current.count < 2) return;
    tweenRef.current?.kill();
    dragRef.current = {
      x: event.clientX,
      startPos: positionRef.current,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
      pointerId: event.pointerId,
    };
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const stepWidth = Math.max(configRef.current.cardWidth * 0.55 * scaleRef.current, 40);
    const deltaX = event.clientX - drag.x;
    if (!drag.moved && Math.abs(deltaX) > 4) {
      drag.moved = true;
      suppressClickRef.current = true;
      rootRef.current?.setPointerCapture(drag.pointerId);
    }
    if (!drag.moved) return;
    const now = performance.now();
    const deltaTime = Math.max(now - drag.lastT, 1);
    drag.velocity = (event.clientX - drag.lastX) / deltaTime;
    drag.lastX = event.clientX;
    drag.lastT = now;
    positionRef.current = drag.startPos - deltaX / stepWidth;
    layout(positionRef.current);
  }, [layout]);

  const handlePointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const stepWidth = Math.max(configRef.current.cardWidth * 0.55 * scaleRef.current, 40);
    const projectedPosition = positionRef.current - (drag.velocity * 180) / stepWidth;
    setFocus(Math.round(projectedPosition), true);
  }, [setFocus]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      navigateBy(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      navigateBy(1);
    }
  }, [navigateBy]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedMotionRef.current || count < 2) return;
    const root = rootRef.current;
    let paused = false;
    const stop = () => {
      if (autoplayRef.current !== null) window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    };
    const start = () => {
      stop();
      autoplayRef.current = window.setInterval(() => {
        if (!paused) navigateBy(1);
      }, Math.max(autoplayDelay, 600));
    };
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    root?.addEventListener('mouseenter', pause);
    root?.addEventListener('mouseleave', resume);
    root?.addEventListener('focusin', pause);
    root?.addEventListener('focusout', resume);
    start();
    return () => {
      stop();
      root?.removeEventListener('mouseenter', pause);
      root?.removeEventListener('mouseleave', resume);
      root?.removeEventListener('focusin', pause);
      root?.removeEventListener('focusout', resume);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(positionRef.current);
  }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count]);

  useEffect(() => () => {
    tweenRef.current?.kill();
    if (autoplayRef.current !== null) window.clearInterval(autoplayRef.current);
  }, []);

  const carouselStyle = { '--dc-perspective': `${perspective}px` } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`depth-carousel${className ? ` ${className}` : ''}`}
      style={carouselStyle}
      role="group"
      aria-roledescription="carousel"
      aria-label="Selected project artwork"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      <div className="depth-carousel__stage">
        {data.map((item, index) => (
          <div
            key={`${item.projectId}-${item.imageIndex}`}
            className="depth-carousel__card"
            ref={(element) => { cardRefs.current[index] = element; }}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            aria-hidden={active !== index}
            onClick={(event) => {
              if (suppressClickRef.current && event.detail !== 0) return;
              rootRef.current?.focus({ preventScroll: true });
              setFocus(index, true);
              onItemClick?.(item);
            }}
          >
            <img
              className="depth-carousel__img"
              src={item.image}
              alt={item.alt}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            {onItemClick && (
              <button
                type="button"
                className="depth-carousel__open"
                aria-label={`Open artwork: ${item.alt}`}
                aria-haspopup="dialog"
                tabIndex={active === index ? 0 : -1}
              />
            )}
            <span
              className="depth-carousel__tint"
              ref={(element) => { overlayRefs.current[index] = element; }}
              style={{ background: tint }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <div className="depth-carousel__toolbar">
      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Previous artwork"
            onClick={() => navigateBy(-1)}
          >
            <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Next artwork"
            onClick={() => navigateBy(1)}
          >
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="group" aria-label="Artwork slides">
          {data.map((item, index) => (
            <button
              key={`${item.projectId}-${item.imageIndex}`}
              type="button"
              aria-pressed={active === index}
              aria-label={`Go to artwork ${index + 1}`}
              className={`depth-carousel__dot${active === index ? ' is-active' : ''}`}
              onClick={() => setFocus(index, true)}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
