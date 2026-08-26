import { cx } from "../../utils/cx.js";

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
