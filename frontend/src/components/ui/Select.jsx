import { cx } from "../../utils/cx.js";

export default function Select({ className, ...props }) {
  return (
    <select
      className={cx(
        "h-11 w-full rounded-lg border border-gray-400 bg-white px-3 text-sm text-gray-900 outline-none transition-colors",
        "hover:border-gray-400 focus:border-brand-500 focus:outline focus:outline-1 focus:outline-brand-500",
        className,
      )}
      {...props}
    />
  );
}
