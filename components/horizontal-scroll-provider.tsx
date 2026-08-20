"use client";

import { useEffect } from "react";

/**
 * Finds the nearest ancestor element (or target itself) that has horizontal overflow scroll.
 */
function findHorizontalScrollable(element: HTMLElement | null): HTMLElement | null {
  let curr = element;
  while (curr && curr !== document.body && curr !== document.documentElement) {
    const style = window.getComputedStyle(curr);
    const hasHorizontalOverflow =
      (style.overflowX === "auto" || style.overflowX === "scroll") &&
      curr.scrollWidth > curr.clientWidth;

    if (hasHorizontalOverflow) {
      return curr;
    }
    curr = curr.parentElement;
  }
  return null;
}

export function HorizontalScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Mouse Wheel to Horizontal Scroll Handler
    const handleWheel = (e: WheelEvent) => {
      // If user is already scrolling horizontally (Shift + wheel or trackpad deltaX), let native handle
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const scrollContainer = findHorizontalScrollable(target);

      if (!scrollContainer) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const maxScrollLeft = scrollWidth - clientWidth;

      // Check if container can scroll in the wheel direction
      const canScrollRight = e.deltaY > 0 && scrollLeft < maxScrollLeft - 1;
      const canScrollLeft = e.deltaY < 0 && scrollLeft > 1;

      if (canScrollRight || canScrollLeft) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    // 2. Drag-to-Scroll (Mouse Click & Drag) for desktop
    let isMouseDown = false;
    let startX = 0;
    let scrollStartLeft = 0;
    let activeContainer: HTMLElement | null = null;
    let hasMoved = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      const scrollContainer = findHorizontalScrollable(target);

      if (!scrollContainer) return;

      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      isMouseDown = true;
      hasMoved = false;
      activeContainer = scrollContainer;
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollStartLeft = scrollContainer.scrollLeft;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !activeContainer) return;

      const x = e.pageX - activeContainer.offsetLeft;
      const walk = (x - startX) * 1.5;

      if (Math.abs(walk) > 4) {
        hasMoved = true;
        activeContainer.classList.add("select-none");
        activeContainer.style.cursor = "grabbing";
        activeContainer.scrollLeft = scrollStartLeft - walk;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isMouseDown && activeContainer) {
        if (hasMoved) {
          const preventClick = (clickEvent: MouseEvent) => {
            clickEvent.stopPropagation();
            clickEvent.preventDefault();
          };
          window.addEventListener("click", preventClick, { capture: true, once: true });
          setTimeout(() => {
            window.removeEventListener("click", preventClick, { capture: true });
          }, 50);
        }

        activeContainer.classList.remove("select-none");
        activeContainer.style.removeProperty("cursor");
      }

      isMouseDown = false;
      activeContainer = null;
      hasMoved = false;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return <>{children}</>;
}
