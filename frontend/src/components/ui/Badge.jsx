import { cx } from "../../utils/cx.js";

const COLORS = {
  gold: "bg-amber-100 text-amber-800 ring-1 ring-amber-600/20",
  silver: "bg-gray-100 text-gray-700 ring-1 ring-gray-500/20",
  bronze: "bg-orange-100 text-orange-800 ring-1 ring-orange-600/20",
  brand: "bg-brand-100 text-brand-700 ring-1 ring-brand-600/20",
  gray: "bg-gray-100 text-gray-600 ring-1 ring-gray-500/10",
};

export default function Badge({ color = "gray", className, children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
        COLORS[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
