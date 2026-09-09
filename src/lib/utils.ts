import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function smoothScrollTo(target: string | number) {
  const lenis = (typeof window !== 'undefined' && (window as any).__lenis);
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(target, { duration: 1.4 });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

