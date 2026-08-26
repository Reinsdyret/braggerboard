import { cx } from "../../utils/cx.js";

export default function Select({ className, ...props }) {
  return (
    <select
      className={cx(
        "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition-colors",
        "focus:ring-3 focus:ring-brand-500/20 focus:border-brand-500",
        "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
        className,
      )}
      {...props}
    />
  );
}
