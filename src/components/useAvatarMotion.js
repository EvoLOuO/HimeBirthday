import { useEffect, useRef } from 'react';
import { characterMotion as motion } from '../data/characterImages.js';

export default function useAvatarMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    const stage = node?.closest('.live');
    if (!stage || !motion.enabled || !motion.followPointer || !window.matchMedia) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    let frame = 0;
    let target = { x: 0, y: 0 };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      node.style.setProperty('--look-x', '0px');
      node.style.setProperty('--look-y', '0px');
      node.style.setProperty('--look-tilt', '0deg');
    };
    const move = event => {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const box = stage.getBoundingClientRect();
      target = { x: Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1)), y: Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1)) };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        node.style.setProperty('--look-x', `${target.x * motion.pointerTravelPx}px`);
        node.style.setProperty('--look-y', `${target.y * motion.pointerTravelPx * .5}px`);
        node.style.setProperty('--look-tilt', `${target.x * motion.pointerTiltDeg}deg`);
      });
    };
    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerleave', reset);
    reduced.addEventListener('change', reset);
    finePointer.addEventListener('change', reset);
    return () => {
      reset();
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', reset);
      reduced.removeEventListener('change', reset);
      finePointer.removeEventListener('change', reset);
    };
  }, []);
  return ref;
}
