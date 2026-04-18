import { useEffect, useRef } from "react";

type Options = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  speedPps: number;
  playing: boolean;
  onUserInterrupt: () => void;
};

/**
 * 匀速自动滚动。程序写入 scrollTop 后短暂忽略 scroll 事件，区分手动滚动。
 * 市面常见包如 react-scroll 偏「锚点跳转」，提词器更适合本机 rAF 连续滚动。
 */
export function useAutoScroll({
  scrollRef,
  speedPps,
  playing,
  onUserInterrupt,
}: Options): void {
  const ignoreScrollUntil = useRef(0);
  const lastTs = useRef<number | null>(null);
  const rafId = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (performance.now() < ignoreScrollUntil.current) return;
      if (playing) onUserInterrupt();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef, playing, onUserInterrupt]);

  useEffect(() => {
    if (!playing) {
      lastTs.current = null;
      cancelAnimationFrame(rafId.current);
      return;
    }

    const el = scrollRef.current;
    if (!el) return;

    const tick = (ts: number) => {
      if (!playing) return;
      if (lastTs.current === null) lastTs.current = ts;
      const dt = Math.min(0.05, (ts - lastTs.current) / 1000);
      lastTs.current = ts;

      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) {
        ignoreScrollUntil.current = performance.now() + 32;
        rafId.current = requestAnimationFrame(tick);
        return;
      }

      const next = Math.min(el.scrollTop + speedPps * dt, max);
      ignoreScrollUntil.current = performance.now() + 32;
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
