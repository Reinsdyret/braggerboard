import { Button as AriaButton } from "react-aria-components";
import { Loading03 } from "@untitledui/icons";
import { cx } from "../../utils/cx.js";

const VARIANTS = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 data-[pressed]:bg-brand-800 data-[disabled]:bg-gray-200 data-[disabled]:text-gray-400",
  secondary:
    "bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 data-[pressed]:bg-gray-100 data-[disabled]:text-gray-300",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 data-[pressed]:bg-gray-200 data-[disabled]:text-gray-300",
  danger:
    "bg-transparent text-red-600 hover:bg-red-50 data-[pressed]:bg-red-100 data-[disabled]:text-gray-300",
  "danger-solid":
    "bg-red-600 text-white shadow-sm hover:bg-red-700 data-[pressed]:bg-red-800 data-[disabled]:bg-gray-200 data-[disabled]:text-gray-400",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  className,
  children,
  ...props
}) {
  return (
    <AriaButton
      isDisabled={isDisabled || isLoading}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors duration-100 outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "cursor-pointer data-[disabled]:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Loading03 size={16} className="animate-spin-slow" />
      ) : (
        IconLeading && <IconLeading size={16} />
      )}
      {children}
      {!isLoading && IconTrailing && <IconTrailing size={16} />}
    </AriaButton>
  );
}
