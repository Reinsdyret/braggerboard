import { useState } from "react";
import { Trash2, Users } from "lucide-react";
import Avatar from "./Avatar.jsx";
import ConfirmDialog from "./ui/ConfirmDialog.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import StreakBadge from "./StreakBadge.jsx";
import { cx } from "../utils/cx.js";
import { computeStreak } from "../utils/streak.js";

const RANK_COLOR = { 1: "gold", 2: "silver", 3: "bronze" };
const RANK_BADGE_CLASS = {
  gold: "bg-amber-100 text-amber-800",
  silver: "bg-gray-200 text-gray-700",
  bronze: "bg-orange-100 text-orange-800",
};

function RankBadge({ rank }) {
  const color = RANK_COLOR[rank];
  return (
    <span
      className={cx(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        color ? RANK_BADGE_CLASS[color] : "text-neutral-text-subtle",
      )}
    >
      {rank}
    </span>
  );
}

export default function StandingsTable({ participants, onDelete, onSelect, scoringMode = "WIN_COUNT", matches = [] }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const historyNoun = scoringMode === "ELO" ? "match" : "round";

  if (participants.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No participants yet"
        description="Add someone below to get started."
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-neutral-border-subtle border border-neutral-border-subtle bg-neutral-surface-default">
        {participants.map((p, index) => {
          const rank = index + 1;
          const score = scoringMode === "ELO" ? p.rating : p.totalWins;
          const streak = scoringMode === "ELO" ? computeStreak(p.id, matches) : null;
          return (
            <li key={p.id} className="flex items-center">
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-surface-tinted sm:px-5 sm:py-3.5"
              >
                <RankBadge rank={rank} />
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar participant={p} rankColor={RANK_COLOR[rank]} />
                  <span className="truncate text-sm font-medium text-neutral-text-default">{p.name}</span>
                  <StreakBadge streak={streak} size="sm" />
                </div>
                <span className="text-sm font-bold text-neutral-text-default">{score}</span>
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(p)}
                className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-text-subtle transition-colors hover:bg-danger-background-tinted hover:text-danger-text-default active:bg-danger-surface-hover sm:mr-5"
                aria-label={`Remove ${p.name}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove ${pendingDelete?.name}?`}
        description={`This also deletes their ${historyNoun} history. This can't be undone.`}
        confirmLabel="Remove"
        danger
        onConfirm={() => onDelete(pendingDelete)}
      />
    </>
  );
}
