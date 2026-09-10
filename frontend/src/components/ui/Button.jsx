import { Button as AriaButton } from "react-aria-components";
import { Loader2 } from "lucide-react";
import { cx } from "../../utils/cx.js";

// Colors and states mirror Timer's real ._primaryButton_/._secondaryButton_ exactly: solid
// black primary (not a brand color), white secondary with a black border, disabled fill #f4f4f4.
const VARIANTS = {
  primary:
    "border border-gray-900 bg-gray-900 text-white hover:bg-gray-600 hover:border-gray-600 data-[pressed]:bg-gray-800 data-[disabled]:border-transparent data-[disabled]:bg-gray-100 data-[disabled]:text-gray-900",
  secondary:
    "bg-white text-gray-900 border border-gray-900 hover:bg-gray-200 data-[pressed]:bg-gray-300 data-[disabled]:border-gray-200 data-[disabled]:text-gray-400",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 data-[pressed]:bg-gray-200 data-[disabled]:text-gray-300",
  danger:
    "bg-transparent text-[#9c0f0f] hover:bg-[#ffebee] data-[pressed]:bg-[#ffdce0] data-[disabled]:text-gray-300",
  "danger-solid":
    "bg-[#9c0f0f] text-white border border-[#9c0f0f] hover:bg-[#7c0c0c] hover:border-[#7c0c0c] data-[pressed]:bg-[#5e0909] data-[disabled]:border-transparent data-[disabled]:bg-gray-100 data-[disabled]:text-gray-900",
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
        "inline-flex items-center justify-center rounded-lg font-normal whitespace-nowrap transition-colors duration-100 outline-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        "cursor-pointer data-[disabled]:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin-slow" />
      ) : (
        IconLeading && <IconLeading size={16} />
      )}
      {children}
      {!isLoading && IconTrailing && <IconTrailing size={16} />}
    </AriaButton>
  );
}
