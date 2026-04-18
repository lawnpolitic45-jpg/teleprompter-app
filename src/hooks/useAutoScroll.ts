import { useEffect, useLayoutEffect, useRef } from "react";

type Options = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  speedPps: number;
  playing: boolean;
  onUserInterrupt: () => void;
};

/**
 * 匀速自动滚动。通过追踪虚拟 scrollTop 与 DOM scrollTop 的偏差，
 * 能够完美过滤由于修改状态 (如播放按钮或速度) 引发 React 延迟导致的原生滚动误判。
 */
export function useAutoScroll({
  scrollRef,
  speedPps,
  playing,
  onUserInterrupt,
}: Options): void {
  const expectedScrollTop = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const rafId = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (!playing) return;
      if (expectedScrollTop.current === null) return;
      
      const diff = Math.abs(el.scrollTop - expectedScrollTop.current);
      // Give 15px tolerance. A manual scroll (wheel, drag, touch) easily exceeds this.
      // This absorbs browser subpixel rounding, layout resizing delays, and boundary clamping inaccuracies.
      if (diff > 15) {
        onUserInterrupt();
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef, playing, onUserInterrupt]);

  useLayoutEffect(() => {
    if (!playing) {
      lastTs.current = null;
      expectedScrollTop.current = null;
      cancelAnimationFrame(rafId.current);
      return;
    }

    const el = scrollRef.current;
    if (!el) return;

    const tick = (ts: number) => {
      if (!playing) return;
      if (lastTs.current === null) {
        lastTs.current = ts;
        expectedScrollTop.current = el.scrollTop;
      }
      const dt = Math.min(0.05, (ts - lastTs.current) / 1000);
      lastTs.current = ts;

      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }

      let currentVirtualTop = expectedScrollTop.current!;
      let next = currentVirtualTop + speedPps * dt;
      next = Math.min(next, max);
      
      expectedScrollTop.current = next;
      el.scrollTop = next;
      
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId.current);
      lastTs.current = null;
    };
  }, [playing, speedPps, scrollRef]);
}
