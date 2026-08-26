import { TrendUp01, TrendDown01 } from "@untitledui/icons";
import { cx } from "../utils/cx.js";

export default function StreakBadge({ streak, size = "md" }) {
  if (!streak || streak.length < 2) return null;

  const isWin = streak.type === "win";
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[11px] gap-0.5" : "px-2 py-1 text-xs gap-1";

  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full font-semibold",
        isWin ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600",
        sizeClass,
      )}
    >
      {isWin ? <TrendUp01 size={size === "sm" ? 11 : 12} /> : <TrendDown01 size={size === "sm" ? 11 : 12} />}
      {streak.length}
      {isWin ? "W" : "L"}
    </span>
  );
}
