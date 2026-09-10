import { cx } from "../../utils/cx.js";

export default function Input({ className, error, ...props }) {
  return (
    <input
      className={cx(
        "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors",
        "placeholder:text-gray-400",
        "hover:border-gray-400 focus:border-brand-500 focus:outline focus:outline-1 focus:outline-brand-500",
        error ? "border-[#9c0f0f]" : "border-gray-400",
        className,
      )}
      {...props}
    />
  );
}
