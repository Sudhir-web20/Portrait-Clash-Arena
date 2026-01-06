import { useState, TouchEvent } from 'react';

export interface SwipeState {
  deltaX: number;
  isSwiping: boolean;
}

export const useSwipe = (onLeft: () => void, onRight: () => void) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeState, setSwipeState] = useState<SwipeState>({ deltaX: 0, isSwiping: false });

  const handleStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeState({ deltaX: 0, isSwiping: true });
  };

  const handleMove = (e: TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    setSwipeState({ deltaX: touchStart - currentX, isSwiping: true });
  };

  const handleEnd = (e: TouchEvent) => {
    if (!touchStart) return;
    const distance = touchStart - e.changedTouches[0].clientX;
    
    // Threshold for a successful swipe
    if (distance > 120) {
      onLeft();
    } else if (distance < -120) {
      onRight();
    }
    
    setTouchStart(null);
    setSwipeState({ deltaX: 0, isSwiping: false });
  };

  return { 
    onTouchStart: handleStart, 
    onTouchMove: handleMove, 
    onTouchEnd: handleEnd,
    swipeState
  };
};
