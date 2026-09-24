import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cx } from "../utils/cx.js";

/**
 * The climbed / fell / held indicator that sits to the left of a standing's rank. Renders an
 * empty slot of the same width when there's nothing to say about a row, so the column below it
 * stays aligned.
 */
export default function RankMovement({ movement }) {
  if (!movement) return <span className="w-7 shrink-0" aria-hidden="true" />;

  const { previousRank, delta } = movement;

  if (previousRank === null) {
    return (
      <span className="w-7 shrink-0 text-center text-[10px] font-bold tracking-tight text-accent-text-default uppercase">
        New
        <span className="sr-only"> to the rankings this week</span>
      </span>
    );
  }

  const climbed = delta > 0;
  const Icon = delta === 0 ? Minus : climbed ? ArrowUp : ArrowDown;
  const places = Math.abs(delta);

  return (
    <span
      className={cx(
        "flex w-7 shrink-0 items-center justify-center gap-px text-[11px] font-semibold tabular-nums",
        // *-text-subtle, not *-text-default: the "default" text tokens are near-black and only
        // read as green/red on a tinted background (see StreakBadge). These arrows sit on the
        // bare row, so they need the hued token to show any colour at all.
        delta === 0
          ? "text-neutral-text-subtle"
          : climbed
            ? "text-success-text-subtle"
            : "text-danger-text-subtle",
      )}
    >
      <Icon size={11} strokeWidth={2.5} aria-hidden="true" />
      {delta !== 0 && places}
      <span className="sr-only">
        {delta === 0
          ? "Unchanged since Monday"
          : `${climbed ? "Up" : "Down"} ${places} ${places === 1 ? "place" : "places"} since Monday`}
      </span>
    </span>
  );
}
