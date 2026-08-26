import { useIsDarkMode } from "../utils/useIsDarkMode.js";

const WIDTH = 300;
const HEIGHT = 90;
const PAD_Y = 10;

const COLORS = {
  light: { line: "#6d4fe0", up: "#16a34a", down: "#dc2626" },
  dark: { line: "#a78bfa", up: "#4ade80", down: "#f87171" },
};

export default function RatingHistoryChart({ history, startingRating = 1000 }) {
  const isDark = useIsDarkMode();
  const { line: lineColor, up: upColor, down: downColor } = isDark ? COLORS.dark : COLORS.light;

  if (history.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Play a match to start tracking rating history.
      </p>
    );
  }

  const points = [{ rating: startingRating }, ...history];
  const ratings = points.map((p) => p.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * WIDTH;
    const y = PAD_Y + (1 - (p.rating - min) / range) * (HEIGHT - PAD_Y * 2);
    return [x, y];
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
  const [lastX, lastY] = coords[coords.length - 1];
  const finalRating = history[history.length - 1].rating;
  const trendColor = finalRating >= startingRating ? upColor : downColor;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-20 w-full"
        role="img"
        aria-label={`Rating history from ${startingRating} to ${finalRating}, ranging between ${min} and ${max}`}
      >
        <defs>
          <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#ratingFill)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={lastX} cy={lastY} r="3.5" fill={trendColor} />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Low {min}</span>
        <span>High {max}</span>
      </div>
    </div>
  );
}
