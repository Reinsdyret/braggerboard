import { Trophy02, Clock } from "@untitledui/icons";
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
    <ul className="flex flex-col gap-3">
      {rounds.map((round) => (
        <li
          key={round.id}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy02 size={16} className="text-brand-500" />
              <strong className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {round.label || "Round"}
              </strong>
            </div>
            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
              {formatDate(round.createdAt)}
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {round.results.map((result) => (
              <li
                key={result.participantId}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                {result.participantName}{" "}
                <span className="font-bold text-gray-800 dark:text-gray-100">×{result.wins}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
