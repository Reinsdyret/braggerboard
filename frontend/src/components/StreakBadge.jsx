import { TrendingUp, TrendingDown } from "lucide-react";
import { cx } from "../utils/cx.js";

export default function StreakBadge({ streak, size = "md" }) {
  if (!streak || streak.length < 2) return null;

  const isWin = streak.type === "win";
  const sizeClass = size === "sm" ? "px-2 py-1 text-[11px] gap-1" : "px-2.5 py-1.5 text-xs gap-1.5";

  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full font-semibold",
        isWin
          ? "bg-success-background-tinted text-success-text-default"
          : "bg-danger-background-tinted text-danger-text-default",
        sizeClass,
      )}
    >
      {isWin ? <TrendingUp size={size === "sm" ? 11 : 12} /> : <TrendingDown size={size === "sm" ? 11 : 12} />}
      {streak.length}
      {isWin ? "W" : "L"}
    </span>
  );
}
