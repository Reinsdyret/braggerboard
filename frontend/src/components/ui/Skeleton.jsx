import { cx } from "../../utils/cx.js";

export default function Skeleton({ className }) {
  return <div className={cx("animate-pulse rounded-lg bg-gray-200", className)} />;
}
