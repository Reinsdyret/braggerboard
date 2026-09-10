import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { colorForIndex } from "../utils/chartPalette.js";
import { cx } from "../utils/cx.js";
import EmptyState from "./ui/EmptyState.jsx";

const HEIGHT = 280;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_END_LABELS = 6;
const LABEL_MIN_GAP = 14;

function useContainerWidth(ref, fallback) {
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect?.width;
      if (measured) setWidth(measured);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// A d3-style "nice ticks" pass so gridlines land on round numbers instead of raw data bounds.
function niceTicks(min, max, count) {
  if (min === max) return [min - 1, min, min + 1];
  const rawStep = (max - min) / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const step = residual > 5 ? 10 * magnitude : residual > 2 ? 5 * magnitude : residual > 1 ? 2 * magnitude : magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

function timeTicks(minTime, maxTime, count) {
  const step = (maxTime - minTime) / (count - 1);
  return Array.from({ length: count }, (_, i) => minTime + step * i);
}

function formatAxisDate(time, spanMultiYear) {
  return new Date(time).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: spanMultiYear ? "numeric" : undefined,
  });
}

function formatTooltipDate(time) {
  return new Date(time).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Nudges overlapping end-labels apart vertically without moving the dots they belong to.
function layoutEndLabels(entries) {
  const sorted = [...entries].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y - sorted[i - 1].y < LABEL_MIN_GAP) {
      sorted[i].y = sorted[i - 1].y + LABEL_MIN_GAP;
    }
  }
  return sorted;
}

const CHROME = { grid: "#f5f5f5", axis: "#a3a3a3", ring: "#ffffff", crosshair: "#d4d4d4" };

