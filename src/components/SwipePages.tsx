import { useRef, type ReactNode, type TouchEvent } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { swipeDestination } from "@/lib/navigation";

export function SwipePages({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const start = useRef<{ x: number; y: number; time: number } | null>(null);

  function onStart(event: TouchEvent<HTMLDivElement>) {
    start.current = null;
    const target = event.target;
    if (event.touches.length !== 1 || !(target instanceof Element)) return;
    if (target.closest("input, textarea, select, button, a, [role='slider'], [contenteditable='true']")) return;
    for (let element: Element | null = target; element && element !== event.currentTarget; element = element.parentElement) {
      if (element.scrollWidth > element.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(element).overflowX)) return;
    }
    const touch = event.touches[0];
    if (touch) start.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }

  function onEnd(event: TouchEvent<HTMLDivElement>) {
    const origin = start.current;
    start.current = null;
    const touch = event.changedTouches[0];
    if (!origin || !touch) return;
    const to = swipeDestination(pathname, touch.clientX - origin.x, touch.clientY - origin.y, Date.now() - origin.time);
    if (to) void navigate({ to });
  }

  return <div onTouchStart={onStart} onTouchMove={(event) => { if (event.touches.length !== 1) start.current = null; }} onTouchEnd={onEnd} onTouchCancel={() => { start.current = null; }}>
    <div key={pathname} className="page-transition">{children}</div>
  </div>;
}