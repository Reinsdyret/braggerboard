import { Trophy, Clock } from "lucide-react";
import { Card, CardContent } from "@kilden/designsystem";
import EmptyState from "./ui/EmptyState.jsx";

function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RoundHistory({ rounds }) {
  if (rounds.length === 0) {
    return (
      <EmptyState icon={Clock} title="No rounds recorded yet" description="Add a round above once you've played." />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rounds.map((round) => (
        <Card key={round.id}>
          <CardContent className="pt-6">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-neutral-text-default" />
                <strong className="text-sm font-semibold text-neutral-text-default">
                  {round.label || "Round"}
                </strong>
              </div>
              <span className="shrink-0 text-xs text-neutral-text-subtle">
                {formatDate(round.createdAt)}
              </span>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {round.results.map((result) => (
                <li
                  key={result.participantId}
                  className="rounded-full bg-neutral-surface-tinted px-2.5 py-1 text-xs font-medium text-neutral-text-subtle"
                >
                  {result.participantName}{" "}
                  <span className="font-bold text-neutral-text-default">×{result.wins}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
