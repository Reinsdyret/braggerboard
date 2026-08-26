import { cx } from "../../utils/cx.js";

export default function Input({ className, error, ...props }) {
  return (
    <input
      className={cx(
        "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 shadow-sm outline-none transition-colors",
        "placeholder:text-gray-400",
        "focus:ring-3 focus:ring-brand-500/20 focus:border-brand-500",
        error ? "border-red-300" : "border-gray-300",
        className,
      )}
      {...props}
    />
  );
}
