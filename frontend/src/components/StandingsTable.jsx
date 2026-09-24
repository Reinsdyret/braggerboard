import { useState } from "react";
import { Trash2, Users } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@kilden/designsystem";
import Avatar from "./Avatar.jsx";
import DeleteParticipantDialog from "./DeleteParticipantDialog.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import StreakBadge from "./StreakBadge.jsx";
import RankMovement from "./RankMovement.jsx";
import { cx } from "../utils/cx.js";
import { MIN_MATCHES_TO_RANK } from "../constants.js";
import { computeStreak } from "../utils/streak.js";
import { computeHeadToHead } from "../utils/headToHead.js";
import { formatRelativeTime } from "../utils/relativeTime.js";
import { computeRankMovement } from "../utils/rankMovement.js";

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
      {rank ?? "–"}
    </span>
  );
}

function StatCell({ value }) {
  return <div className="w-10 text-center text-sm font-semibold text-neutral-text-default">{value}</div>;
}

function HeaderCell({ label, title }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="w-10 cursor-default text-center">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="top">{title}</TooltipContent>
    </Tooltip>
  );
}

// Full class strings (not built by concatenation) so Tailwind picks them up. The movement column
// is an extra fixed-width track right after the player column, so it lines up down every row.
function headerGridCols(isElo, showMovement) {
  if (isElo) return showMovement ? "grid-cols-[auto_1fr_auto_auto_auto]" : "grid-cols-[auto_1fr_auto_auto]";
  return showMovement ? "grid-cols-[auto_1fr_auto_auto]" : "grid-cols-[auto_1fr_auto]";
}

function rowGridCols(isElo, showMovement) {
  if (isElo) {
    return showMovement
      ? "grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto]"
      : "grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto]";
  }
  return showMovement ? "grid-cols-[auto_1fr_auto_auto]" : "grid-cols-[auto_1fr_auto]";
}

function ColumnHeaders({ isElo, showMovement }) {
  return (
    <li className="flex items-center max-sm:hidden" aria-hidden="true">
      <div
        className={cx(
          "grid flex-1 items-center gap-3 px-4 py-2 text-[11px] font-semibold tracking-wide text-neutral-text-subtle uppercase sm:px-5",
          headerGridCols(isElo, showMovement),
        )}
      >
        <span className="w-6" />
        <span>Player</span>
        {showMovement && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-7 cursor-default text-center">Wk</span>
            </TooltipTrigger>
            <TooltipContent side="top">Rank change since start of week</TooltipContent>
          </Tooltip>
        )}
        {isElo && (
          <div className="flex items-center gap-2">
            <HeaderCell label="P" title="Played" />
            <HeaderCell label="W" title="Won" />
            <HeaderCell label="L" title="Lost" />
            <HeaderCell label="%" title="Win rate" />
          </div>
        )}
        <span className="w-16 text-right">{isElo ? "Rating" : "Wins"}</span>
      </div>
      <div className="mr-4 h-9 w-9 shrink-0 sm:mr-5" />
    </li>
  );
}

// Shared by the ranked list and the provisional group - the identical grid classes are what keep
// the two groups' columns lined up. A null rank renders a dash and drops the medal styling.
function StandingRow({ participant: p, rank, isElo, matches, movement, showMovement, onSelect, onDelete }) {
  const score = isElo ? p.rating : p.totalWins;
  const streak = isElo ? computeStreak(p.id, matches) : null;
  const record = isElo ? computeHeadToHead(p.id, matches) : null;
  const winPct = record && record.played > 0 ? Math.round((record.wins / record.played) * 100) : null;
  return (
    <li className={cx("flex items-center", rank === null && "opacity-60")}>
      <button
        type="button"
        onClick={() => onSelect(p)}
        className={cx(
          "grid flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-surface-tinted sm:px-5 sm:py-3.5",
          rowGridCols(isElo, showMovement),
        )}
      >
        <RankBadge rank={rank} />
        <div className="flex min-w-0 items-center gap-3">
          <Avatar participant={p} rankColor={RANK_COLOR[rank]} />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-neutral-text-default">{p.name}</span>
              <StreakBadge streak={streak} size="sm" />
            </div>
            {isElo && (
              <span className="truncate text-xs text-neutral-text-subtle">
                {record.lastPlayedAt ? `Last played ${formatRelativeTime(record.lastPlayedAt)}` : "No matches yet"}
              </span>
            )}
          </div>
        </div>
        {showMovement && <RankMovement movement={movement} />}
        {isElo && (
          <div className="flex items-center gap-2 max-sm:hidden">
            <StatCell value={record.played} />
            <StatCell value={record.wins} />
            <StatCell value={record.losses} />
            <StatCell value={winPct === null ? "-" : `${winPct}%`} />
          </div>
        )}
        <div className="flex w-16 flex-col items-end gap-0.5">
          {isElo && (
            <span className="text-xs text-neutral-text-subtle sm:hidden">
              {record.wins}-{record.losses}
            </span>
          )}
          <span className="text-sm font-bold text-neutral-text-default">{score}</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onDelete(p)}
        className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-text-subtle transition-colors hover:bg-danger-background-tinted hover:text-danger-text-default active:bg-danger-surface-hover sm:mr-5"
        aria-label={`Remove ${p.name}`}
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default function StandingsTable({
  participants,
  provisional = [],
  onDelete,
  onSelect,
  scoringMode = "WIN_COUNT",
  matches = [],
  rounds = [],
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const isElo = scoringMode === "ELO";
  const historyNoun = isElo ? "match" : "round";

  // Empty on a board with no history older than the window - there is no movement to show yet,
  // and the column collapses rather than labelling every row "new".
  const movement = computeRankMovement({ participants, matches, rounds, scoringMode });
  const showMovement = movement.size > 0;

  if (participants.length === 0 && provisional.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No participants yet"
        description="Add someone below to get started."
      />
    );
  }

  const rowProps = { isElo, matches, showMovement, onSelect, onDelete: setPendingDelete };

  return (
    <>
      <ul className="divide-y divide-neutral-border-subtle border border-neutral-border-subtle bg-neutral-surface-default">
        <ColumnHeaders isElo={isElo} showMovement={showMovement} />
        {participants.map((p, index) => (
          <StandingRow
            key={p.id}
            participant={p}
            rank={index + 1}
            movement={movement.get(p.id)}
            {...rowProps}
          />
        ))}
        {provisional.length > 0 && (
          <li className="bg-neutral-surface-tinted px-4 py-2 text-[11px] font-semibold tracking-wide text-neutral-text-subtle uppercase sm:px-5">
            Provisional · fewer than {MIN_MATCHES_TO_RANK} matches played
          </li>
        )}
        {provisional.map((p) => (
          <StandingRow key={p.id} participant={p} rank={null} {...rowProps} />
        ))}
      </ul>

      <DeleteParticipantDialog
        participant={pendingDelete}
        historyNoun={historyNoun}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={(password) => onDelete(pendingDelete, password)}
      />
    </>
  );
}