export default function ContestantsChart({ title, valueLabel, timelines, emptyMessage }) {
  const containerRef = useRef(null);
  const width = useContainerWidth(containerRef, 640);
  const [hidden, setHidden] = useState(() => new Set());
  const [hoverX, setHoverX] = useState(null);

  // Color is keyed to join order, not the current standings rank - so a contestant keeps
  // their color as ranks shuffle around them instead of colors reshuffling with the table.
  const active = timelines.filter((t) => t.points.length > 0);
  const colorById = new Map(
    [...active]
      .sort((a, b) => new Date(a.participant.createdAt) - new Date(b.participant.createdAt))
      .map((t, i) => [t.participant.id, colorForIndex(i)]),
  );
  const series = active.map((t) => ({ ...t, color: colorById.get(t.participant.id) }));

  function toggle(id) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (series.length === 0) {
    return <EmptyState icon={TrendingUp} title="Nothing to chart yet" description={emptyMessage} />;
  }

  const allPoints = series.flatMap((t) => t.points.map((p) => ({ ...p, time: new Date(p.date).getTime() })));
  let minTime = Math.min(...allPoints.map((p) => p.time));
  let maxTime = Math.max(...allPoints.map((p) => p.time));
  if (minTime === maxTime) {
    minTime -= DAY_MS;
    maxTime += DAY_MS;
  }
  const spanMultiYear = new Date(minTime).getFullYear() !== new Date(maxTime).getFullYear();

  const values = allPoints.map((p) => p.value);
  const yTicks = niceTicks(Math.min(...values), Math.max(...values), 4);
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  const visible = series.filter((t) => !hidden.has(t.participant.id));
  const showEndLabels = visible.length > 0 && visible.length <= MAX_END_LABELS;

  const margin = { top: 14, right: showEndLabels ? 100 : 18, bottom: 26, left: 44 };
  const plotWidth = Math.max(width - margin.left - margin.right, 10);
  const plotHeight = HEIGHT - margin.top - margin.bottom;

  const xScale = (time) => margin.left + ((time - minTime) / (maxTime - minTime)) * plotWidth;
  const yScale = (value) => margin.top + (1 - (value - yMin) / (yMax - yMin || 1)) * plotHeight;

  const xTicks = timeTicks(minTime, maxTime, plotWidth < 420 ? 3 : 5);
  const xPositions = [...new Set(allPoints.map((p) => Math.round(xScale(p.time))))].sort((a, b) => a - b);

  const endLabels = showEndLabels
    ? layoutEndLabels(
        visible.map((t) => {
          const last = t.points[t.points.length - 1];
          return { id: t.participant.id, name: t.participant.name, color: t.color, y: yScale(last.value) };
        }),
      )
    : [];

  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left + margin.left;
    const nearest = xPositions.reduce(
      (best, x) => (Math.abs(x - localX) < Math.abs(best - localX) ? x : best),
      xPositions[0],
    );
    setHoverX(nearest);
  }

  const hoverTime = hoverX == null ? null : minTime + ((hoverX - margin.left) / plotWidth) * (maxTime - minTime);
  const hoverRows =
    hoverTime == null
      ? []
      : visible
          .map((t) => {
            const atOrBefore = [...t.points].reverse().find((p) => new Date(p.date).getTime() <= hoverTime + 1000);
            return atOrBefore ? { id: t.participant.id, name: t.participant.name, color: t.color, value: atOrBefore.value } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b.value - a.value);

  const tooltipLeft = hoverX == null ? 0 : Math.min(Math.max(hoverX, 90), width - 90);

  return (
    <div>
      {title && (
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-600 uppercase">
          {title}
        </h2>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        {series.map((t) => {
          const isHidden = hidden.has(t.participant.id);
          return (
            <button
              key={t.participant.id}
              type="button"
              onClick={() => toggle(t.participant.id)}
              className={cx(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                isHidden
                  ? "border-gray-200 text-gray-400"
                  : "border-gray-200 text-gray-700",
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: isHidden ? "transparent" : t.color, border: `1.5px solid ${t.color}` }}
              />
              {t.participant.name}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="relative">
        <svg width={width} height={HEIGHT} role="img" aria-label={`${valueLabel} over time for each contestant`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={margin.left}
                x2={margin.left + plotWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke={CHROME.grid}
                strokeWidth="1"
              />
              <text x={margin.left - 8} y={yScale(tick)} dy="0.32em" textAnchor="end" fontSize="10" fill={CHROME.axis}>
                {Math.round(tick).toLocaleString()}
              </text>
            </g>
          ))}

          {xTicks.map((tick, i) => (
            <text
              key={i}
              x={xScale(tick)}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
              fontSize="10"
              fill={CHROME.axis}
            >
              {formatAxisDate(tick, spanMultiYear)}
            </text>
          ))}

          {hoverX != null && (
            <line x1={hoverX} x2={hoverX} y1={margin.top} y2={margin.top + plotHeight} stroke={CHROME.crosshair} strokeWidth="1" />
          )}

          {visible.map((t) => {
            const coords = t.points.map((p) => [xScale(new Date(p.date).getTime()), yScale(p.value)]);
            const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
            return (
              <g key={t.participant.id}>
                {coords.length > 1 && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={t.color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}
                {coords.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill={t.color} stroke={CHROME.ring} strokeWidth="2" />
                ))}
              </g>
            );
          })}

          {endLabels.map((label) => (
            <text
              key={label.id}
              x={margin.left + plotWidth + 8}
              y={label.y}
              dy="0.32em"
              fontSize="11"
              fontWeight="600"
              fill="#404040"
            >
              {label.name.length > 14 ? `${label.name.slice(0, 13)}…` : label.name}
            </text>
          ))}

          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverX(null)}
          />
        </svg>

        {hoverRows.length > 0 && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-48 -translate-x-1/2 border border-gray-200 bg-white p-2.5 shadow-[var(--shadow-popover)]"
            style={{ left: tooltipLeft }}
          >
            <p className="mb-1.5 text-[11px] font-medium text-gray-400">
              {formatTooltipDate(hoverTime)}
            </p>
            <ul className="flex flex-col gap-1">
              {hoverRows.map((row) => (
                <li key={row.id} className="flex items-center gap-1.5 text-xs">
                  <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                  <span className="min-w-0 flex-1 truncate text-gray-600">{row.name}</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(row.value).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
