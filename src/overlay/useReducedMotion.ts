import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// Tracks the Windows "Animation effects" setting, which WebView2 exposes as prefers-reduced-motion.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
