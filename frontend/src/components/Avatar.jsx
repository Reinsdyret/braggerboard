import { participantImageUrl } from "../api.js";
import { cx } from "../utils/cx.js";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const RING_COLORS = {
  gold: "ring-amber-400",
  silver: "ring-gray-400",
  bronze: "ring-orange-400",
};

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ participant, size = "md", rankColor }) {
  const sizeClass = SIZES[size];
  const ringClass = rankColor
    ? cx("ring-2 ring-offset-2 dark:ring-offset-gray-800", RING_COLORS[rankColor])
    : "";

  if (participant.hasImage) {
    return (
      <img
        className={cx("shrink-0 rounded-full object-cover", sizeClass, ringClass)}
        src={participantImageUrl(participant.id)}
        alt={participant.name}
      />
    );
  }

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-400/15 dark:text-brand-300",
        sizeClass,
        ringClass,
      )}
    >
      {initials(participant.name)}
    </div>
  );
}
