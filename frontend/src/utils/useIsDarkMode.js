import { useEffect, useState } from "react";

/**
 * Tracks the system dark-mode preference for cases (like SVG fill/stroke attributes) that can't
 * be styled with Tailwind's `dark:` variant, which only applies to CSS classes.
 */
export function useIsDarkMode() {
  const query = "(prefers-color-scheme: dark)";
  const [isDark, setIsDark] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setIsDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDark;
}
