import { useState } from "react";
import { Zap, Pencil01, Trash02 } from "@untitledui/icons";
import EmptyState from "./ui/EmptyState.jsx";
import Badge from "./ui/Badge.jsx";
import ConfirmDialog from "./ui/ConfirmDialog.jsx";

function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function teamNames(team) {
  return team.map((p) => p.participantName).join(" & ");
}

const OUTCOME_LABEL = {
  TEAM_A: "Team A won",
  TEAM_B: "Team B won",
  DRAW: "Draw",
};

const OUTCOME_COLOR = {
  TEAM_A: "brand",
  TEAM_B: "brand",
  DRAW: "gray",
};

export default function MatchHistory({ matches, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  if (matches.length === 0) {
    return (
      <EmptyState icon={Zap} title="No matches recorded yet" description="Add a match above once you've played." />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {matches.map((match) => (
          <li
            key={match.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5"
          >
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <Badge color={OUTCOME_COLOR[match.outcome]}>{OUTCOME_LABEL[match.outcome]}</Badge>
              <div className="flex shrink-0 items-center gap-1">
                <span className="mr-1 text-xs text-gray-400">{formatDate(match.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => onEdit(match)}
                  aria-label="Edit match"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil01 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(match)}
                  aria-label="Delete match"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash02 size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={match.outcome === "TEAM_A" ? "font-semibold text-gray-900" : "text-gray-600"}>
                {teamNames(match.teamA)}
              </span>
              <span className="text-xs font-semibold text-gray-400">vs</span>
              <span className={match.outcome === "TEAM_B" ? "font-semibold text-gray-900" : "text-gray-600"}>
                {teamNames(match.teamB)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this match?"
        description="Ratings will be recalculated as if it never happened. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => onDelete(pendingDelete)}
      />
    </>
  );
}
