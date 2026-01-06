import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts: { key: string; action: () => void }[]) => {
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      const match = shortcuts.find(s => s.key === e.key);
      if (match) {
        match.action();
      }
    };
    window.addEventListener('keydown', handleDown);
    return () => window.removeEventListener('keydown', handleDown);
  }, [shortcuts]);
};
