import { Avatar as KildenAvatar, AvatarImage, AvatarFallback } from "@kilden/designsystem";
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
  const ringClass = rankColor ? cx("ring-2 ring-offset-2", RING_COLORS[rankColor]) : "";

  return (
    <KildenAvatar className={cx(sizeClass, ringClass)}>
      {participant.hasImage && (
        <AvatarImage src={participantImageUrl(participant.id)} alt={participant.name} />
      )}
      <AvatarFallback className="bg-accent-background-tinted font-semibold text-accent-text-default">
        {initials(participant.name)}
      </AvatarFallback>
    </KildenAvatar>
  );
}
