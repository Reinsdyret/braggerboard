import { useMemo, useState } from "react";
import { EyeOff } from "lucide-react";

const HIDDEN_KEY = "halloween-sky-hidden";

// Storage can throw (private mode, blocked site data); the animation then just defaults to on.
function loadHidden() {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "true";
  } catch {
    return false;
  }
}

function saveHidden(hidden) {
  try {
    localStorage.setItem(HIDDEN_KEY, String(hidden));
  } catch {
    // Not remembered across reloads, but the toggle still works for this visit.
  }
}

const PUMPKIN_COUNT = 14;

const WITCHES = [
  { top: "12%", duration: 16, delay: 0, direction: "right", size: 120 },
  { top: "38%", duration: 24, delay: 9, direction: "left", size: 90 },
  { top: "68%", duration: 20, delay: 17, direction: "right", size: 70 },
];

// Silhouette of a witch on a broom, flying towards +x (bristles trail behind on the left).
function Witch({ size }) {
  return (
    <svg width={size} height={size * (70 / 120)} viewBox="0 0 120 70" className="halloween-witch-figure">
      <line x1="22" y1="52" x2="116" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M0 46 L24 49 L24 56 L3 62 Z" fill="currentColor" />
      <path d="M64 30 Q40 34 28 50 L48 50 Z" fill="currentColor" />
      <path d="M44 52 L76 50 L66 28 Q54 30 44 52 Z" fill="currentColor" />
      <line x1="64" y1="49" x2="80" y2="56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="67" y1="33" x2="84" y2="47" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="67" cy="24" r="5.5" fill="currentColor" />
      <ellipse cx="67" cy="20" rx="11" ry="2.2" fill="currentColor" />
      <path d="M60 20 L74 20 L57 1 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Pumpkins raining down and witches flying across, drawn over the page for the Halloween theme.
 * Purely decorative: it ignores the pointer so nothing underneath becomes unclickable, sits below
 * dialogs and toasts, and is hidden entirely for people who prefer reduced motion (halloween.css).
 * Anyone else can switch it off with the corner button, remembered per browser.
 */
export default function HalloweenSky() {
  const [hidden, setHidden] = useState(loadHidden);

  function toggle() {
    const next = !hidden;
    setHidden(next);
    saveHidden(next);
  }

  // Randomized once per mount; negative delays start each pumpkin mid-fall so the screen isn't
  // empty for the first few seconds.
  const pumpkins = useMemo(
    () =>
      Array.from({ length: PUMPKIN_COUNT }, (_, i) => {
        const duration = 9 + Math.random() * 9;
        return {
          id: i,
          // Kept short of the right edge, where a pumpkin would be clipped out of view.
          left: `${Math.random() * 96}%`,
          size: 16 + Math.random() * 18,
          duration,
          delay: -Math.random() * duration,
          swayDuration: 2 + Math.random() * 2,
        };
      }),
    [],
  );

  const toggleButton = (
    <button
      type="button"
      onClick={toggle}
      aria-label={hidden ? "Show Halloween animation" : "Hide Halloween animation"}
      title={hidden ? "Show Halloween animation" : "Hide Halloween animation"}
      className="fixed right-4 bottom-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-border-subtle bg-neutral-surface-default text-neutral-text-subtle shadow-lg transition-colors hover:bg-neutral-surface-hover hover:text-neutral-text-default"
    >
      {hidden ? <span aria-hidden="true">🎃</span> : <EyeOff size={18} />}
    </button>
  );

  if (hidden) return toggleButton;

  return (
    <>
      {toggleButton}
      <div aria-hidden="true" className="halloween-sky">
        {pumpkins.map((p) => (
          <span
            key={p.id}
            className="halloween-pumpkin"
            style={{
              left: p.left,
              fontSize: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <span className="halloween-pumpkin-sway" style={{ animationDuration: `${p.swayDuration}s` }}>
              🎃
            </span>
          </span>
        ))}

        {WITCHES.map((w, i) => (
          <div
            key={i}
            className={`halloween-witch halloween-witch-${w.direction}`}
            style={{
              top: w.top,
              animationDuration: `${w.duration}s`,
              animationDelay: `${w.delay}s`,
            }}
          >
            <div className="halloween-witch-bob">
              <Witch size={w.size} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
