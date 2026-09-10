import { TrendingUp, TrendingDown } from "lucide-react";
import { cx } from "../utils/cx.js";

export default function StreakBadge({ streak, size = "md" }) {
  if (!streak || streak.length < 2) return null;

  const isWin = streak.type === "win";
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[11px] gap-0.5" : "px-2 py-1 text-xs gap-1";

  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full font-semibold",
        isWin
          ? "bg-green-100 text-green-700"
          : "bg-[#ffebee] text-[#9c0f0f]",
        sizeClass,
      )}
    >
      {isWin ? <TrendingUp size={size === "sm" ? 11 : 12} /> : <TrendingDown size={size === "sm" ? 11 : 12} />}
      {streak.length}
      {isWin ? "W" : "L"}
    </span>
  );
}
