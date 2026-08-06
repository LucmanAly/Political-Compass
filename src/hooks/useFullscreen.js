import { useCallback, useEffect, useState } from 'react';

export function useFullscreen(elementRef) {
  const [active, setActive] = useState(false);

  const enter = useCallback(async () => {
    setActive(true);
    const node = elementRef?.current || document.documentElement;
    if (node.requestFullscreen && !document.fullscreenElement) {
      try {
        await node.requestFullscreen();
      } catch {
        // CSS full-view fallback (iOS Safari, restricted embeds).
      }
    }
  }, [elementRef]);

  const exit = useCallback(async () => {
    setActive(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        // CSS mode still clears.
      }
    }
  }, []);

  const toggle = useCallback(async () => {
    if (active) await exit();
    else await enter();
  }, [active, enter, exit]);

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) setActive(false);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return { active, enter, exit, toggle };
}
