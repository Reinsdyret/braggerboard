import { useState } from "react";
import { Zap, Pencil, Trash2 } from "lucide-react";
import { Badge, Card, CardContent } from "@kilden/designsystem";
import EmptyState from "./ui/EmptyState.jsx";
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

const OUTCOME_VARIANT = {
  TEAM_A: "default",
  TEAM_B: "default",
  DRAW: "secondary",
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
      <div className="flex flex-col gap-3">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardContent className="pt-6">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <Badge variant={OUTCOME_VARIANT[match.outcome]}>{OUTCOME_LABEL[match.outcome]}</Badge>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="mr-1 text-xs text-neutral-text-subtle">{formatDate(match.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => onEdit(match)}
                    aria-label="Edit match"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-text-subtle transition-colors hover:bg-neutral-surface-tinted hover:text-neutral-text-default"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(match)}
                    aria-label="Delete match"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-text-subtle transition-colors hover:bg-danger-background-tinted hover:text-danger-text-default"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={
                    match.outcome === "TEAM_A"
                      ? "font-semibold text-neutral-text-default"
                      : "text-neutral-text-subtle"
                  }
                >
                  {teamNames(match.teamA)}
                </span>
                <span className="text-xs font-semibold text-neutral-text-subtle">vs</span>
                <span
                  className={
                    match.outcome === "TEAM_B"
                      ? "font-semibold text-neutral-text-default"
                      : "text-neutral-text-subtle"
                  }
                >
                  {teamNames(match.teamB)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
